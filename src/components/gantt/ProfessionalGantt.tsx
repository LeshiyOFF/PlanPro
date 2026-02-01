import React, { useMemo, useEffect, useRef, useState, useImperativeHandle, useCallback, forwardRef, ForwardRefRenderFunction } from 'react';
import { createPortal } from 'react-dom';
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import { useTranslation } from 'react-i18next';
import { Task } from '@/store/project/interfaces';
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences';
import { useTaskEstimation } from '@/hooks/task/useTaskEstimation';
import { useTaskWorkVisualization } from '@/hooks/task/useTaskWorkVisualization';
import { ProfessionalTimelineHeader } from './ProfessionalTimelineHeader';
import { CalendarDateService } from '@/services/CalendarDateService';
import { GanttViewModeService } from '@/services/GanttViewModeService';
import { GanttRangeService } from '@/services/GanttRangeService';
import { GanttTaskMapper, ExtendedGanttTask } from '@/services/GanttTaskMapper';
import { GanttScrollService } from '@/services/GanttScrollService';
import { GanttNavigationService } from '@/services/GanttNavigationService';
import { BaselineOverlay } from './BaselineOverlay';
import { PulseOverlay } from './PulseOverlay';
import { useAppStore } from '@/store/appStore';
import { useProjectStore } from '@/store/projectStore';

export interface ProfessionalGanttHandle {
  scrollToPosition: (position: number) => void;
  scrollToDate: (date: Date) => void;
  getCurrentScroll: () => number;
}

interface ProfessionalGanttProps {
  tasks: Task[];
  onTaskUpdate?: (taskId: string, updates: { startDate: Date; endDate: Date; progress: number }) => void;
  onTaskSelect?: (task: Task) => void;
  onTaskDoubleClick?: (task: Task) => void;
  zoomLevel?: number;
  mode?: 'standard' | 'tracking';
  forcedEndDate?: Date | null;
  targetDate?: Date | null;
  onNavigationComplete?: () => void;
}

