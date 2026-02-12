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
  /** GANTT-NAV-V3: Минимальная дата навигации */
  minDate?: Date;
  /** GANTT-NAV-V3: Максимальная дата навигации */
  maxDate?: Date;
  /** Ref для синхронизации вертикального скролла */
  scrollRef?: React.RefObject<HTMLDivElement>;
  /** Callback при прокрутке для синхронизации */
  onScroll?: () => void;
}

/**
 * Gantt Professional Component.
 * Обертка, которая использует новый движок Ганта.
 */
export const GanttCanvas = forwardRef<ProfessionalGanttHandle, GanttCanvasProps>(
  (
    {
      tasks = [],
      startDate,
      onTaskSelect,
      onTaskDoubleClick,
      onTaskUpdate,
      zoomLevel = 1,
      mode = 'standard',
      forcedEndDate,
      targetDate,
      onNavigationComplete,
      minDate,
      maxDate,
      scrollRef,
      onScroll,
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
        viewDate={startDate}
        onNavigationComplete={onNavigationComplete}
        minDate={minDate}
        maxDate={maxDate}
        scrollRef={scrollRef}
        onScroll={onScroll}
      />
    )
  },
)

GanttCanvas.displayName = 'GanttCanvas'
