import React, { useMemo } from 'react'
import { ViewMode } from '@wamra/gantt-task-react'
import { TimelineFormatService } from '@/services/TimelineFormatService'
import { GanttNavigationService } from '@/services/GanttNavigationService'

/**
 * Генерирует массив дат на основе стартовой даты, количества интервалов и режима отображения.
 * GANTT-FORK: Эта функция используется для синхронизации с datesLength из библиотеки.
 */
function generateDateIntervals(startDate: Date, datesLength: number, viewMode: ViewMode): Date[] {
  const dates: Date[] = []
  const current = new Date(startDate)
  
  for (let i = 0; i < datesLength; i++) {
    dates.push(new Date(current))
    
    switch (viewMode) {
      case ViewMode.Hour:
        current.setHours(current.getHours() + 1)
        break
      case ViewMode.QuarterDay:
        current.setHours(current.getHours() + 6)
        break
      case ViewMode.HalfDay:
        current.setHours(current.getHours() + 12)
        break
      case ViewMode.Day:
        current.setDate(current.getDate() + 1)
        break
      case ViewMode.Week:
        current.setDate(current.getDate() + 7)
        break
      case ViewMode.Month:
        current.setMonth(current.getMonth() + 1)
        break
      case ViewMode.Year:
        current.setFullYear(current.getFullYear() + 1)
        break
      default:
        current.setDate(current.getDate() + 1)
    }
  }
  
  return dates
}

interface ProfessionalTimelineHeaderProps {
  /** Синхронизированная начальная дата из SVG библиотеки */
  startDate: Date;
  /** Количество интервалов из SVG (вместо endDate для точной синхронизации) */
  datesLength: number;
  viewMode: ViewMode;
  columnWidth: number;
  scrollLeft: number;
  headerHeight: number;
  containerWidth: number;
}

/**
 * Минимальное количество колонок для отображения.
 * Синхронизировано с MINIMUM_DISPLAYED_TIME_UNIT в библиотеке gantt-task-react.
 */
const MINIMUM_COLUMNS = 30

/**
 * ProfessionalTimelineHeader - Эталонный компонент заголовка временной шкалы.
 * Реализует виртуализацию для поддержки бесконечного горизонта без потери FPS.
 *
 * GANTT-HEADER-SYNC: Использует datesLength из SVG для гарантированной
 * синхронизации количества колонок с библиотекой @wamra/gantt-task-react.
 * 
 * GANTT-HEADER-WIDTH: Хедер всегда покрывает всю ширину контейнера,
 * независимо от количества задач, используя Math.max логику.
 */
export const ProfessionalTimelineHeader: React.FC<ProfessionalTimelineHeaderProps> = ({
  startDate,
  datesLength,
  viewMode,
  columnWidth,
  scrollLeft,
  headerHeight,
  containerWidth,
}) => {
  /**
   * GANTT-HEADER-WIDTH: Вычисляем эффективное количество колонок.
   * Хедер должен покрывать как минимум:
   * 1. Ширину контейнера (containerWidth / columnWidth + буфер)
   * 2. Количество колонок из библиотеки (datesLength)
   * 3. Минимум MINIMUM_COLUMNS (синхронизировано с SVG-сеткой)
   */
  const effectiveDatesLength = useMemo(() => {
    const containerColumns = Math.ceil(containerWidth / columnWidth) + 2
    return Math.max(datesLength, containerColumns, MINIMUM_COLUMNS)
  }, [datesLength, containerWidth, columnWidth])

  /**
   * GANTT-HEADER-SYNC: Генерируем интервалы на основе effectiveDatesLength.
   * Это гарантирует что хедер всегда покрывает всю ширину диаграммы.
   */
  const allIntervals = useMemo(() => {
    if (effectiveDatesLength <= 0) return []
    return generateDateIntervals(startDate, effectiveDatesLength, viewMode)
  }, [startDate, effectiveDatesLength, viewMode])

  // Виртуализация: вычисляем только видимые интервалы
  const { startIndex, endIndex } = useMemo(() =>
    GanttNavigationService.getVisibleRangeIndices(scrollLeft, containerWidth, columnWidth, allIntervals.length),
  [scrollLeft, containerWidth, columnWidth, allIntervals.length],
  )

  const visibleIntervals = useMemo(() =>
    allIntervals.slice(startIndex, endIndex),
  [allIntervals, startIndex, endIndex],
  )

  // Группировка видимых интервалов для верхнего уровня
  const topLevelGroups = useMemo(() => {
    const groups: { date: Date; width: number }[] = []
    if (visibleIntervals.length === 0) return groups

    let currentGroup = { date: visibleIntervals[0], width: columnWidth }

    for (let i = 1; i < visibleIntervals.length; i++) {
      const date = visibleIntervals[i]
      const isSameGroup = viewMode === ViewMode.Month
        ? date.getFullYear() === currentGroup.date.getFullYear()
        : (date.getMonth() === currentGroup.date.getMonth() && date.getFullYear() === currentGroup.date.getFullYear())

      if (isSameGroup) {
        currentGroup.width += columnWidth
      } else {
        groups.push(currentGroup)
        currentGroup = { date, width: columnWidth }
      }
    }
    groups.push(currentGroup)
    return groups
  }, [visibleIntervals, columnWidth, viewMode])

  const leftOffset = startIndex * columnWidth

  return (
    <div
      className="professional-timeline-header select-none border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm sticky top-0 z-20 overflow-hidden"
      style={{ height: headerHeight, width: '100%' }}
    >
      <div
        className="flex flex-col h-full transition-transform duration-0"
        style={{ transform: `translateX(${leftOffset - scrollLeft}px)`, width: 'max-content' }}
      >
        {/* Верхний уровень: Месяцы / Годы */}
        <div className="flex border-b border-slate-200/50 h-1/2">
          {topLevelGroups.map((group, idx) => (
            <div
              key={`top-${startIndex}-${idx}`}
              className="flex items-center justify-center border-r border-slate-200/50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider px-2 overflow-hidden whitespace-nowrap"
              style={{ width: group.width }}
            >
              {TimelineFormatService.formatTopHeader(group.date, viewMode, group.width)}
            </div>
          ))}
        </div>

        {/* Нижний уровень: Дни / Недели */}
        <div className="flex h-1/2">
          {visibleIntervals.map((date, idx) => (
            <div
              key={`bottom-${startIndex}-${idx}`}
              className="flex items-center justify-center border-r border-slate-200/50 text-[10px] font-medium text-slate-500 overflow-hidden whitespace-nowrap"
              style={{ width: columnWidth }}
            >
              {TimelineFormatService.formatBottomHeader(date, viewMode, columnWidth)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
