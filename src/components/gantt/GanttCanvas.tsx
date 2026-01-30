import React, { useState, forwardRef } from 'react';
import { ProfessionalGantt, ProfessionalGanttHandle } from './ProfessionalGantt';

interface GanttCanvasProps {
  tasks?: any[];
  startDate?: Date;
  endDate?: Date;
  onTaskSelect?: (task: any) => void;
  onTaskDoubleClick?: (task: any) => void;
  onTaskUpdate?: (taskId: string, updates: { startDate: Date; endDate: Date; progress: number }) => void;
  zoomLevel?: number;
  mode?: 'standard' | 'tracking';
  forcedEndDate?: Date | null;
  targetDate?: Date | null;
  onNavigationComplete?: () => void;
}

/**
 * Gantt Professional Component
 * Обертка, которая использует новый движок Ганта
 */
export const GanttCanvas = forwardRef<ProfessionalGanttHandle, GanttCanvasProps>(({
  tasks = [],
  onTaskSelect,
  onTaskDoubleClick,
  onTaskUpdate,
  zoomLevel = 1,
  mode = 'standard',
  forcedEndDate,
  targetDate,
  onNavigationComplete
}, ref) => {
  return (
    <ProfessionalGantt
      ref={ref}
      tasks={tasks}
      onTaskUpdate={onTaskUpdate}
      onTaskSelect={onTaskSelect}
      onTaskDoubleClick={onTaskDoubleClick}
      zoomLevel={zoomLevel}
      mode={mode}
      forcedEndDate={forcedEndDate}
      targetDate={targetDate}
      onNavigationComplete={onNavigationComplete}
    />
  );
});

