import { WBSDiagramData, WBSNode } from '../interfaces/WBS'

/**
 * Engine for rendering WBS (Work Breakdown Structure) on Canvas
 * Professional implementation with multi-cell nodes and critical path support
 */
export class WBSCanvasEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private data: WBSDiagramData
  private dpr: number

  private readonly HEADER_HEIGHT = 20
  private readonly FOOTER_HEIGHT = 20

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.dpr = window.devicePixelRatio || 1
    this.data = {
      nodes: [],
      viewport: { scale: 1, offsetX: 0, offsetY: 0 },
    }
  }

  public updateData(data: Partial<WBSDiagramData>): void {
    this.data = { ...this.data, ...data }
  }

  /**
   * Main render loop
   */
  public render(): void {
    const parent = this.canvas.parentElement
    if (!parent) return

    const rect = parent.getBoundingClientRect()
    const { scale, offsetX, offsetY } = this.data.viewport

    this.canvas.style.width = `${rect.width}px`
    this.canvas.style.height = `${rect.height}px`
    this.canvas.width = rect.width * this.dpr
    this.canvas.height = rect.height * this.dpr

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.save()
    this.ctx.scale(this.dpr, this.dpr)

    // Background
    this.ctx.fillStyle = '#f8fafc'
    this.ctx.fillRect(0, 0, rect.width, rect.height)

    this.ctx.translate(offsetX, offsetY)
    this.ctx.scale(scale, scale)

    this.renderConnections(this.ctx)
    this.renderNodes(this.ctx)

    this.ctx.restore()
  }

  /**
   * Exports the entire WBS structure as a PNG Blob
   */
  public async exportFullDiagram(scale: number = 2): Promise<Blob> {
    const nodes = this.data.nodes
    if (nodes.length === 0) throw new Error('No nodes to export')

    // 1. Calculate bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    nodes.forEach(node => {
      minX = Math.min(minX, node.x)
      minY = Math.min(minY, node.y)
      maxX = Math.max(maxX, node.x + node.width)
      maxY = Math.max(maxY, node.y + node.height)
    })

    const padding = 50
    const width = (maxX - minX) + padding * 2
    const height = (maxY - minY) + padding * 2

    // 2. Create offscreen canvas
    const offCanvas = document.createElement('canvas')
    offCanvas.width = width * scale
    offCanvas.height = height * scale
    const offCtx = offCanvas.getContext('2d')!

    offCtx.save()
    offCtx.scale(scale, scale)

    // 3. Draw background
    offCtx.fillStyle = '#ffffff' // White background for export
    offCtx.fillRect(0, 0, width, height)

    // 4. Transform to fit all nodes
    offCtx.translate(-minX + padding, -minY + padding)

    // 5. Render diagram components
    this.renderConnections(offCtx)
    this.renderNodes(offCtx)

    // 6. Optional: Add a watermark or title
    offCtx.restore()

    return new Promise((resolve, reject) => {
      offCanvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to create blob'))
      }, 'image/png', 1.0)
    })
  }

  private renderConnections(ctx: CanvasRenderingContext2D): void {
    this.data.nodes.forEach(node => {
      if (node.parentId) {
        const parent = this.data.nodes.find(n => n.id === node.parentId)
        if (parent) {
          this.drawTreeConnection(ctx, parent, node)
        }
      }
    })
  }

  private drawTreeConnection(ctx: CanvasRenderingContext2D, parent: WBSNode, child: WBSNode): void {
    ctx.beginPath()
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 1.5

    const startX = parent.x + parent.width / 2
    const startY = parent.y + parent.height
    const endX = child.x + child.width / 2
    const endY = child.y

    const midY = startY + (endY - startY) / 2

    ctx.moveTo(startX, startY)
    ctx.lineTo(startX, midY)
    ctx.lineTo(endX, midY)
    ctx.lineTo(endX, endY)
    ctx.stroke()
  }

  private renderNodes(ctx: CanvasRenderingContext2D): void {
    this.data.nodes.forEach(node => {
      this.drawProfessionalWBSNode(ctx, node)
    })
  }

  /**
   * Professional multi-cell WBS node rendering
   */
  private drawProfessionalWBSNode(ctx: CanvasRenderingContext2D, node: WBSNode): void {
    const { x, y, width, height, name, wbsCode, isSummary, progress, critical, duration } = node
    const isSelected = this.data.selectedNodeId === node.id

    ctx.save()

    // 1. Shadow and Outer Shape
    ctx.shadowBlur = isSelected ? 12 : 4
    ctx.shadowColor = isSelected ? 'rgba(31, 31, 31, 0.4)' : 'rgba(0,0,0,0.1)'
    ctx.shadowOffsetY = 2

    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.roundRect(x, y, width, height, 6)
    ctx.fill()
    ctx.shadowBlur = 0

    // 2. Border (Critical Path Highlight)
    ctx.strokeStyle = isSelected ? '#1F1F1F' : (critical ? '#ef4444' : '#cbd5e1')
    ctx.lineWidth = isSelected || critical ? 2.5 : 1
    ctx.stroke()

    // 3. Header: WBS Code & Duration
    ctx.fillStyle = critical ? '#fee2e2' : (isSummary ? '#f1f5f9' : '#ffffff')
    ctx.beginPath()
    ctx.roundRect(x, y, width, this.HEADER_HEIGHT, [6, 6, 0, 0])
    ctx.fill()

    ctx.fillStyle = '#475569'
    ctx.font = 'bold 9px sans-serif'
    ctx.fillText(wbsCode, x + 8, y + 14)

    ctx.textAlign = 'right'
    ctx.fillText(duration, x + width - 8, y + 14)
    ctx.textAlign = 'left'

    // 4. Content Area: Name
    ctx.fillStyle = '#1e293b'
    ctx.font = isSummary ? 'bold 11px sans-serif' : '11px sans-serif'
    this.wrapText(ctx, name, x + 8, y + 36, width - 16, 14)

    // 5. Footer: Start & Finish Dates
    const footerY = y + height - this.FOOTER_HEIGHT
    ctx.strokeStyle = '#f1f5f9'
    ctx.beginPath()
    ctx.moveTo(x, footerY)
    ctx.lineTo(x + width, footerY)
    ctx.stroke()

    ctx.fillStyle = '#64748b'
    ctx.font = '9px sans-serif'
    ctx.fillText(node.startDate.toLocaleDateString(), x + 8, y + height - 7)
    ctx.textAlign = 'right'
    ctx.fillText(node.endDate.toLocaleDateString(), x + width - 8, y + height - 7)
    ctx.textAlign = 'left'

    // 6. Progress bar at the very bottom
    if (progress > 0) {
      ctx.fillStyle = '#e2e8f0'
      ctx.fillRect(x, y + height - 2, width, 2)
      ctx.fillStyle = progress === 1 ? '#10b981' : '#3b82f6'
      ctx.fillRect(x, y + height - 2, width * progress, 2)
    }

    // 7. Node Toggle (Expand/Collapse)
    if (isSummary) {
      this.drawNodeToggle(ctx, x + width / 2, y + height, node.isExpanded)
    }

    ctx.restore()
  }

  private drawNodeToggle(ctx: CanvasRenderingContext2D, x: number, y: number, isExpanded: boolean): void {
    ctx.fillStyle = '#1F1F1F'
    ctx.beginPath()
    ctx.arc(x, y, 9, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(isExpanded ? '-' : '+', x, y)
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
    const words = text.split(' ')
    let line = ''
    let currentY = y

    for (let n = 0; n < words.length; n++) {
      const testLine = `${line + words[n]  } `
      if (ctx.measureText(testLine).width > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY)
        line = `${words[n]  } `
        currentY += lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, x, currentY)
  }
}

