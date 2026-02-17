import React, { useMemo, useEffect, useRef, useState, useImperativeHandle, forwardRef, ForwardRefRenderFunction } from 'react'
import { createPortal } from 'react-dom'
import { Gantt, Task as GanttTask, ViewMode, CustomHeaderRenderProps } from '@wamra/gantt-task-react'
import '@wamra/gantt-task-react/dist/style.css'
import { useTranslation } from 'react-i18next'
import { Task } from '@/store/project/interfaces'
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences'
import { useTaskEstimation } from '@/hooks/task/useTaskEstimation'
import { useTaskWorkVisualization } from '@/hooks/task/useTaskWorkVisualization'
import { ProfessionalTimelineHeader } from './ProfessionalTimelineHeader'
import { CalendarDateService } from '@/services/CalendarDateService'
import { DurationSyncService } from '@/domain/services/DurationSyncService'
import { GanttViewModeService } from '@/services/GanttViewModeService'
import { GanttRangeService } from '@/services/GanttRangeService'
import { GanttTaskMapper, ExtendedGanttTask } from '@/services/GanttTaskMapper'
import { GanttScrollService } from '@/services/GanttScrollService'
import { ColorUtils } from '@/utils/ColorUtils'
import { BaselineOverlay } from './BaselineOverlay'
import { PulseOverlay } from './PulseOverlay'
import { useAppStore } from '@/store/appStore'
import { useProjectStore } from '@/store/projectStore'
import { Check, X } from 'lucide-react'

export interface ProfessionalGanttHandle {
  scrollToPosition: (position: number) => void;
  scrollToDate: (date: Date) => void;
  scrollLeft: () => void;
  scrollRight: () => void;
  getCurrentScroll: () => number;
}

/**
 * Интерфейс обновления задачи при изменении на Ганте.
 * КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Добавлено поле duration для синхронизации с Java Core.
 */
interface GanttTaskUpdatePayload {
  startDate: Date;
  endDate: Date;
  progress: number;
  /** Длительность в днях - КРИТИЧЕСКИ ВАЖНО для CPM расчётов в Java Core */
  duration: number;
}

interface ProfessionalGanttProps {
  tasks: Task[];
  onTaskUpdate?: (taskId: string, updates: GanttTaskUpdatePayload) => void;
  onTaskSelect?: (task: Task) => void;
  onTaskDoubleClick?: (task: Task) => void;
  zoomLevel?: number;
  mode?: 'standard' | 'tracking';
  forcedEndDate?: Date | null;
  targetDate?: Date | null;
  /** GANTT-NAV: viewDate prop для нативной навигации библиотеки @wamra/gantt-task-react */
  viewDate?: Date | null;
  onNavigationComplete?: () => void;
  /** GANTT-NAV-V3: Минимальная дата для расширения диапазона навигации */
  minDate?: Date;
  /** GANTT-NAV-V3: Максимальная дата для расширения диапазона навигации */
  maxDate?: Date;
  /** Ref для синхронизации вертикального скролла с таблицей задач */
  scrollRef?: React.RefObject<HTMLDivElement>;
  /** Callback при прокрутке для синхронизации */
  onScroll?: () => void;
}

