import { Task } from '@/types/task-types';
import { GanttTaskRender } from '../canvas/interfaces/GanttCanvas';
import { VarianceCalculator } from './VarianceCalculator';
import { GANTT_CONSTANTS } from '../canvas/GanttConstants';

/**
 * Сервис для преобразования доменных моделей задач в данные для отрисовки на Canvas.
 * Соответствует SOLID: Single Responsibility Principle.
 */
export class GanttTaskMapper {
  /**
   * Преобразует список задач в массив данных для рендеринга.
   */
  public static mapTasksToRenderData(
    tasks: any[],
    selectedTaskId: string | null,
    startDate: Date,
    zoomLevel: number,
    calculatePosition: (start: Date, timelineStart: Date) => number,
    calculateDuration: (start: Date, end: Date) => number
  ): GanttTaskRender[] {
    if (!Array.isArray(tasks)) return [];

    return tasks.map((task, index) => {
      const start = task.startDate ? new Date(task.startDate) : new Date();
      const end = task.endDate ? new Date(task.endDate) : new Date(start.getTime() + 24 * 60 * 60 * 1000);
      
      const renderTask: GanttTaskRender = {
        id: task.id || `task-${index}`,
        name: task.name || `Task ${index + 1}`,
        startDate: start,
        endDate: end,
        progress: task.progress || 0,
        color: task.color || '#3b82f6',
        selected: selectedTaskId === task.id,
        level: task.level || 0,
        parent: task.parent,
        children: task.children,
        x: calculatePosition(start, startDate),
        y: index * GANTT_CONSTANTS.ROW_HEIGHT,
        width: calculateDuration(start, end),
        height: GANTT_CONSTANTS.TASK_BAR_HEIGHT,
        segments: task.segments?.map((s: any) => ({
          x: calculatePosition(new Date(s.startDate), startDate),
          width: calculateDuration(new Date(s.startDate), new Date(s.endDate)),
          startDate: new Date(s.startDate),
          endDate: new Date(s.endDate)
        }))
      };

      this.applyBaselineAndVariance(renderTask, task, startDate, calculatePosition, calculateDuration);

      return renderTask;
    });
  }

  /**
   * Накладывает данные базового плана и отклонений на объект рендеринга.
   */
  private static applyBaselineAndVariance(
    renderTask: GanttTaskRender,
    task: any,
    startDate: Date,
    calculatePosition: (start: Date, timelineStart: Date) => number,
    calculateDuration: (start: Date, end: Date) => number
  ): void {
    if (task.baselineStartDate && task.baselineEndDate) {
      const bStart = new Date(task.baselineStartDate);
      const bEnd = new Date(task.baselineEndDate);
      
      renderTask.baselineX = calculatePosition(bStart, startDate);
      renderTask.baselineWidth = calculateDuration(bStart, bEnd);
      renderTask.hasBaseline = true;

      const varianceDays = VarianceCalculator.calculateFinishVarianceDays(task as Task);
      if (varianceDays !== 0) {
        renderTask.varianceDays = varianceDays;
        const bFinishX = renderTask.baselineX + renderTask.baselineWidth;
        const currentFinishX = renderTask.x + renderTask.width;
        
        renderTask.varianceX = Math.min(bFinishX, currentFinishX);
        renderTask.varianceWidth = Math.abs(currentFinishX - bFinishX);
      }
    }
  }
}


