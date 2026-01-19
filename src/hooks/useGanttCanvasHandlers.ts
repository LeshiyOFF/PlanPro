import { useMemo, useState } from 'react';
import { 
  CanvasEventHandlers, 
  GanttInteraction, 
  GanttInteractionType,
  GanttCanvasEngine,
  GanttInteractionService,
  ContextMenuType
} from '@/domain';
import { logger } from '@/utils/logger';

/**
 * Хук для управления обработчиками событий Canvas в диаграмме Ганта.
 * Соответствует принципу Single Responsibility.
 */
export const useGanttCanvasHandlers = (
  engineRef: React.MutableRefObject<GanttCanvasEngine | null>,
  interactionService: GanttInteractionService,
  onTaskSelect?: (task: any) => void,
  onTaskDoubleClick?: (task: any) => void,
  onTaskUpdate?: (taskId: string, updates: { startDate: Date; endDate: Date }) => void,
  showMenu?: (type: ContextMenuType, options: any) => void
) => {
  const [currentInteraction, setCurrentInteraction] = useState<GanttInteraction | null>(null);

  const eventHandlers: CanvasEventHandlers = useMemo(() => ({
    onClick: (point, target) => {
      if (target) onTaskSelect?.(target);
    },
    
    onDoubleClick: (point, target) => {
      if (target) onTaskDoubleClick?.(target);
    },
    
    onRightClick: (point, target) => {
      if (target && showMenu) {
        showMenu(ContextMenuType.TASK, {
          target: { ...target, type: 'task' },
          position: { x: point.x, y: point.y }
        });
      }
    },
    
    onMouseMove: (point, target) => {
      if (!currentInteraction || !engineRef.current) return;
      const timeline = engineRef.current.getData().timeline;
      const result = interactionService.calculateUpdate(currentInteraction, point, timeline);
      onTaskUpdate?.(result.taskId, {
        startDate: result.newStartDate,
        endDate: result.newEndDate
      });
    },
    
    onMouseDown: (point, target) => {
      if (target) {
        const type = interactionService.getInteractionType(point, target);
        setCurrentInteraction({
          taskId: target.id,
          type,
          startPoint: point,
          originalStartDate: new Date(target.startDate),
          originalEndDate: new Date(target.endDate)
        });
      }
    },
    
    onMouseUp: () => {
      if (currentInteraction) {
        setCurrentInteraction(null);
        logger.debug('Interaction ended', { taskId: currentInteraction.taskId }, 'GanttCanvas');
      }
    },
    
    onWheel: (delta) => {
      if (engineRef.current) {
        const currentData = engineRef.current.getData();
        const newScale = Math.max(0.5, Math.min(3, currentData.viewport.scale + delta * -0.001));
        engineRef.current.updateData({
          viewport: { ...currentData.viewport, scale: newScale }
        });
        engineRef.current.render();
      }
    }
  }), [onTaskSelect, onTaskDoubleClick, onTaskUpdate, showMenu, currentInteraction, interactionService, engineRef]);

  return eventHandlers;
};