const ProfessionalGanttRender: ForwardRefRenderFunction<ProfessionalGanttHandle, ProfessionalGanttProps> = (props: ProfessionalGanttProps, ref: React.ForwardedRef<ProfessionalGanttHandle>) => {
  const { tasks, onTaskUpdate, onTaskSelect, onTaskDoubleClick, zoomLevel = 1, mode = 'standard', forcedEndDate, targetDate, onNavigationComplete } = props;
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollServiceRef = useRef<GanttScrollService | null>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [svgElement, setSvgElement] = useState<SVGElement | null>(null);
  
  const { preferences } = useUserPreferences();
  const isPulseActive = useAppStore(state => state.ui.isPulseActive);
  const { resources, calendars, baselines, activeBaselineId } = useProjectStore();
  const activeBaseline = useMemo(() => baselines.find(b => b.id === activeBaselineId), [baselines, activeBaselineId]);
  const { getFormattedName } = useTaskEstimation();
  const { getVisualProgress, showBaseline } = useTaskWorkVisualization(mode as "standard" | "tracking");

  const viewMode = useMemo(() => GanttViewModeService.getViewMode(zoomLevel), [zoomLevel]);
  const columnWidth = useMemo(() => GanttViewModeService.getColumnWidth(zoomLevel), [zoomLevel]);
  const projectRange = useMemo(() => {
    return GanttRangeService.calculateRange(tasks, dimensions.width, zoomLevel, viewMode, forcedEndDate);
  }, [tasks, dimensions.width, zoomLevel, viewMode, forcedEndDate]);
  
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
      t
    );
  }, [tasks, dimensions.height, projectRange, getVisualProgress, getFormattedName, showBaseline, mode, preferences.gantt, isPulseActive, resources, calendars, activeBaseline, t]);

  // Исполнение навигации через сервис (Лоск, пороги и DOM-прыжки)
  const executeScrollToDate = useCallback(async (date: Date) => {
    if (!scrollServiceRef.current) return;

    console.group(`[ProfessionalGantt] executeScrollToDate: ${date.toLocaleDateString()}`);
    
    // ЭТАЛОННАЯ СТРАТЕГИЯ: Ищем ближайшую задачу для максимально точного прыжка по DOM
    const nearestTaskId = GanttNavigationService.findNearestTaskId(date, tasks);
    
    const scrollOpts = {
      containerWidth: dimensions.width,
      expansionTimeout: 5000,
      onRequireViewModeFallback: (mode: ViewMode) => {
        // Здесь можно добавить уведомление пользователю или автопереключение
        console.warn(`[ProfessionalGantt] Navigation range too large. Recommended view mode: ${mode}`);
      }
    };

    let success = false;
    if (nearestTaskId) {
      console.log(`[ProfessionalGantt] Strategy: Element-based navigation to task ${nearestTaskId}`);
      success = await scrollServiceRef.current.scrollToTaskByDataId(nearestTaskId, scrollOpts);
    }

    if (!success) {
      console.log(`[ProfessionalGantt] Strategy: Index-based navigation`);
      const stepIndex = GanttNavigationService.dateToStepIndex(date, projectRange.start, viewMode);
      await scrollServiceRef.current.scrollToIndex(stepIndex, columnWidth, 1, scrollOpts);
    }

    console.groupEnd();
  }, [tasks, projectRange.start, viewMode, columnWidth, dimensions.width]);

  useImperativeHandle(ref, () => ({
    scrollToPosition: (pos: number) => {
      scrollServiceRef.current?.scrollToPosition(pos);
    },
    scrollToDate: (date: Date) => { executeScrollToDate(date); },
    getCurrentScroll: () => scrollLeft
  }));

  // Инициализация сервиса и поиск SVG
  useEffect(() => {
    const findContainer = () => {
      const el = containerRef.current?.querySelector('div[style*="overflow: auto"]') as HTMLElement;
      if (el) {
        scrollServiceRef.current = new GanttScrollService(el);
        const svg = el.querySelector('svg') as SVGElement;
        if (svg) setSvgElement(svg);
        console.log(`[ProfessionalGantt] GanttScrollService and SVG initialized`);
        return true;
      }
      return false;
    };

    if (!findContainer()) {
      const interval = setInterval(() => { if (findContainer()) clearInterval(interval); }, 50);
      return () => { clearInterval(interval); scrollServiceRef.current?.dispose(); };
    }
    return () => scrollServiceRef.current?.dispose();
  }, []);

  // Реакция на targetDate
  useEffect(() => {
    if (targetDate && scrollServiceRef.current) {
      executeScrollToDate(targetDate).then(() => onNavigationComplete?.());
    }
  }, [targetDate, executeScrollToDate, onNavigationComplete]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(containerRef.current);
    
    let scrollEl: HTMLElement | null = null, rafId = 0, lastScroll = 0;
    const rafLoop = () => { 
      if (!scrollEl) scrollEl = containerRef.current?.querySelector('div[style*="overflow: auto"]') as HTMLElement;
      if (scrollEl && scrollEl.scrollLeft !== lastScroll) { 
        lastScroll = scrollEl.scrollLeft; 
        setScrollLeft(lastScroll); 
      } 
      rafId = requestAnimationFrame(rafLoop); 
    };
    rafId = requestAnimationFrame(rafLoop);
    return () => { observer.disconnect(); cancelAnimationFrame(rafId); };
  }, [ganttTasks.length]);

  return (
    <div ref={containerRef} className={`professional-gantt-container w-full h-full bg-white relative gantt-modern-scrollbars ${showBaseline ? 'gantt-baseline-enabled' : ''} ${!preferences.gantt.showGridlines ? 'gantt-hide-grid' : ''} ${preferences.gantt.highlightWeekends ? 'gantt-highlight-weekends' : ''}`}>
      {dimensions.width > 0 && (
        <ProfessionalTimelineHeader 
          startDate={projectRange.start} endDate={projectRange.end} 
          viewMode={viewMode} columnWidth={columnWidth} scrollLeft={scrollLeft} 
          headerHeight={50} containerWidth={dimensions.width}
        />
      )}
      {ganttTasks.length > 0 && dimensions.width > 0 && (
        <div className="absolute inset-0 top-[50px] gantt-hide-list">
          <Gantt tasks={ganttTasks} viewMode={viewMode} columnWidth={columnWidth} headerHeight={0} rowHeight={typeof preferences.gantt.rowHeight === 'number' ? preferences.gantt.rowHeight : 40} locale="ru-RU" listCellWidth="1"
            TaskListHeader={() => null} TaskListTable={() => null}
            onDateChange={(t: GanttTask) => { const s = CalendarDateService.toLocalMidnight(t.start), e = CalendarDateService.toLocalMidnight(t.end); e.setHours(23, 59, 59, 999); onTaskUpdate?.(t.id, { startDate: s, endDate: e, progress: Math.round(t.progress) / 100 }); }}
            onProgressChange={(t: GanttTask) => onTaskUpdate?.(t.id, { startDate: t.start, endDate: t.end, progress: Math.round(t.progress) / 100 })}
            onSelect={(t: GanttTask, sel: boolean) => { const et = t as ExtendedGanttTask; if (sel && et.originalTask) onTaskSelect?.(et.originalTask); }}
            onDoubleClick={(t: GanttTask) => { const et = t as ExtendedGanttTask; if (et.originalTask) onTaskDoubleClick?.(et.originalTask); }}
            TooltipContent={({ task: gTask }: { task: GanttTask }) => { 
              const et = gTask as ExtendedGanttTask; 
              if (et.originalTask?.isFiller) return null; 
              const bDates = et.baselineDates;
              const diffDays = bDates ? Math.round((new Date(gTask.end).getTime() - new Date(bDates.endDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
              const conflict = et.calendarConflict;
              
              return (
                <div 
                  className="bg-white p-3 border border-slate-200 rounded-lg shadow-xl text-xs border-l-4 whitespace-normal break-words" 
                  style={{ 
                    borderLeftColor: gTask.styles?.backgroundColor,
                    width: 'max-content',
                    minWidth: '280px',
                    maxWidth: '450px',
                    display: 'flex',
                    flexDirection: 'column'
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

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-500">
                    <span>{t('gantt.tooltip_start', { defaultValue: 'Начало' })}:</span>
                    <span className="text-slate-700">{gTask.start.toLocaleDateString()}</span>
                    <span>{t('gantt.tooltip_end', { defaultValue: 'Конец' })}:</span>
                    <span className="text-slate-700">{gTask.end.toLocaleDateString()}</span>
                    <span>{t('gantt.tooltip_progress', { defaultValue: 'Прогресс' })}:</span>
                    <span className="text-slate-700">{Math.round(gTask.progress)}%</span>
                    
                    {isPulseActive && (
                      <>
                        <div className="col-span-2 my-1 border-t border-slate-100" />
                        <span className="font-semibold">{t('gantt.tooltip_critical', { defaultValue: 'Критический путь' })}:</span>
                        <span className={et.originalTask?.isCritical ? 'text-red-500 font-bold' : 'text-slate-500'}>
                          {et.originalTask?.isCritical ? t('common.yes', { defaultValue: 'Да' }) : t('common.no', { defaultValue: 'Нет' })}
                        </span>
                        {!et.originalTask?.isCritical && et.originalTask?.slack !== undefined && (
                          <>
                            <span className="font-semibold">{t('gantt.tooltip_slack', { defaultValue: 'Запас времени' })}:</span>
                            <span className="text-blue-500 font-bold">{Math.round(et.originalTask.slack / (1000 * 60 * 60 * 24))} {t('gantt.days', { defaultValue: 'дн.' })}</span>
                          </>
                        )}
                      </>
                    )}

                    {bDates && (
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
              );
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
            svgElement
          )}
          {isPulseActive && svgElement && createPortal(
            <PulseOverlay
              tasks={ganttTasks}
              projectStartDate={projectRange.start}
              columnWidth={columnWidth}
              viewMode={viewMode}
              rowHeight={preferences.gantt.rowHeight}
            />,
            svgElement
          )}
        </div>
      )}
      <style>{`
        .gantt-hide-list g[class*="calendar"], .gantt-hide-list div[class*="taskList"], .gantt-hide-list div[class*="taskList"] *, .gantt-hide-list div[class*="verticalScroll"] { display: none !important; width: 0 !important; min-width: 0 !important; margin: 0 !important; padding: 0 !important; }
        .gantt-hide-list div[class*="taskList"] { margin-right: -1px !important; }
        .gantt-hide-list div[class*="gridRow"] { border-left: none !important; }
        .gantt-hide-list svg[class*="grid"] { border-left: none !important; }
        .gantt-modern-scrollbars ::-webkit-scrollbar { width: 8px; height: 8px; }
        .gantt-modern-scrollbars ::-webkit-scrollbar-track { background: #f8fafc; border-radius: 4px; }
        .gantt-modern-scrollbars ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; border: 2px solid #f8fafc; }
        .gantt-modern-scrollbars ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        rect[class*="todayLine"] { display: none !important; }
        
        ${!preferences.gantt.showArrows ? '.gantt-hide-list g[class*="arrow"], .gantt-hide-list path[class*="arrow"] { display: none !important; }' : ''}

        /* Исправленные селекторы сетки */
        ${!preferences.gantt.showGridlines ? `
          .gantt-hide-list line[class*="gridRowLine"], 
          .gantt-hide-list line[class*="gridTick"], 
          .gantt-hide-list line[x1="0"],
          .gantt-hide-list line[y1="0"] { 
            display: none !important;
            stroke: transparent !important; 
            opacity: 0 !important; 
          }
        ` : ''}
        
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
        
        .gantt-hide-list g[data-id^="filler-"] { pointer-events: none !important; }
        .gantt-hide-list g[data-id^="filler-"] rect, .gantt-hide-list g[data-id^="filler-"] text, .gantt-hide-list g[data-id^="filler-"] g { display: none !important; }

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
  );
};

export const ProfessionalGantt = forwardRef(ProfessionalGanttRender);
