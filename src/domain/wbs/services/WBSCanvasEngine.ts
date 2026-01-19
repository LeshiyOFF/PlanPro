import { WBSDiagramData, WBSNode } from '../interfaces/WBS';
import { CanvasPoint } from '../../canvas/interfaces/GanttCanvas';

/**
 * Engine for rendering WBS (Work Breakdown Structure) on Canvas
 * Professional implementation with multi-cell nodes and critical path support
 */
export class WBSCanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private data: WBSDiagramData;
  private dpr: number;

  private readonly HEADER_HEIGHT = 20;
  private readonly FOOTER_HEIGHT = 20;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.dpr = window.devicePixelRatio || 1;
    this.data = {
      nodes: [],
      viewport: { scale: 1, offsetX: 0, offsetY: 0 }
    };
  }

  public updateData(data: Partial<WBSDiagramData>): void {
    this.data = { ...this.data, ...data };
  }

  /**
   * Main render loop
   */
  public render(): void {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const { scale, offsetX, offsetY } = this.data.viewport;

    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.scale(this.dpr, this.dpr);

    // Background
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillRect(0, 0, rect.width, rect.height);

    this.ctx.translate(offsetX, offsetY);
    this.ctx.scale(scale, scale);

    this.renderConnections();
    this.renderNodes();

    this.ctx.restore();
  }

  private renderConnections(): void {
    this.data.nodes.forEach(node => {
      if (node.parentId) {
        const parent = this.data.nodes.find(n => n.id === node.parentId);
        if (parent) {
          this.drawTreeConnection(parent, node);
        }
      }
    });
  }

  private drawTreeConnection(parent: WBSNode, child: WBSNode): void {
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#94a3b8';
    this.ctx.lineWidth = 1.5;

    const startX = parent.x + parent.width / 2;
    const startY = parent.y + parent.height;
    const endX = child.x + child.width / 2;
    const endY = child.y;

    const midY = startY + (endY - startY) / 2;

    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(startX, midY);
    this.ctx.lineTo(endX, midY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
  }

  private renderNodes(): void {
    this.data.nodes.forEach(node => {
      this.drawProfessionalWBSNode(node);
    });
  }

  /**
   * Professional multi-cell WBS node rendering
   */
  private drawProfessionalWBSNode(node: WBSNode): void {
    const { x, y, width, height, name, wbsCode, isSummary, progress, critical, duration } = node;
    const isSelected = this.data.selectedNodeId === node.id;
    const isHovered = this.data.hoveredNodeId === node.id;

    this.ctx.save();
    
    // 1. Shadow and Outer Shape
    this.ctx.shadowBlur = isSelected ? 12 : 4;
    this.ctx.shadowColor = isSelected ? 'rgba(31, 31, 31, 0.4)' : 'rgba(0,0,0,0.1)';
    this.ctx.shadowOffsetY = 2;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, width, height, 6);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // 2. Border (Critical Path Highlight)
    this.ctx.strokeStyle = isSelected ? '#1F1F1F' : (critical ? '#ef4444' : '#cbd5e1');
    this.ctx.lineWidth = isSelected || critical ? 2.5 : 1;
    this.ctx.stroke();

    // 3. Header: WBS Code & Duration
    this.ctx.fillStyle = critical ? '#fee2e2' : (isSummary ? '#f1f5f9' : '#ffffff');
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, width, this.HEADER_HEIGHT, { tl: 6, tr: 6, bl: 0, br: 0 });
    this.ctx.fill();
    
    this.ctx.fillStyle = '#475569';
    this.ctx.font = 'bold 9px sans-serif';
    this.ctx.fillText(wbsCode, x + 8, y + 14);
    
    this.ctx.textAlign = 'right';
    this.ctx.fillText(duration, x + width - 8, y + 14);
    this.ctx.textAlign = 'left';

    // 4. Content Area: Name
    this.ctx.fillStyle = '#1e293b';
    this.ctx.font = isSummary ? 'bold 11px sans-serif' : '11px sans-serif';
    this.wrapText(name, x + 8, y + 36, width - 16, 14);

    // 5. Footer: Start & Finish Dates
    const footerY = y + height - this.FOOTER_HEIGHT;
    this.ctx.strokeStyle = '#f1f5f9';
    this.ctx.beginPath();
    this.ctx.moveTo(x, footerY);
    this.ctx.lineTo(x + width, footerY);
    this.ctx.stroke();

    this.ctx.fillStyle = '#64748b';
    this.ctx.font = '9px sans-serif';
    this.ctx.fillText(node.startDate.toLocaleDateString(), x + 8, y + height - 7);
    this.ctx.textAlign = 'right';
    this.ctx.fillText(node.endDate.toLocaleDateString(), x + width - 8, y + height - 7);
    this.ctx.textAlign = 'left';

    // 6. Progress bar at the very bottom
    if (progress > 0) {
      this.ctx.fillStyle = '#e2e8f0';
      this.ctx.fillRect(x, y + height - 2, width, 2);
      this.ctx.fillStyle = progress === 1 ? '#10b981' : '#3b82f6';
      this.ctx.fillRect(x, y + height - 2, width * progress, 2);
    }

    // 7. Node Toggle (Expand/Collapse)
    if (isSummary) {
      this.drawNodeToggle(x + width / 2, y + height, node.isExpanded);
    }

    this.ctx.restore();
  }

  private drawNodeToggle(x: number, y: number, isExpanded: boolean): void {
    this.ctx.fillStyle = '#1F1F1F';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 9, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 14px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(isExpanded ? '-' : '+', x, y);
  }

  private wrapText(text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      if (this.ctx.measureText(testLine).width > maxWidth && n > 0) {
        this.ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    this.ctx.fillText(line, x, currentY);
  }
}

