import { 
  CanvasPoint, 
  GanttTimeline, 
  GanttTaskRender, 
  GanttInteractionType,
  GanttInteraction,
  InteractionResult
} from '../interfaces/GanttCanvas';

/**
 * Service for handling Gantt bar interactions (Drag & Resize)
 */
export class GanttInteractionService {
  private readonly RESIZE_HANDLE_WIDTH = 8;

  /**
   * Determine the type of interaction based on click position on a task bar
   */
  public getInteractionType(point: CanvasPoint, task: GanttTaskRender): GanttInteractionType {
    const isAtStart = point.x >= task.x && point.x <= task.x + this.RESIZE_HANDLE_WIDTH;
    const isAtEnd = point.x >= (task.x + task.width - this.RESIZE_HANDLE_WIDTH) && point.x <= task.x + task.width;

    if (isAtStart) return GanttInteractionType.RESIZE_START;
    if (isAtEnd) return GanttInteractionType.RESIZE_END;
    return GanttInteractionType.DRAG;
  }

  /**
   * Calculate new dates based on current interaction and mouse position
   */
  public calculateUpdate(
    interaction: GanttInteraction,
    currentPoint: CanvasPoint,
    timeline: GanttTimeline
  ): InteractionResult {
    const deltaX = currentPoint.x - interaction.startPoint.x;
    const dayWidth = 24 * timeline.scale;
    const daysDelta = Math.round(deltaX / dayWidth);

    const newStartDate = new Date(interaction.originalStartDate);
    const newEndDate = new Date(interaction.originalEndDate);

    switch (interaction.type) {
      case GanttInteractionType.DRAG:
        newStartDate.setDate(newStartDate.getDate() + daysDelta);
        newEndDate.setDate(newEndDate.getDate() + daysDelta);
        break;
      case GanttInteractionType.RESIZE_START:
        newStartDate.setDate(newStartDate.getDate() + daysDelta);
        // Ensure duration is at least 1 day
        if (newStartDate >= newEndDate) {
          newStartDate.setTime(newEndDate.getTime() - 24 * 60 * 60 * 1000);
        }
        break;
      case GanttInteractionType.RESIZE_END:
        newEndDate.setDate(newEndDate.getDate() + daysDelta);
        // Ensure duration is at least 1 day
        if (newEndDate <= newStartDate) {
          newEndDate.setTime(newStartDate.getTime() + 24 * 60 * 60 * 1000);
        }
        break;
      default:
        break;
    }

    return {
      taskId: interaction.taskId,
      newStartDate,
      newEndDate
    };
  }
}


