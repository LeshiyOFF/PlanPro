import { 
  CanvasContext, 
  CanvasLayer, 
  GanttCanvasData, 
  GanttTaskRender
} from '../interfaces/GanttCanvas';
import { GanttTaskColorProvider } from './GanttTaskColorProvider';
import { GanttTaskTypeValidator } from './GanttTaskTypeValidator';
import { MilestoneRenderer } from './MilestoneRenderer';
import { SummaryTaskRenderer } from './SummaryTaskRenderer';
import { CriticalPathRenderer } from './CriticalPathRenderer';
import { ProgressRenderer } from './ProgressRenderer';
import { GANTT_CONSTANTS } from '../GanttConstants';
import { TaskSegmentRenderer } from './TaskSegmentRenderer';

/**
 * Enhanced Task bars layer with GC001-GC006 support
 */
export class TaskBarsLayer implements CanvasLayer {
  id = 'task-bars';
  name = 'Task Bars';
  visible = true;
  zIndex = 5;
  public static readonly ROW_HEIGHT = GANTT_CONSTANTS.ROW_HEIGHT;
  public static readonly HEADER_WIDTH = GANTT_CONSTANTS.HEADER_WIDTH;
  public static readonly TIMELINE_HEADER_HEIGHT = GANTT_CONSTANTS.TIMELINE_HEADER_HEIGHT;

  render(context: CanvasContext, data: GanttCanvasData): void {
    const { ctx, width, height, scale, offsetX, offsetY } = context;
    
    ctx.save();
    
    for (let i = 0; i < data.tasks.length; i++) {
      const task = data.tasks[i];
      const renderData = this.calculateRenderData(task, i, offsetY, scale, offsetX);
      
      if (this.isOutsideViewport(renderData, width, height)) continue;
      
      // GC005: Milestone Display - отображение вех (вместо обычной полоски)
      if (GanttTaskTypeValidator.isMilestone(task)) {
        MilestoneRenderer.drawMilestone(ctx, renderData);
      } 
      // GC006: Summary Task Display - отображение суммарных задач (вместо обычной полоски)
      else if (GanttTaskTypeValidator.isSummaryTask(task)) {
        SummaryTaskRenderer.drawSummaryTask(ctx, renderData);
      }
      // Split Task Display - прерванные задачи
      else if (task.segments && task.segments.length > 0) {
        TaskSegmentRenderer.drawSegments(ctx, renderData, offsetX, scale);
      }
      // GC001: Task Bar Display - обычные задачи
      else {
        this.drawTaskBar(ctx, renderData);
        
        // GC003: Progress Display - только для обычных задач
        if (ProgressRenderer.hasProgress(task)) {
          ProgressRenderer.drawProgress(ctx, renderData);
        }
      }
      
      // GC004: Critical Path Highlight - для всех типов может быть актуально
      if (GanttTaskTypeValidator.isCriticalPath(task)) {
        CriticalPathRenderer.highlightCriticalPath(ctx, renderData);
      }
      
      this.drawTaskName(ctx, renderData);
    }
    
    ctx.restore();
  }

  /**
   * Calculate render data for task
   */
  private calculateRenderData(
    task: GanttTaskRender,
    index: number,
    offsetY: number,
    scale: number,
    offsetX: number
  ) {
    return {
      task,
      x: (task.x + offsetX + TaskBarsLayer.HEADER_WIDTH) * scale,
      y: (index * TaskBarsLayer.ROW_HEIGHT + offsetY + TaskBarsLayer.TIMELINE_HEADER_HEIGHT + 5) * scale,
      width: task.width * scale,
      height: (TaskBarsLayer.ROW_HEIGHT - 10) * scale
    };
  }

  /**
   * Check if task is outside viewport
   */
  private isOutsideViewport(renderData: any, width: number, height: number): boolean {
    const { x, y, width: taskWidth, height: taskHeight } = renderData;
    
    return (
      y + taskHeight <= 0 ||
      y >= height ||
      x + taskWidth <= 0 ||
      x >= width
    );
  }

  /**
   * GC001: Task Bar Display - основное отображение задач
   */
  private drawTaskBar(ctx: CanvasRenderingContext2D, renderData: any): void {
    const { task, x, y, width, height } = renderData;
    
    // GC002: Task Bar Colors - применение цветовой схемы
    const fillColor = GanttTaskColorProvider.getTaskBarColor(task);
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, width, height);
    
    // Рамка задачи
    const borderColor = GanttTaskColorProvider.getTaskBarBorderColor(task);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = task.selected ? 2 : 1;
    ctx.strokeRect(x, y, width, height);
  }

  /**
   * Draw task name on bar
   */
  private drawTaskName(ctx: CanvasRenderingContext2D, renderData: any): void {
    const { task, x, y, width, height } = renderData;
    
    if (width > 50) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(task.name, x + width / 2, y + height / 2);
    }
  }
}
