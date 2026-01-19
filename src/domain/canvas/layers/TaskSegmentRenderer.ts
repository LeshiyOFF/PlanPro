import { GanttTaskRender } from '../interfaces/GanttCanvas';
import { GanttTaskColorProvider } from './GanttTaskColorProvider';
import { TaskBarsLayer } from './TaskBarsLayer';

/**
 * TaskSegmentRenderer - Рендерер для сегментов прерванных задач.
 */
export class TaskSegmentRenderer {
  public static drawSegments(
    ctx: CanvasRenderingContext2D,
    renderData: any,
    offsetX: number,
    scale: number
  ): void {
    const { task, y, height } = renderData;
    if (!task.segments || task.segments.length === 0) return;

    // Расчет суммарной длительности для прогресса
    const totalDuration = task.segments.reduce((acc: number, s: any) => acc + s.width, 0);
    let remainingProgressWidth = totalDuration * (task.progress || 0);

    task.segments.forEach((seg: any, idx: number) => {
      const segX = (seg.x + offsetX + TaskBarsLayer.HEADER_WIDTH) * scale;
      const segWidth = seg.width * scale;

      this.drawSingleSegment(ctx, segX, y, segWidth, height, task);
      
      // Рисуем прогресс внутри сегмента
      if (remainingProgressWidth > 0) {
        const currentProgressWidth = Math.min(seg.width, remainingProgressWidth);
        this.drawSegmentProgress(ctx, segX, y, currentProgressWidth * scale, height, task);
        remainingProgressWidth -= currentProgressWidth;
      }

      // Рисуем пунктирную линию между сегментами
      if (idx < task.segments.length - 1) {
        const nextSeg = task.segments[idx + 1];
        const nextSegX = (nextSeg.x + offsetX + TaskBarsLayer.HEADER_WIDTH) * scale;
        this.drawSplitLine(ctx, segX + segWidth, nextSegX, y + height / 2);
      }
    });
  }

  private static drawSingleSegment(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    task: GanttTaskRender
  ): void {
    const fillColor = GanttTaskColorProvider.getTaskBarColor(task);
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, width, height);

    const borderColor = GanttTaskColorProvider.getTaskBarBorderColor(task);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = task.selected ? 2 : 1;
    ctx.strokeRect(x, y, width, height);
  }

  private static drawSegmentProgress(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    task: GanttTaskRender
  ): void {
    ctx.fillStyle = GanttTaskColorProvider.getProgressColor(task);
    ctx.fillRect(x, y, width, height);
  }

  private static drawSplitLine(
    ctx: CanvasRenderingContext2D,
    startX: number,
    endX: number,
    y: number
  ): void {
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();
    ctx.restore();
  }
}
