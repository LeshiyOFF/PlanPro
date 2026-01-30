import React, { useMemo } from 'react';
import { ViewMode } from 'gantt-task-react';
import { GanttNavigationService } from '@/services/GanttNavigationService';

interface PulseOverlayProps {
  tasks: any[];
  projectStartDate: Date;
  columnWidth: number;
  viewMode: ViewMode;
  rowHeight: number;
}

export const PulseOverlay: React.FC<PulseOverlayProps> = ({
  tasks,
  projectStartDate,
  columnWidth,
  viewMode,
  rowHeight
}) => {
  const criticalConnections = useMemo(() => {
    const lines: React.ReactNode[] = [];
    
    tasks.forEach((task, index) => {
      const isTaskCritical = task.originalTask?.critical || task.originalTask?.criticalPath;
      if (!isTaskCritical || !task.dependencies || task.originalTask?.isFiller) return;

      task.dependencies.forEach((depId: string) => {
        const depIndex = tasks.findIndex(t => t.id === depId);
        if (depIndex === -1) return;
        
        const depTask = tasks[depIndex];
        const isDepCritical = depTask.originalTask?.critical || depTask.originalTask?.criticalPath;
        
        if (isDepCritical) {
          const startX = GanttNavigationService.dateToStepIndex(depTask.end, projectStartDate, viewMode) * columnWidth;
          const startY = depIndex * rowHeight + (rowHeight / 2);
          const endX = GanttNavigationService.dateToStepIndex(task.start, projectStartDate, viewMode) * columnWidth;
          const endY = index * rowHeight + (rowHeight / 2);

          const midX = startX + Math.max(20, (endX - startX) / 2);
          
          lines.push(
            <path
              key={`pulse-link-${depId}-${task.id}`}
              d={`M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`}
              stroke="#ef4444"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 0 2px rgba(239, 68, 68, 0.4))', pointerEvents: 'none' }}
            />
          );
        }
      });
    });
    
    return lines;
  }, [tasks, projectStartDate, columnWidth, viewMode, rowHeight]);

  return (
    <g className="pulse-overlay-layer">
      {criticalConnections}
    </g>
  );
};
