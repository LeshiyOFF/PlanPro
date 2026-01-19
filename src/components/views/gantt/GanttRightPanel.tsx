import React from 'react';
import { GanttCanvasController } from '@/components/gantt';
import { Task } from '@/store/project/interfaces';

interface GanttRightPanelProps {
  tasks: Task[];
  startDate: Date;
  linkingTaskId: string | null;
  mode: 'standard' | 'tracking';
  onCurrentDateChange: (date: Date) => void;
  onTaskUpdate: (id: string, updates: any) => void;
  onTaskSelect: (task: Task) => void;
  onModeChange: (mode: 'standard' | 'tracking') => void;
}

export const GanttRightPanel: React.FC<GanttRightPanelProps> = ({
  tasks, startDate, linkingTaskId, mode, onCurrentDateChange,
  onTaskUpdate, onTaskSelect, onModeChange
}) => {
  return (
    <div className={`flex flex-col h-full bg-white ${linkingTaskId ? 'cursor-alias' : ''}`}>
      <GanttCanvasController
        tasks={tasks}
        startDate={startDate}
        endDate={new Date(startDate.getTime() + 120 * 24 * 60 * 60 * 1000)}
        currentDate={startDate}
        onCurrentDateChange={onCurrentDateChange}
        onTaskUpdate={onTaskUpdate}
        onTaskSelect={onTaskSelect}
        mode={mode}
        onModeChange={onModeChange}
      />
    </div>
  );
};
