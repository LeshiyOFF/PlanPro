import { 
  CanvasContext, 
  CanvasLayer, 
  GanttCanvasData, 
  GanttTimelineInterval
} from '../interfaces/GanttCanvas';
import { GANTT_CONSTANTS } from '../GanttConstants';

/**
 * Timeline grid layer
 */
export class TimelineGridLayer implements CanvasLayer {
  id = 'timeline-grid';
  name = 'Timeline Grid';
  visible = true;
  zIndex = 1;

  render(context: CanvasContext, data: GanttCanvasData): void {
    const { ctx, width, height, scale, offsetX } = context;
    
    ctx.save();
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    this.drawVerticalGridLines(ctx, data.timeline.intervals, width, height, scale, offsetX);
    
    ctx.restore();
  }

  /**
   * Draw vertical grid lines for timeline
   */
  private drawVerticalGridLines(
    ctx: CanvasRenderingContext2D,
    intervals: GanttTimelineInterval[],
    width: number,
    height: number,
    scale: number,
    offsetX: number
  ): void {
    for (const interval of intervals) {
      const x = (interval.x + offsetX + GANTT_CONSTANTS.HEADER_WIDTH) * scale;
      if (x >= GANTT_CONSTANTS.HEADER_WIDTH * scale && x <= width) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        
        // Draw weekend backgrounds
        if (interval.isWeekend) {
          ctx.fillStyle = 'rgba(240, 240, 240, 0.5)';
          ctx.fillRect(x, 0, interval.width * scale, height);
        }
        
        // Draw today line
        if (interval.isToday) {
          ctx.strokeStyle = '#ff6b6b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
          ctx.strokeStyle = '#e0e0e0';
          ctx.lineWidth = 1;
        }
      }
    }
  }
}

/**
 * Timeline header layer
 */
export class TimelineHeaderLayer implements CanvasLayer {
  id = 'timeline-header';
  name = 'Timeline Header';
  visible = true;
  zIndex = 2;
  private headerHeight = GANTT_CONSTANTS.TIMELINE_HEADER_HEIGHT;

  render(context: CanvasContext, data: GanttCanvasData): void {
    const { ctx, width, scale, offsetX } = context;
    
    ctx.save();
    
    this.drawHeaderBackground(ctx, width);
    this.drawHeaderBorder(ctx, width);
    this.drawTimelineLabels(ctx, data.timeline.intervals, width, scale, offsetX);
    
    ctx.restore();
  }

  /**
   * Draw header background
   */
  private drawHeaderBackground(ctx: CanvasRenderingContext2D, width: number): void {
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, this.headerHeight);
  }

  /**
   * Draw header border
   */
  private drawHeaderBorder(ctx: CanvasRenderingContext2D, width: number): void {
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, this.headerHeight);
    ctx.lineTo(width, this.headerHeight);
    ctx.stroke();
  }

  /**
   * Draw timeline labels
   */
  private drawTimelineLabels(
    ctx: CanvasRenderingContext2D,
    intervals: GanttTimelineInterval[],
    width: number,
    scale: number,
    offsetX: number
  ): void {
    ctx.fillStyle = '#495057';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (const interval of intervals) {
      const x = (interval.x + offsetX + GANTT_CONSTANTS.HEADER_WIDTH + interval.width / 2) * scale;
      if (x >= GANTT_CONSTANTS.HEADER_WIDTH * scale && x <= width) {
        ctx.fillText(interval.label, x, this.headerHeight / 2);
      }
    }
  }
}