const ProfessionalGanttRender: ForwardRefRenderFunction<ProfessionalGanttHandle, ProfessionalGanttProps> = (props: ProfessionalGanttProps, ref: React.ForwardedRef<ProfessionalGanttHandle>) => {
  const { tasks, onTaskUpdate, onTaskSelect, onTaskDoubleClick, zoomLevel = 1, mode = 'standard', forcedEndDate, targetDate, viewDate, onNavigationComplete, minDate, maxDate, scrollRef: externalScrollRef, onScroll: externalOnScroll } = props
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollServiceRef = useRef<GanttScrollService | null>(null)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [svgElement, setSvgElement] = useState<SVGElement | null>(null)

  const { preferences } = useUserPreferences()
  const isPulseActive = useAppStore(state => state.ui.isPulseActive)
  const { resources, calendars, baselines, activeBaselineId } = useProjectStore()
  const activeBaseline = useMemo(() => baselines.find(b => b.id === activeBaselineId), [baselines, activeBaselineId])
  const { getFormattedName } = useTaskEstimation()
  const { getVisualProgress, showBaseline } = useTaskWorkVisualization(mode as 'standard' | 'tracking')

  const viewMode = useMemo(() => GanttViewModeService.getViewMode(zoomLevel), [zoomLevel])
  const columnWidth = useMemo(() => GanttViewModeService.getColumnWidth(zoomLevel), [zoomLevel])
  const projectRange = useMemo(() => {
    return GanttRangeService.calculateRange(tasks, dimensions.width, zoomLevel, viewMode, forcedEndDate)
  }, [tasks, dimensions.width, zoomLevel, viewMode, forcedEndDate])

  const ganttTasks = useMemo(() => {
    return GanttTaskMapper.mapToGanttTasks(
      tasks,
      dimensions.height,
      projectRange,
      getVisualProgress,
      getFormattedName,
      showBaseline,
      mode,
      preferences.gantt,
      isPulseActive,
      resources,
      calendars,
      activeBaseline,
      t,
    )
  }, [tasks, dimensions.height, projectRange, getVisualProgress, getFormattedName, showBaseline, mode, preferences.gantt, isPulseActive, resources, calendars, activeBaseline, t])

  // GANTT-NAV-V2: viewDate передаётся напрямую в библиотеку без трансформаций
  // Библиотека сама ограничивает index в допустимом диапазоне [0, datesLength-1]
  // targetDate поддержан для обратной совместимости, viewDate имеет приоритет
  const effectiveViewDate = targetDate ?? viewDate ?? projectRange.start
  
  useImperativeHandle(ref, () => ({
    scrollToPosition: (pos: number) => {
      scrollServiceRef.current?.scrollToPosition(pos)
    },
    scrollToDate: (_date: Date) => { 
      // GANTT-NAV-V2: Навигация теперь управляется через viewDate prop из родителя
      // Этот метод сохранён для обратной совместимости API
    },
    scrollLeft: () => {
      // GANTT-NAV-V2: Навигация управляется родительским компонентом
    },
    scrollRight: () => {
      // GANTT-NAV-V2: Навигация управляется родительским компонентом
    },
    getCurrentScroll: () => scrollLeft,
  }))

  // Инициализация сервиса и поиск SVG
  useEffect(() => {
    const findContainer = () => {
      const el = containerRef.current?.querySelector('div[style*="overflow: auto"]') as HTMLElement
      if (el) {
        scrollServiceRef.current = new GanttScrollService(el)
        const svg = el.querySelector('svg') as SVGElement
        if (svg) setSvgElement(svg)
        console.log('[ProfessionalGantt] GanttScrollService and SVG initialized')
        return true
      }
      return false
    }

    if (!findContainer()) {
      const interval = setInterval(() => { if (findContainer()) clearInterval(interval) }, 50)
      return () => { clearInterval(interval); scrollServiceRef.current?.dispose() }
    }
    return () => scrollServiceRef.current?.dispose()
  }, [])

  // GANTT-FIX: Навигация по targetDate обрабатывается через viewDate prop библиотеки (effectiveViewDate).
  // Дублирующий DOM-скролл через GanttScrollService удалён — он конкурировал с viewDate и
  // использовал неработающий селектор div[style*="overflow: auto"].
  // После отрисовки библиотекой уведомляем о завершении навигации для сброса targetDate.
  useEffect(() => {
    if (targetDate) {
      // Даём библиотеке 1 кадр на обработку viewDate, затем сигнализируем завершение
      const rafId = requestAnimationFrame(() => {
        onNavigationComplete?.()
      })
      return () => cancelAnimationFrame(rafId)
    }
  }, [targetDate, onNavigationComplete])

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(containerRef.current)

    let scrollEl: HTMLElement | null = null, rafId = 0, lastScroll = 0
    const rafLoop = () => {
      if (!scrollEl) {
        // GANTT-SCROLL-FIX: Библиотека использует overflow-x: scroll через CSS класс ganttTaskRoot,
        // а не через inline style. Ищем элемент по классу, а не по атрибуту style.
        scrollEl = containerRef.current?.querySelector('div[class*="ganttTaskRoot"]') as HTMLElement
        
        // Fallback: если класс не найден, ищем любой div с overflow-x: scroll через computed style
        if (!scrollEl) {
          const divs = Array.from(containerRef.current?.querySelectorAll('.gantt-hide-list > div') || []) as HTMLElement[]
          scrollEl = divs.find(el => {
            const style = window.getComputedStyle(el)
            return style.overflowX === 'scroll' || style.overflowX === 'auto'
          }) || null
        }
      }
      
      if (scrollEl && scrollEl.scrollLeft !== lastScroll) {
        lastScroll = scrollEl.scrollLeft
        setScrollLeft(lastScroll)
      }
      rafId = requestAnimationFrame(rafLoop)
    }
    rafId = requestAnimationFrame(rafLoop)
    return () => { observer.disconnect(); cancelAnimationFrame(rafId) }
  }, [ganttTasks.length])

  // GANTT-ZOOM-SYNC: Принудительная синхронизация scrollLeft при изменении масштаба
  useEffect(() => {
    const scrollEl = containerRef.current?.querySelector('div[class*="ganttTaskRoot"]') as HTMLElement
    if (scrollEl && scrollEl.scrollLeft !== scrollLeft) {
      setScrollLeft(scrollEl.scrollLeft)
    }
  }, [columnWidth, viewMode])

  // GANTT-VERTICAL-SCROLL: Поиск вертикально скроллируемого элемента для синхронизации с таблицей задач
  useEffect(() => {
    if (!externalScrollRef || !externalOnScroll || !containerRef.current) return

    const findVerticalScrollElement = () => {
      // Ищем элемент ganttTaskContent - он содержит вертикальный скролл
      // Путь: .gantt-hide-list > div (корень библиотеки) > div.ganttTaskRoot > div.ganttTaskContent
      const ganttRoot = containerRef.current?.querySelector('.gantt-hide-list > div')
      if (!ganttRoot) return null

      const ganttTaskContent = ganttRoot.querySelector('div[class*="ganttTaskContent"]') as HTMLElement
      if (ganttTaskContent) {
        const style = window.getComputedStyle(ganttTaskContent)
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
          return ganttTaskContent
        }
      }

      // Fallback: ищем любой элемент с вертикальным скроллом
      const divs = Array.from(ganttRoot?.querySelectorAll('div') || []) as HTMLElement[]
      return divs.find(el => {
        const style = window.getComputedStyle(el)
        return style.overflowY === 'auto' || style.overflowY === 'scroll'
      }) || null
    }

    let scrollElement: HTMLElement | null = null
    const intervalId = setInterval(() => {
      scrollElement = findVerticalScrollElement()
      if (scrollElement) {
        clearInterval(intervalId)
        // Устанавливаем ref для синхронизации
        if (externalScrollRef && typeof externalScrollRef === 'object' && 'current' in externalScrollRef) {
          (externalScrollRef as React.MutableRefObject<HTMLElement | null>).current = scrollElement
        }
        // Подписываемся на событие прокрутки
        scrollElement.addEventListener('scroll', externalOnScroll)
        console.log('[ProfessionalGantt] Vertical scroll element found and synchronized')
      }
    }, 50)

    // Таймаут безопасности: если за 2 секунды не нашли - отменяем поиск
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId)
      if (!scrollElement) {
        console.warn('[ProfessionalGantt] Vertical scroll element not found after 2 seconds')
      }
    }, 2000)

    return () => {
      clearInterval(intervalId)
      clearTimeout(timeoutId)
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', externalOnScroll)
      }
    }
  }, [externalScrollRef, externalOnScroll, ganttTasks.length])

  // GANTT-DATE-DEBUG: Логирование финальных задач перед передачей в библиотеку
  React.useEffect(() => {
    if (ganttTasks.length > 0) {
      console.group('[GANTT-DATE-DEBUG] Задачи перед рендерингом в библиотеке Gantt')
      ganttTasks.forEach((gTask) => {
        if (gTask.type !== 'empty') {
          console.log(`Task "${gTask.name}" (ID: ${gTask.id}):`, {
            start: {
              iso: gTask.start.toISOString(),
              local: `${gTask.start.getFullYear()}-${String(gTask.start.getMonth() + 1).padStart(2, '0')}-${String(gTask.start.getDate()).padStart(2, '0')} ${String(gTask.start.getHours()).padStart(2, '0')}:${String(gTask.start.getMinutes()).padStart(2, '0')}:${String(gTask.start.getSeconds()).padStart(2, '0')}.${String(gTask.start.getMilliseconds()).padStart(3, '0')}`,
            },
            end: {
              iso: gTask.end.toISOString(),
              local: `${gTask.end.getFullYear()}-${String(gTask.end.getMonth() + 1).padStart(2, '0')}-${String(gTask.end.getDate()).padStart(2, '0')} ${String(gTask.end.getHours()).padStart(2, '0')}:${String(gTask.end.getMinutes()).padStart(2, '0')}:${String(gTask.end.getSeconds()).padStart(2, '0')}.${String(gTask.end.getMilliseconds()).padStart(3, '0')}`,
            },
            verification: {
              endIsAtEndOfDay: gTask.end.getHours() === 23 && gTask.end.getMinutes() === 59 && gTask.end.getSeconds() === 59,
              endTime: `${gTask.end.getHours()}:${gTask.end.getMinutes()}:${gTask.end.getSeconds()}.${gTask.end.getMilliseconds()}`,
            },
          })
        }
      })
      console.groupEnd()
    }
  }, [ganttTasks])

  // GANTT-FORK: Render prop для кастомного хедера - синхронные данные из библиотеки
  const renderCustomHeader = useMemo(() => {
    return (headerProps: CustomHeaderRenderProps) => (
      <ProfessionalTimelineHeader
        startDate={headerProps.startDate}
        datesLength={headerProps.datesLength}
        viewMode={headerProps.viewMode}
        columnWidth={headerProps.columnWidth}
        scrollLeft={headerProps.scrollLeft}
        headerHeight={headerProps.headerHeight}
        containerWidth={dimensions.width}
      />
    )
  }, [dimensions.width])

  return (
    <div ref={containerRef} className={`professional-gantt-container w-full h-full bg-white relative gantt-modern-scrollbars ${showBaseline ? 'gantt-baseline-enabled' : ''} ${!preferences.gantt.showGridlines ? 'gantt-hide-grid' : ''} ${preferences.gantt.highlightWeekends ? 'gantt-highlight-weekends' : ''}`}>
      {ganttTasks.length > 0 && dimensions.width > 0 ? (
        <div className="w-full h-full overflow-y-auto gantt-hide-list">
          {/* GANTT-FORK: Используем render prop для кастомного хедера */}
          {/* @ts-ignore - columnWidth не задокументирован в типах, но поддерживается библиотекой */}
          <Gantt tasks={ganttTasks} viewMode={viewMode} columnWidth={columnWidth} headerHeight={50} rowHeight={typeof preferences.gantt.rowHeight === 'number' ? preferences.gantt.rowHeight : 40} ganttHeight={dimensions.height > 0 ? dimensions.height : undefined} locale="ru-RU" listCellWidth="1"
            renderCustomHeader={renderCustomHeader}
            viewDate={effectiveViewDate}
            preStepsCount={0}
            isAdjustToWorkingDates={false}
            minDate={minDate}
            maxDate={maxDate}
            /* GANTT-COLORS: Полная палитра цветов для библиотеки */
            colors={{
              // Фон строк (чередование)
              evenTaskBackgroundColor: '#f5f5f5',
              oddTaskBackgroundColor: '#ffffff',

              // Глобальные дефолты для обычных задач (если task.styles не задан)
              barBackgroundColor: preferences.gantt.accentColor,
              barBackgroundSelectedColor: ColorUtils.darken(preferences.gantt.accentColor, 0.15),
              barProgressColor: ColorUtils.darken(preferences.gantt.accentColor, 0.25),
              barProgressSelectedColor: ColorUtils.darken(preferences.gantt.accentColor, 0.35),

              // Суммарные задачи (Project)
              projectBackgroundColor: preferences.gantt.summaryColor,
              projectBackgroundSelectedColor: ColorUtils.darken(preferences.gantt.summaryColor, 0.15),
              projectProgressColor: ColorUtils.darken(preferences.gantt.summaryColor, 0.25),
              projectProgressSelectedColor: ColorUtils.darken(preferences.gantt.summaryColor, 0.35),

              // Критический путь (на случай если библиотека использует эти ключи)
              barBackgroundCriticalColor: '#ef4444',
              barProgressCriticalColor: '#dc2626',
            }}
            TaskListHeader={() => null}
            TaskListTable={() => null}
            onDateChange={mode === 'tracking' ? undefined : (task, _dependentTasks, _index, _parents, _suggestions) => {
              // GANTT-NAV: Адаптировано для @wamra/gantt-task-react API
              // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Вычисляем duration при изменении размера задачи на Ганте
              if (task.type === 'empty') return // Игнорируем пустые задачи
              const t = task as GanttTask
              // SEMANTIC-FIX: startDate → 00:00:00, endDate → 23:59:59.999
              const s = CalendarDateService.toLocalMidnight(t.start)
              const e = CalendarDateService.toLocalEndOfDay(t.end)
              // Вычисляем duration в днях для синхронизации с Java Core (CPM)
              const duration = DurationSyncService.calculateDurationFromGantt(s, e)
              onTaskUpdate?.(t.id, { startDate: s, endDate: e, progress: Math.round(t.progress) / 100, duration })
            }}
            onProgressChange={mode === 'tracking' ? undefined : (task, _children, _index) => {
              // GANTT-NAV: Адаптировано для @wamra/gantt-task-react API
              // При изменении прогресса сохраняем текущий duration
              const et = task as ExtendedGanttTask
              const currentDuration = et.originalTask?.duration ?? DurationSyncService.calculateDurationFromGantt(task.start, task.end)
              onTaskUpdate?.(task.id, { startDate: task.start, endDate: task.end, progress: Math.round(task.progress) / 100, duration: currentDuration })
            }}
            onClick={(task) => { 
              // GANTT-NAV: onSelect заменён на onClick в @wamra/gantt-task-react
              if (task.type === 'empty') return
              const et = task as ExtendedGanttTask
              // GANTT-FIX: Обработчик очищен от проверок на isFiller (stretcher удалён)
              if (et.originalTask) onTaskSelect?.(et.originalTask) 
            }}
            onDoubleClick={(task) => { 
              // GANTT-NAV: Проверяем тип задачи перед обработкой
              if (task.type === 'empty') return
              const et = task as ExtendedGanttTask
              if (et.originalTask) onTaskDoubleClick?.(et.originalTask) 
            }}
            TooltipContent={({ task: gTask }: { task: GanttTask }) => {
              const et = gTask as ExtendedGanttTask
              const bDates = et.baselineDates
              const diffDays = bDates ? Math.round((new Date(gTask.end).getTime() - new Date(bDates.endDate).getTime()) / (1000 * 60 * 60 * 24)) : 0
              const conflict = et.calendarConflict

              return (
                <div
                  className="bg-white p-3 border border-slate-200 rounded-lg shadow-xl text-xs border-l-4 whitespace-normal break-words"
                  style={{
                    borderLeftColor: gTask.styles?.backgroundColor,
                    width: 'max-content',
                    minWidth: '280px',
                    maxWidth: '450px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div className="font-bold text-slate-900 mb-2 text-sm leading-snug">{gTask.name}</div>

                  {/* Stage 8.20: Календарное предупреждение */}
                  {conflict?.hasConflict && (
                    <div className="mb-2 p-2 bg-orange-50 border-l-2 border-orange-400 rounded w-full">
                      <div className="font-bold text-orange-900 flex items-center gap-1 mb-1">
                        ⚠️ Конфликт графика
                      </div>
                      {conflict.conflictingResources.map((cr, idx) => (
                        <div key={idx} className="text-orange-800 text-[11px] leading-normal mb-0.5 last:mb-0">
                          <span className="font-semibold">{cr.resourceName}</span>
                          <span className="opacity-80"> ({cr.calendarName})</span>: {cr.reason}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* HYBRID-CPM: Предупреждение о нарушении — различаем тип */}
                  {et.originalTask?.dependencyViolation && isPulseActive && (() => {
                    // Проверяем, есть ли у задачи зависимости (predecessors)
                    const hasPredecessors = et.originalTask?.predecessors && et.originalTask.predecessors.length > 0
                    
                    return (
                      <div className="mb-2 p-2 bg-amber-50 border-l-2 border-amber-400 rounded w-full">
                        <div className="font-bold text-amber-900 flex items-center gap-1 mb-1">
                          ⚠️ {hasPredecessors 
                            ? t('gantt.dependency_violation', { defaultValue: 'Нарушение зависимости' })
                            : t('gantt.project_start_violation', { defaultValue: 'Раннее начало проекта' })
                          }
                        </div>
                        <div className="text-amber-800 text-[11px] leading-normal">
                          {hasPredecessors 
                            ? t('gantt.dependency_violation_desc', { 
                                defaultValue: 'Задача размещена раньше, чем позволяют её зависимости. Проверьте связи с предшественниками.'
                              })
                            : t('gantt.project_start_violation_desc', { 
                                defaultValue: 'Задача начинается раньше даты начала проекта.'
                              })
                          }
                        </div>
                        {et.originalTask?.earlyStart && (
                          <div className="text-amber-700 text-[10px] mt-1 opacity-80">
                            {t('gantt.earliest_start', { defaultValue: 'Раннее начало' })}: {et.originalTask.earlyStart.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-500">
                    <span>{t('gantt.tooltip_start', { defaultValue: 'Начало' })}:</span>
                    <span className="text-slate-700">{gTask.start.toLocaleDateString()}</span>
                    <span>{t('gantt.tooltip_end', { defaultValue: 'Конец' })}:</span>
                    <span className="text-slate-700">{gTask.end.toLocaleDateString()}</span>
                    {et.originalTask?.isMilestone ? (
                      <>
                        <span>{t('gantt.tooltip_status', { defaultValue: 'Статус' })}:</span>
                        <span className="flex items-center gap-1.5 text-slate-700">
                          {(et.originalTask?.progress ?? 0) >= 0.5 ? (
                            <><Check className="w-4 h-4 text-green-600 flex-shrink-0" />{t('sheets.milestone_completed')}</>
                          ) : (
                            <><X className="w-4 h-4 text-slate-400 flex-shrink-0" />{t('sheets.milestone_pending')}</>
                          )}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>{t('gantt.tooltip_progress', { defaultValue: 'Прогресс' })}:</span>
                        <span className="text-slate-700">{Math.round(gTask.progress)}%</span>
                      </>
                    )}

                    {isPulseActive && (
                      <>
                        <div className="col-span-2 my-1 border-t border-slate-100" />
                        <span className="font-semibold">{t('gantt.tooltip_critical', { defaultValue: 'Критический путь' })}:</span>
                        <span className={et.originalTask?.isCritical ? 'text-red-500 font-bold' : 'text-slate-500'}>
                          {et.originalTask?.isCritical ? t('common.yes', { defaultValue: 'Да' }) : t('common.no', { defaultValue: 'Нет' })}
                        </span>
                        {/* VB.6: Отображение резерва времени (slack) с поддержкой отрицательных значений */}
                        {!et.originalTask?.isCritical && (et.originalTask?.slack !== undefined || et.originalTask?.totalSlack !== undefined) && (() => {
                          // Приоритет: totalSlack (в днях) > slack (в миллисекундах)
                          const slackInDays = et.originalTask.totalSlack !== undefined 
                            ? et.originalTask.totalSlack 
                            : Math.round(et.originalTask.slack! / (1000 * 60 * 60 * 24))
                          const isNegative = slackInDays < 0
                          const absSlack = Math.abs(slackInDays)
                          
                          return (
                            <>
                              <span className="font-semibold">
                                {isNegative 
                                  ? t('gantt.tooltip_overdue', { defaultValue: 'Просрочка' })
                                  : t('gantt.tooltip_slack', { defaultValue: 'Запас времени' })}:
                              </span>
                              <span className={`font-bold ${isNegative ? 'text-red-500' : 'text-blue-500'}`}>
                                {isNegative ? `-${absSlack}` : absSlack} {t('gantt.days', { defaultValue: 'дн.' })}
                              </span>
                            </>
                          )
                        })()}
                      </>
                    )}

                    {bDates && !et.originalTask?.isSummary && (
                      <>
                        <div className="col-span-2 my-1 border-t border-slate-100" />
                        <span className="font-semibold text-slate-400">{t('gantt.tooltip_baseline', { defaultValue: 'Базовый план' })}:</span>
                        <span className="text-slate-400">{new Date(bDates.endDate).toLocaleDateString()}</span>
                        <span className="font-semibold">{diffDays > 0 ? t('gantt.status_delay', { defaultValue: 'Задержка' }) : diffDays < 0 ? t('gantt.status_ahead', { defaultValue: 'Опережение' }) : t('gantt.status_on_track', { defaultValue: 'По плану' })}:</span>
                        <span className={diffDays > 0 ? 'text-red-500 font-bold' : diffDays < 0 ? 'text-green-500 font-bold' : 'text-slate-500 font-bold'}>
                          {diffDays > 0 ? `+${diffDays}` : diffDays} {t('gantt.days', { defaultValue: 'дн.' })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )
            }}
          />
          {showBaseline && activeBaseline && svgElement && createPortal(
            <BaselineOverlay
              tasks={ganttTasks}
              activeBaseline={activeBaseline}
              projectStartDate={projectRange.start}
              columnWidth={columnWidth}
              viewMode={viewMode}
              rowHeight={preferences.gantt.rowHeight}
            />,
            svgElement,
          )}
          {isPulseActive && svgElement && createPortal(
            <PulseOverlay
              tasks={ganttTasks}
              projectStartDate={projectRange.start}
              columnWidth={columnWidth}
              viewMode={viewMode}
              rowHeight={preferences.gantt.rowHeight}
            />,
            svgElement,
          )}
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50">
          <div className="text-center p-8 max-w-md">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              {t('gantt.empty_state_title', { defaultValue: 'В проекте пока нет задач' })}
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              {t('gantt.empty_state_desc', { defaultValue: 'Создайте первую задачу, чтобы увидеть график и начать планирование.' })}
            </p>
          </div>
        </div>
      )}
      <style>{`
        /* Колонка списка: обнуляем обёртку (ganttTableWrapper) и корень (ganttTableRoot) — у @wamra/gantt-task-react классы без "taskList", из‑за чего появлялся зазор 10–15px */
        .gantt-hide-list div[class*="ganttTableRoot"] { border-left: none !important; }
        .gantt-hide-list div[class*="ganttTableWrapper"] { width: 0 !important; min-width: 0 !important; max-width: 0 !important; overflow: hidden !important; flex: 0 0 0 !important; }
        /* Верхний зазор: блок календаря библиотеки (calendarMain) — height: 0, убираем рамки, чтобы не было пустого пространства над сеткой */
        .gantt-hide-list div[class*="calendarMain"] { height: 0 !important; min-height: 0 !important; overflow: hidden !important; border: none !important; padding: 0 !important; margin: 0 !important; }
        /* GANTT-VERTICAL-SCROLL: Скрываем только calendar и встроенную taskList, НЕ трогаем verticalScroll - он нужен для вертикальной прокрутки */
        .gantt-hide-list g[class*="calendar"], .gantt-hide-list div[class*="taskList"], .gantt-hide-list div[class*="taskList"] * { display: none !important; width: 0 !important; min-width: 0 !important; margin: 0 !important; padding: 0 !important; }
        .gantt-hide-list div[class*="taskList"] { margin-right: -1px !important; }
        .gantt-hide-list div[class*="gridRow"] { border-left: none !important; }
        .gantt-hide-list svg[class*="grid"] { border-left: none !important; }
        .gantt-modern-scrollbars ::-webkit-scrollbar { width: 8px; height: 8px; }
        .gantt-modern-scrollbars ::-webkit-scrollbar-track { background: #f8fafc; border-radius: 4px; }
        .gantt-modern-scrollbars ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; border: 2px solid #f8fafc; }
        .gantt-modern-scrollbars ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        /* GANTT-VERTICAL-SCROLL: Стили для вертикального скроллбара области ganttTaskContent */
        .gantt-hide-list div[class*="ganttTaskContent"]::-webkit-scrollbar { width: 8px; height: 8px; }
        .gantt-hide-list div[class*="ganttTaskContent"]::-webkit-scrollbar-track { background: #f8fafc; border-radius: 4px; }
        .gantt-hide-list div[class*="ganttTaskContent"]::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; border: 2px solid #f8fafc; }
        .gantt-hide-list div[class*="ganttTaskContent"]::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .gantt-hide-list div[class*="ganttTaskContent"] { scrollbar-width: thin; scrollbar-color: #cbd5e1 #f8fafc; }
        
        rect[class*="todayLine"] { display: none !important; }
        
        ${/* showArrows fallback: gantt.showArrows > editing.showDependencies (09.02.2026) */
          !(preferences.gantt.showArrows ?? preferences.editing?.showDependencies ?? true) 
            ? '.gantt-hide-list g[class*="arrow"], .gantt-hide-list path[class*="arrow"] { display: none !important; }' 
            : ''}

        /* ========== GRID CONTROL (Управление сеткой) ========== */
        /* GRID-FIX: В области графика чередование строк и вертикальные линии заданы в gridStyle div'а библиотеки.
           SVG поверх div'а имеет background: oddTaskBackgroundColor (белый) и перекрывает их. 
           При включённой сетке: 
           1. Делаем SVG прозрачным, чтобы показать градиент div'а под ним
           2. Задаём div'у с градиентом белый background-color, чтобы transparent участки градиента 
              показывали белый цвет (а не серый #f5f5f5 от родителя)
           
           ВАЖНО: React конвертирует camelCase (backgroundSize) → kebab-case (background-size) в HTML,
           поэтому селектор должен искать "background-size", а не "backgroundSize" */
        ${preferences.gantt.showGridlines ? `
          /* Делаем SVG прозрачным для показа градиента под ним */
          .professional-gantt-container:not(.gantt-hide-grid) .gantt-hide-list svg {
            background: transparent !important;
          }
          
          /* Целевой div с градиентом библиотеки: задаём белый фон для transparent участков */
          .professional-gantt-container:not(.gantt-hide-grid) .gantt-hide-list div[style*="background-size"] {
            background-color: #ffffff !important;
          }
          
          /* Fallback: структурный селектор для надёжности (на случай изменения inline стилей) */
          .professional-gantt-container:not(.gantt-hide-grid) .gantt-hide-list > div > div:first-child {
            background-color: #ffffff !important;
          }
        ` : `
          /* При выключенной сетке: SVG белый, линии скрыты */
          .professional-gantt-container.gantt-hide-grid .gantt-hide-list svg {
            background: #ffffff !important;
          }
          .professional-gantt-container.gantt-hide-grid .gantt-hide-list line[class*="gridRow"],
          .professional-gantt-container.gantt-hide-grid .gantt-hide-list line[class*="tick"] {
            display: none !important;
          }
        `}
        
        /* Улучшенная подсветка выходных */
        ${preferences.gantt.highlightWeekends ? `
          .gantt-hide-list rect[class*="holiday"], 
          .gantt-hide-list rect[fill*="#f5f5f5"],
          .gantt-hide-list rect[class*="Calendar"] { 
            fill: #f1f5f9 !important; 
            opacity: 1 !important; 
            display: block !important;
          }
        ` : `
          .gantt-hide-list rect[class*="holiday"] {
            fill: transparent !important;
          }
        `}

        /* Baseline Overlay Style */
        .gantt-baseline-enabled rect[class*="barBackground"] {
          filter: drop-shadow(0 2px 0 rgba(0,0,0,0.1));
        }

        /* Shadow Bars via Linear Gradient - ЭТАЛОННЫЙ СПОСОБ */
        .gantt-baseline-enabled g[data-id] rect[class*="bar"] {
          /* Мы не можем легко применить градиент через CSS к существующим rect библиотеки, 
             так как она управляет заливкой через инлайн-стили. 
             Поэтому мы используем наш BaselineOverlay компонент, но поправим его позиционирование. */
        }
        
        /* Визуализация Pulse (Критический путь) */
        ${isPulseActive ? `
          .gantt-hide-list g[class*="arrow"] path { 
            stroke: #cbd5e1;
            stroke-opacity: 0.4;
          }
        ` : ''}
        
        /* GANTT-NAV: CSS-хак для filler'ов удалён — теперь используется нативный EmptyTask 
           из @wamra/gantt-task-react, который не рендерится библиотекой вообще */

        /* Stage 8.21: Силовой сброс ограничений тултипа библиотеки */
        div[class*="tooltipDefaultContainer"] {
          padding: 0 !important;
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
          width: auto !important;
          min-width: auto !important;
          max-width: none !important;
        }
      `}</style>
    </div>
  )
}

export const ProfessionalGantt = forwardRef(ProfessionalGanttRender)
