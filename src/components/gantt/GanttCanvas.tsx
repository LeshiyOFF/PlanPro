import { forwardRef } from 'react'
import { ProfessionalGantt, ProfessionalGanttHandle } from './ProfessionalGantt'
import { Task } from '@/store/project/interfaces'
import { GanttDisplayMode, GanttTaskUpdate } from '@/types/gantt/GanttTaskTypes'

/**
 * Пропсы компонента Gantt Canvas
 */
export interface GanttCanvasProps {
  tasks?: Task[];
  startDate?: Date;
  endDate?: Date;
  onTaskSelect?: (task: Task) => void;
  onTaskDoubleClick?: (task: Task) => void;
  onTaskUpdate?: (taskId: string, updates: GanttTaskUpdate) => void;
  zoomLevel?: number;
  mode?: GanttDisplayMode;
  forcedEndDate?: Date | null;
  targetDate?: Date | null;
  onNavigationComplete?: () => void;
}

/**
 * Gantt Professional Component.
 * Обертка, которая использует новый движок Ганта.
 */
export const GanttCanvas = forwardRef<ProfessionalGanttHandle, GanttCanvasProps>(
  (
    {
      tasks = [],
      onTaskSelect,
      onTaskDoubleClick,
      onTaskUpdate,
      zoomLevel = 1,
      mode = 'standard',
      forcedEndDate,
      targetDate,
      onNavigationComplete,
    },
    ref,
  ) => {
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
    )
  },
)

GanttCanvas.displayName = 'GanttCanvas'
