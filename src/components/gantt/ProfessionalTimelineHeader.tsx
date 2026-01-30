import React, { useMemo } from 'react';
import { ViewMode } from 'gantt-task-react';
import { TimelineFormatService } from '@/services/TimelineFormatService';
import { GanttNavigationService } from '@/services/GanttNavigationService';

interface ProfessionalTimelineHeaderProps {
  startDate: Date;
  endDate: Date;
  viewMode: ViewMode;
  columnWidth: number;
  scrollLeft: number;
  headerHeight: number;
  containerWidth: number;
}

/**
 * ProfessionalTimelineHeader - Эталонный компонент заголовка временной шкалы.
 * Реализует виртуализацию для поддержки бесконечного горизонта без потери FPS.
 */
export const ProfessionalTimelineHeader: React.FC<ProfessionalTimelineHeaderProps> = ({
  startDate,
  endDate,
  viewMode,
  columnWidth,
  scrollLeft,
  headerHeight,
  containerWidth
}) => {
  const allIntervals = useMemo(() => 
    TimelineFormatService.generateIntervals(startDate, endDate, viewMode),
    [startDate, endDate, viewMode]
  );

  // Виртуализация: вычисляем только видимые интервалы
  const { startIndex, endIndex } = useMemo(() => 
    GanttNavigationService.getVisibleRangeIndices(scrollLeft, containerWidth, columnWidth, allIntervals.length),
    [scrollLeft, containerWidth, columnWidth, allIntervals.length]
  );

  const visibleIntervals = useMemo(() => 
    allIntervals.slice(startIndex, endIndex),
    [allIntervals, startIndex, endIndex]
  );

  // Группировка видимых интервалов для верхнего уровня
  const topLevelGroups = useMemo(() => {
    const groups: { date: Date; width: number }[] = [];
    if (visibleIntervals.length === 0) return groups;

    let currentGroup = { date: visibleIntervals[0], width: columnWidth };
    
    for (let i = 1; i < visibleIntervals.length; i++) {
      const date = visibleIntervals[i];
      const isSameGroup = viewMode === ViewMode.Month 
        ? date.getFullYear() === currentGroup.date.getFullYear()
        : (date.getMonth() === currentGroup.date.getMonth() && date.getFullYear() === currentGroup.date.getFullYear());

      if (isSameGroup) {
        currentGroup.width += columnWidth;
      } else {
        groups.push(currentGroup);
        currentGroup = { date, width: columnWidth };
      }
    }
    groups.push(currentGroup);
    return groups;
  }, [visibleIntervals, columnWidth, viewMode]);

  const leftOffset = startIndex * columnWidth;

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
  );
};
