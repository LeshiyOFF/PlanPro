import { GanttTaskRender } from '../interfaces/GanttCanvas';
import { GanttTaskColorProvider } from './GanttTaskColorProvider';

/**
 * Progress renderer for task completion
 * GC003: Progress Display
 */
export class ProgressRenderer {
  /**
   * Draw progress bar on task
   */
  static drawProgress(ctx: CanvasRenderingContext2D, renderData: any): void {
    const { task, x, y, width, height } = renderData;
    
    if (task.progress > 0 && task.progress <= 1) {
      const progressWidth = width * task.progress;
      
      // Основной прогресс
      ctx.fillStyle = GanttTaskColorProvider.getProgressColor(task);
      ctx.fillRect(x, y, progressWidth, height);
      
      // Текст прогресса (если есть место)
      if (width > 60) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.round(task.progress * 100)}%`, x + progressWidth / 2, y + height / 2);
      }
    }
  }

  /**
   * Check if task has progress to display
   */
  static hasProgress(task: GanttTaskRender): boolean {
    return task.progress !== undefined && task.progress > 0;
  }
}

