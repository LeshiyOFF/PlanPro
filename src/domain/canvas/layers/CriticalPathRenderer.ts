/**
 * Specialized renderer for critical path highlighting
 * GC004: Critical Path Highlight
 */
export class CriticalPathRenderer {
  /**
   * Draw critical path highlight around task
   */
  static highlightCriticalPath(ctx: CanvasRenderingContext2D, renderData: any): void {
    const { x, y, width, height } = renderData;
    
    ctx.save();
    
    // Красная рамка для критического пути
    ctx.strokeStyle = '#dc3545';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 3]);
    ctx.strokeRect(x - 1, y - 1, width + 2, height + 2);
    
    ctx.restore();
  }
}

