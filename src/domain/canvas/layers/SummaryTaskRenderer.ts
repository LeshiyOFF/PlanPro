/**
 * Specialized renderer for summary tasks
 * GC006: Summary Task Display
 */
export class SummaryTaskRenderer {
  /**
   * Draw summary task with brackets
   */
  static drawSummaryTask(ctx: CanvasRenderingContext2D, renderData: any): void {
    const { x, y, width, height } = renderData;
    
    ctx.save();
    
    // Основная полоса суммарной задачи
    ctx.fillStyle = 'rgba(108, 117, 125, 0.3)';
    ctx.fillRect(x, y + height * 0.3, width, height * 0.4);
    
    // Черные скобки на концах
    ctx.strokeStyle = '#343a40';
    ctx.lineWidth = 2;
    
    // Левая скобка
    ctx.beginPath();
    ctx.moveTo(x + 2, y + height * 0.3);
    ctx.lineTo(x + 2, y + height * 0.7);
    ctx.stroke();
    
    // Правая скобка
    ctx.beginPath();
    ctx.moveTo(x + width - 2, y + height * 0.3);
    ctx.lineTo(x + width - 2, y + height * 0.7);
    ctx.stroke();
    
    ctx.restore();
  }
}

