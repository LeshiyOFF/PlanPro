import React from 'react'
import { GanttCanvasController } from '@/components/gantt'
import { Task } from '@/store/project/interfaces'
import { IGanttTaskUpdate } from '@/types/gantt/IGanttTypes'
import { GanttDisplayMode } from '@/types/gantt/GanttTaskTypes'

interface GanttRightPanelProps {
  readonly tasks: ReadonlyArray<Task>;
  readonly startDate: Date;
  readonly linkingTaskId: string | null;
  readonly mode: GanttDisplayMode;
  readonly onCurrentDateChange: (date: Date) => void;
  readonly onTaskUpdate: (id: string, updates: IGanttTaskUpdate) => void;
  readonly onTaskSelect: (task: Task) => void;
  readonly onModeChange: (mode: GanttDisplayMode) => void;
}

export const GanttRightPanel: React.FC<GanttRightPanelProps> = ({
  tasks, startDate, linkingTaskId, mode, onCurrentDateChange,
  onTaskUpdate, onTaskSelect, onModeChange,
}) => {
  return (
    <div className={`flex flex-col h-full bg-white ${linkingTaskId ? 'cursor-alias' : ''}`}>
      <GanttCanvasController
        tasks={tasks}
        currentDate={startDate}
        onCurrentDateChange={onCurrentDateChange}
        onTaskUpdate={onTaskUpdate}
        onTaskSelect={onTaskSelect}
        onTaskDoubleClick={undefined}
        mode={mode}
        onModeChange={onModeChange}
      />
    </div>
  )
}

