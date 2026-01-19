import React, { useState } from 'react';
import { ProfessionalGantt } from './ProfessionalGantt';

interface GanttCanvasProps {
  tasks?: any[];
  startDate?: Date;
  endDate?: Date;
  onTaskSelect?: (task: any) => void;
  onTaskDoubleClick?: (task: any) => void;
  onTaskUpdate?: (taskId: string, updates: { startDate: Date; endDate: Date; progress: number }) => void;
  zoomLevel?: number;
  mode?: 'standard' | 'tracking';
}

/**
 * Gantt Professional Component
 * Обертка, которая использует новый движок Ганта
 */
export const GanttCanvas: React.FC<GanttCanvasProps> = ({
  tasks = [],
  onTaskSelect,
  onTaskDoubleClick,
  onTaskUpdate,
  zoomLevel = 1,
  mode = 'standard'
}) => {
  return (
    <ProfessionalGantt
      tasks={tasks}
      onTaskUpdate={onTaskUpdate}
      onTaskSelect={onTaskSelect}
      onTaskDoubleClick={onTaskDoubleClick}
      zoomLevel={zoomLevel}
      mode={mode}
    />
  );
};

