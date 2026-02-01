import React, { useMemo } from 'react';
import { ProjectBaseline } from '@/store/project/interfaces';
import { ViewMode } from 'gantt-task-react';
import { GanttNavigationService } from '@/services/GanttNavigationService';

/**
 * Типизированная задача для Baseline Overlay
 */
interface IBaselineTask {
  readonly id: string;
  readonly type?: string;
  readonly originalTask?: {
    readonly isFiller?: boolean;
  };
}

interface BaselineOverlayProps {
  readonly tasks: ReadonlyArray<IBaselineTask>;
  readonly activeBaseline: ProjectBaseline;
  readonly projectStartDate: Date;
  readonly columnWidth: number;
  readonly viewMode: ViewMode;
  readonly rowHeight: number;
}

export const BaselineOverlay: React.FC<BaselineOverlayProps> = ({
  tasks,
  activeBaseline,
  projectStartDate,
  columnWidth,
  viewMode,
  rowHeight
}) => {
  const overlayElements = useMemo(() => {
    return tasks.map((task, index) => {
      const baselineDates = activeBaseline.taskDates[task.id];
      if (!baselineDates || task.originalTask?.isFiller || task.type === 'project') return null;

      const startIndex = GanttNavigationService.dateToStepIndex(
        new Date(baselineDates.startDate), 
        projectStartDate, 
        viewMode
      );
      
      const endIndex = GanttNavigationService.dateToStepIndex(
        new Date(baselineDates.endDate), 
        projectStartDate, 
        viewMode
      );

      const x = startIndex * columnWidth;
      const width = Math.max((endIndex - startIndex + 1) * columnWidth, 5);
      
      // ЭТАЛОННОЕ ПОЗИЦИОНИРОВАНИЕ: 
      // Мы рисуем полоску в самом низу текущей строки (y = index * rowHeight + rowHeight - 4)
      const y = index * rowHeight + rowHeight - 4; 

      return (
        <rect
          key={`baseline-${task.id}`}
          x={x}
          y={y}
          width={width}
          height={3}
          fill="#94a3b8"
          rx={1.5}
          ry={1.5}
          fillOpacity={0.6}
          className="baseline-bar"
          style={{ pointerEvents: 'none' }}
        />
      );
    });
  }, [tasks, activeBaseline, projectStartDate, columnWidth, viewMode, rowHeight]);

  return (
    <g className="baseline-overlay-layer">
      {overlayElements}
    </g>
  );
};
