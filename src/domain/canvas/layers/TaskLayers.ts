import { 
  CanvasContext, 
  CanvasLayer, 
  GanttCanvasData, 
  GanttTaskRender
} from '../interfaces/GanttCanvas';
import { GANTT_CONSTANTS } from '../GanttConstants';

/**
 * Task rows layer
 */
export class TaskRowsLayer implements CanvasLayer {
  id = 'task-rows';
  name = 'Task Rows';
  visible = true;
  zIndex = 3;
  private rowHeight = GANTT_CONSTANTS.ROW_HEIGHT;
  private headerWidth = GANTT_CONSTANTS.HEADER_WIDTH;
  private headerHeight = GANTT_CONSTANTS.TIMELINE_HEADER_HEIGHT;

  render(context: CanvasContext, data: GanttCanvasData): void {
    const { ctx, width, height, scale, offsetY } = context;
    
    ctx.save();
    
    for (let i = 0; i < data.tasks.length; i++) {
      const y = (i * this.rowHeight + offsetY + this.headerHeight) * scale;
      
      if (y + this.rowHeight * scale <= 0) continue;
      if (y >= height) break;
      
      this.drawRowBackground(ctx, i, y, width, scale);
      this.drawRowBorder(ctx, y, width, scale);
    }
    
    ctx.restore();
  }

  /**
   * Draw row background
   */
  private drawRowBackground(
    ctx: CanvasRenderingContext2D,
    index: number,
    y: number,
    width: number,
    scale: number
  ): void {
    ctx.fillStyle = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
    ctx.fillRect(this.headerWidth * scale, y, (width - this.headerWidth) * scale, this.rowHeight * scale);
  }

  /**
   * Draw row border
   */
  private drawRowBorder(
    ctx: CanvasRenderingContext2D,
    y: number,
    width: number,
    scale: number
  ): void {
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.headerWidth * scale, y + this.rowHeight * scale);
    ctx.lineTo(width * scale, y + this.rowHeight * scale);
    ctx.stroke();
  }
}

/**
 * Task names layer
 */
export class TaskNamesLayer implements CanvasLayer {
  id = 'task-names';
  name = 'Task Names';
  visible = true;
  zIndex = 4;
  private rowHeight = GANTT_CONSTANTS.ROW_HEIGHT;
  private headerWidth = 200;
  private headerHeight = GANTT_CONSTANTS.TIMELINE_HEADER_HEIGHT;

  render(context: CanvasContext, data: GanttCanvasData): void {
    const { ctx, width, height, scale, offsetY } = context;
    
    ctx.save();
    
    this.drawNameHeader(ctx, width, scale);
    this.drawNameBorder(ctx, height, scale);
    this.drawTaskNames(ctx, data.tasks, height, scale, offsetY);
    
    ctx.restore();
  }

  /**
   * Draw name header background
   */
  private drawNameHeader(ctx: CanvasRenderingContext2D, width: number, scale: number): void {
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, this.headerWidth * scale, this.headerHeight * scale);
  }

  /**
   * Draw name border
   */
  private drawNameBorder(ctx: CanvasRenderingContext2D, height: number, scale: number): void {
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.headerWidth * scale, 0);
    ctx.lineTo(this.headerWidth * scale, height);
    ctx.stroke();
  }

  /**
   * Draw task names
   */
  private drawTaskNames(
    ctx: CanvasRenderingContext2D,
    tasks: GanttTaskRender[],
    height: number,
    scale: number,
    offsetY: number
  ): void {
    ctx.fillStyle = '#212529';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const y = (i * this.rowHeight + offsetY + this.headerHeight + this.rowHeight / 2) * scale;
      
      if (y <= 0) continue;
      if (y >= height) break;
      
      const indent = task.level * GANTT_CONSTANTS.INDENT_SIZE;
      
      ctx.fillStyle = task.selected ? '#0066cc' : '#212529';
      ctx.fillText(task.name, (indent + 10) * scale, y);
    }
  }
}

