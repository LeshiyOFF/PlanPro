/**
 * Specialized renderer for milestone tasks
 * GC005: Milestone Display
 */
export class MilestoneRenderer {
  /**
   * Draw milestone as diamond shape
   */
  static drawMilestone(ctx: CanvasRenderingContext2D, renderData: any): void {
    const { x, y, width, height } = renderData;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const size = Math.min(width, height) * 0.6;
    
    ctx.save();
    
    // Ромб для вехи
    ctx.fillStyle = '#ff6b6b';
    ctx.strokeStyle = '#a61e1e';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - size / 2);
    ctx.lineTo(centerX + size / 2, centerY);
    ctx.lineTo(centerX, centerY + size / 2);
    ctx.lineTo(centerX - size / 2, centerY);
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }
}
