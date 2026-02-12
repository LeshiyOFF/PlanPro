import React, { useMemo, ReactNode } from 'react'
import { ViewMode } from '@wamra/gantt-task-react'
import { GanttNavigationService } from '@/services/GanttNavigationService'

/**
 * Типизированная задача для Pulse Overlay
 * Содержит минимально необходимые поля для отрисовки критического пути
 * 
 * CPM-MS.9: Поддержка различия между leaf (критический путь) и summary (индикатор).
 */
interface IPulseTask {
  readonly id: string;
  readonly start: Date;
  readonly end: Date;
  readonly type?: string; // GANTT-NAV: Для проверки EmptyTask
  readonly dependencies?: ReadonlyArray<string>;
  readonly originalTask?: {
    readonly critical?: boolean;
    readonly criticalPath?: boolean;
    readonly isCritical?: boolean;
    readonly isFiller?: boolean;
    /** CPM-MS.9: Является ли задача summary (для различия стилей). */
    readonly isSummary?: boolean;
    /** CPM-MS.9: Содержит ли summary критические дочерние задачи. */
    readonly containsCriticalChildren?: boolean;
  };
}

interface PulseOverlayProps {
  readonly tasks: ReadonlyArray<IPulseTask>;
  readonly projectStartDate: Date;
  readonly columnWidth: number;
  readonly viewMode: ViewMode;
  readonly rowHeight: number;
}

export const PulseOverlay: React.FC<PulseOverlayProps> = ({
  tasks,
  projectStartDate,
  columnWidth,
  viewMode,
  rowHeight,
}) => {
  const criticalConnections = useMemo(() => {
    const lines: ReactNode[] = []

    tasks.forEach((task, index) => {
      // CPM-MS.9: Определение критичности с учётом типа задачи (leaf vs summary)
      const taskCriticalInfo = getCriticalInfo(task)
      
      // GANTT-NAV: Summary задачи и filler'ы (EmptyTask) не участвуют в критическом пути
      if (!taskCriticalInfo.isOnCriticalPath || !task.dependencies || task.originalTask?.isFiller || task.type === 'empty') return

      task.dependencies.forEach((depId: string) => {
        const depIndex = tasks.findIndex(t => t.id === depId)
        if (depIndex === -1) return

        const depTask = tasks[depIndex]
        const depCriticalInfo = getCriticalInfo(depTask)

        // Связи только между leaf-задачами на критическом пути
        if (depCriticalInfo.isOnCriticalPath) {
          const startX = GanttNavigationService.dateToStepIndex(depTask.end, projectStartDate, viewMode) * columnWidth
          const startY = depIndex * rowHeight + (rowHeight / 2)
          const endX = GanttNavigationService.dateToStepIndex(task.start, projectStartDate, viewMode) * columnWidth
          const endY = index * rowHeight + (rowHeight / 2)

          const midX = startX + Math.max(20, (endX - startX) / 2)

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
            />,
          )
        }
      })
    })

    return lines
  }, [tasks, projectStartDate, columnWidth, viewMode, rowHeight])

  return (
    <g className="pulse-overlay-layer">
      {criticalConnections}
    </g>
  )
}

/**
 * CPM-MS.9: Определяет критическую информацию о задаче.
 * По стандарту MS Project summary задачи НЕ на критическом пути.
 * 
 * @returns isOnCriticalPath - находится ли на критическом пути (только leaf)
 * @returns containsCritical - содержит ли критические дети (только summary)
 */
function getCriticalInfo(task: IPulseTask): { isOnCriticalPath: boolean; containsCritical: boolean } {
  const originalTask = task.originalTask
  if (!originalTask) {
    return { isOnCriticalPath: false, containsCritical: false }
  }

  const isSummary = originalTask.isSummary === true

  if (isSummary) {
    // Summary задачи НЕ на критическом пути (MS Project Standard)
    return {
      isOnCriticalPath: false,
      containsCritical: originalTask.containsCriticalChildren === true,
    }
  }

  // Leaf задачи: стандартная проверка критичности
  const isCritical = originalTask.critical ?? originalTask.criticalPath ?? originalTask.isCritical ?? false
  return {
    isOnCriticalPath: isCritical,
    containsCritical: false,
  }
}
