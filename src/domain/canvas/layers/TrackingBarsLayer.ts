import { 
  CanvasContext, 
  CanvasLayer, 
  GanttCanvasData, 
  GanttTaskRender
} from '../interfaces/GanttCanvas';
import { GanttTaskColorProvider } from './GanttTaskColorProvider';
import { GANTT_CONSTANTS } from '../GanttConstants';

/**
 * Tracking Gantt Layer
 * Displays both current and baseline task bars for comparison
 */
export class TrackingBarsLayer implements CanvasLayer {
  id = 'tracking-bars';
  name = 'Tracking Bars';
  visible = true;
  zIndex = 5;

  private readonly CURRENT_BAR_HEIGHT = 12;
  private readonly BASELINE_BAR_HEIGHT = 6;
  private readonly BAR_GAP = 2;

  render(context: CanvasContext, data: GanttCanvasData): void {
    const { ctx, width, height, scale, offsetX, offsetY } = context;
    ctx.save();
    
    data.tasks.forEach((task, index) => {
      const renderData = this.calculateRenderData(task, index, offsetY, scale, offsetX);
      if (this.isOutsideViewport(renderData, width, height)) return;

      // 1. Draw Baseline Bar (Background)
      if (task.hasBaseline && task.baselineX !== undefined && task.baselineWidth !== undefined) {
        this.drawBaselineBar(ctx, task, index, offsetY, scale, offsetX);
      }

      // 2. Draw Current Bar (Foreground)
      this.drawCurrentBar(ctx, renderData, task);
      
      // 3. Draw Variance Indicator
      if (task.hasBaseline && task.varianceDays !== undefined) {
        this.drawVarianceIndicator(ctx, task, index, offsetY, scale, offsetX);
      }
      
      // 4. Draw Progress
      if (task.progress > 0) {
        this.drawProgressBar(ctx, renderData, task);
      }
    });
    
    ctx.restore();
  }

  private calculateRenderData(task: GanttTaskRender, index: number, offsetY: number, scale: number, offsetX: number) {
    const rowY = (index * GANTT_CONSTANTS.ROW_HEIGHT + offsetY + GANTT_CONSTANTS.TIMELINE_HEADER_HEIGHT);
    return {
      x: (task.x + offsetX) * scale,
      y: (rowY + 4) * scale,
      width: task.width * scale,
      height: this.CURRENT_BAR_HEIGHT * scale
    };
  }

  private isOutsideViewport(rect: any, width: number, height: number): boolean {
    return rect.y + rect.height <= 0 || rect.y >= height || rect.x + rect.width <= 0 || rect.x >= width;
  }

  private drawBaselineBar(ctx: CanvasRenderingContext2D, task: GanttTaskRender, index: number, offsetY: number, scale: number, offsetX: number): void {
    const rowY = (index * GANTT_CONSTANTS.ROW_HEIGHT + offsetY + GANTT_CONSTANTS.TIMELINE_HEADER_HEIGHT);
    const x = (task.baselineX! + offsetX) * scale;
    const y = (rowY + this.CURRENT_BAR_HEIGHT + this.BAR_GAP + 4) * scale;
    const width = task.baselineWidth! * scale;
    const height = this.BASELINE_BAR_HEIGHT * scale;

    ctx.fillStyle = '#94a3b8'; // Slate 400 for baseline
    ctx.fillRect(x, y, width, height);
  }

  private drawCurrentBar(ctx: CanvasRenderingContext2D, rect: any, task: GanttTaskRender): void {
    ctx.fillStyle = GanttTaskColorProvider.getTaskBarColor(task);
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    
    ctx.strokeStyle = GanttTaskColorProvider.getTaskBarBorderColor(task);
    ctx.lineWidth = task.selected ? 2 : 1;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
  }

  private drawProgressBar(ctx: CanvasRenderingContext2D, rect: any, task: GanttTaskRender): void {
    const progressWidth = rect.width * task.progress;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    // Use a fixed small height for progress indicator inside the bar
    ctx.fillRect(rect.x, rect.y + rect.height * 0.7, progressWidth, rect.height * 0.2);
  }

  /**
   * Отрисовка индикатора отклонения (Variance)
   */
  private drawVarianceIndicator(ctx: CanvasRenderingContext2D, task: GanttTaskRender, index: number, offsetY: number, scale: number, offsetX: number): void {
    if (task.varianceX === undefined || task.varianceWidth === undefined || task.varianceDays === undefined) return;

    const rowY = (index * GANTT_CONSTANTS.ROW_HEIGHT + offsetY + GANTT_CONSTANTS.TIMELINE_HEADER_HEIGHT);
    const x = (task.varianceX + offsetX) * scale;
    const y = (rowY + 16) * scale; // Размещаем индикатор задержки под основным баром
    const width = task.varianceWidth * scale;
    const height = 3 * scale;

    ctx.fillStyle = task.varianceDays > 0 ? '#ef4444' : '#22c55e'; // Красный для задержки, Зеленый для опережения
    ctx.fillRect(x, y, width, height);
    
    // Опционально: можно добавить засечки на концах индикатора
    ctx.fillStyle = task.varianceDays > 0 ? '#b91c1c' : '#15803d';
    ctx.fillRect(x, y - 2, 1, height + 4);
    ctx.fillRect(x + width - 1, y - 2, 1, height + 4);
  }
}


