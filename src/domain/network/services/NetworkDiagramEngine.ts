import { NetworkDiagramData, NetworkNode } from '../interfaces/NetworkDiagram'
import { CanvasPoint } from '@/domain/canvas/interfaces/GanttCanvas'
import { logger } from '@/utils/logger'
import { ThemeApplier } from '@/components/userpreferences/services/ThemeApplier'

/**
 * Engine for Network Diagram rendering and interaction
 * Handles the logic of drawing nodes and connections
 */
export class NetworkDiagramEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private data: NetworkDiagramData

  private readonly NODE_WIDTH = 180
  private readonly NODE_HEIGHT = 80
  private readonly HEADER_HEIGHT = 20
  private readonly FOOTER_HEIGHT = 20

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.data = {
      nodes: [],
      connections: [],
      viewport: { scale: 1, offsetX: 0, offsetY: 0 },
    }
  }

  public updateData(data: Partial<NetworkDiagramData>): void {
    this.data = { ...this.data, ...data }
  }

  public initialize(width: number, height: number): void {
    const dpr = window.devicePixelRatio || 1
    this.canvas.width = width * dpr
    this.canvas.height = height * dpr
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`

    // Clear any previous scaling
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.scale(dpr, dpr)

    logger.debug('Network diagram canvas initialized (HD)', { width, height, dpr }, 'NetworkDiagramEngine')
  }

  public getData(): NetworkDiagramData {
    return this.data
  }

  public render(): void {
    const { width, height } = this.canvas
    const { scale, offsetX, offsetY } = this.data.viewport

    this.ctx.clearRect(0, 0, width, height)
    this.ctx.save()

    // Background (ProjectLibre style light grid or flat)
    this.ctx.fillStyle = '#f8fafc'
    this.ctx.fillRect(0, 0, width, height)

    this.ctx.translate(offsetX, offsetY)
    this.ctx.scale(scale, scale)

    this.renderConnections()

    // Render draft connection if linking
    if (this.data.linkingFromId && this.data.hoveredNodeId === null) {
      // This part would need the current mouse point,
      // but we'll handle it via a separate render method or state
    }

    this.renderNodes()

    this.ctx.restore()
  }

  /**
   * Hit test to find node at specific point
   */
  public hitTestNode(point: CanvasPoint): string | null {
    const { scale, offsetX, offsetY } = this.data.viewport

    const logicX = (point.x - offsetX) / scale
    const logicY = (point.y - offsetY) / scale

    // Check nodes from top to bottom (reverse order)
    for (let i = this.data.nodes.length - 1; i >= 0; i--) {
      const node = this.data.nodes[i]
      if (logicX >= node.x && logicX <= node.x + node.width &&
          logicY >= node.y && logicY <= node.y + node.height) {
        return node.id
      }
    }
    return null
  }

  /**
   * Check if point is on a "port" (connection point)
   * Right side for OUT, Left side for IN
   */
  public hitTestPort(point: CanvasPoint, nodeId: string): 'in' | 'out' | null {
    const node = this.data.nodes.find(n => n.id === nodeId)
    if (!node) return null

    const { scale, offsetX, offsetY } = this.data.viewport
    const logicX = (point.x - offsetX) / scale
    const logicY = (point.y - offsetY) / scale

    // Увеличиваем зону попадания (hitbox) для удобства
    const portSize = 25 / scale // Адаптивный размер зоны попадания

    // Out port (right side)
    if (logicX >= node.x + node.width - portSize && logicX <= node.x + node.width + portSize &&
        logicY >= node.y + node.height / 2 - portSize && logicY <= node.y + node.height / 2 + portSize) {
      return 'out'
    }

    // In port (left side)
    if (logicX >= node.x - portSize && logicX <= node.x + portSize &&
        logicY >= node.y + node.height / 2 - portSize && logicY <= node.y + node.height / 2 + portSize) {
      return 'in'
    }

    return null
  }

  private renderConnections(): void {
    this.data.connections.forEach(conn => {
      const fromNode = this.data.nodes.find(n => n.id === conn.fromId)
      const toNode = this.data.nodes.find(n => n.id === conn.toId)

      if (fromNode && toNode) {
        this.drawBezierCurve(fromNode, toNode, conn.critical)
      }
    })
  }

  private drawBezierCurve(from: NetworkNode, to: NetworkNode, isCritical: boolean): void {
    this.ctx.beginPath()
    this.ctx.strokeStyle = isCritical ? '#ef4444' : '#94a3b8'
    this.ctx.lineWidth = isCritical ? 3 : 1.5

    const startX = from.x + from.width
    const startY = from.y + from.height / 2
    const endX = to.x
    const endY = to.y + to.height / 2

    const cp1X = startX + (endX - startX) / 2
    const cp2X = startX + (endX - startX) / 2

    this.ctx.moveTo(startX, startY)
    this.ctx.bezierCurveTo(cp1X, startY, cp2X, endY, endX, endY)
    this.ctx.stroke()
    this.drawArrow(endX, endY, isCritical ? '#ef4444' : '#94a3b8')
  }

  private drawArrow(x: number, y: number, color: string): void {
    this.ctx.save()
    this.ctx.fillStyle = color
    this.ctx.beginPath()
    this.ctx.moveTo(x, y)
    this.ctx.lineTo(x - 8, y - 4)
    this.ctx.lineTo(x - 8, y + 4)
    this.ctx.closePath()
    this.ctx.fill()
    this.ctx.restore()
  }

  private renderNodes(): void {
    this.data.nodes.forEach(node => {
      this.drawPERTNode(node)
    })
  }

  /**
   * Professional PERT node rendering (multi-cell block)
   */
  private drawPERTNode(node: NetworkNode): void {
    const width = node.width || this.NODE_WIDTH
    const height = node.height || this.NODE_HEIGHT
    const { x, y, name, duration, critical, displayId } = node
    const isSelected = this.data.selectedNodeId === node.id
    const isHovered = this.data.hoveredNodeId === node.id

    this.ctx.save()

    // Node Shadow
    this.ctx.shadowBlur = isSelected ? 10 : 4
    this.ctx.shadowColor = isSelected ? 'rgba(31, 31, 31, 0.5)' : 'rgba(0,0,0,0.1)'
    this.ctx.shadowOffsetY = 2

    // Background
    this.ctx.fillStyle = '#ffffff'
    this.ctx.beginPath()
    this.ctx.roundRect(x, y, width, height, 4)
    this.ctx.fill()
    this.ctx.shadowBlur = 0

    // Border
    this.ctx.strokeStyle = isSelected ? '#1F1F1F' : (critical ? '#ef4444' : '#cbd5e1')
    this.ctx.lineWidth = isSelected || isHovered ? 2 : 1
    this.ctx.stroke()

    // 1. Header Row (ID and Duration)
    this.ctx.fillStyle = critical ? '#fee2e2' : '#f8fafc'
    this.ctx.beginPath()
    this.ctx.roundRect(x, y, width, this.HEADER_HEIGHT, [4, 4, 0, 0])
    this.ctx.fill()

    // Header text
    this.ctx.fillStyle = '#475569'
    this.ctx.font = 'bold 10px sans-serif'
    this.ctx.fillText(displayId || node.id.substring(0, 5), x + 8, y + 14)
    this.ctx.textAlign = 'right'
    this.ctx.fillText(duration, x + width - 8, y + 14)
    this.ctx.textAlign = 'left'

    // 2. Middle Row (Name)
    this.ctx.fillStyle = '#1e293b'
    this.ctx.font = '11px sans-serif'
    this.wrapText(name, x + 8, y + 35, width - 16, 14)

    // 3. Footer Row (Start and Finish Dates)
    this.ctx.strokeStyle = '#f1f5f9'
    this.ctx.beginPath()
    this.ctx.moveTo(x, y + height - this.FOOTER_HEIGHT)
    this.ctx.lineTo(x + width, y + height - this.FOOTER_HEIGHT)
    this.ctx.stroke()

    this.ctx.fillStyle = '#64748b'
    this.ctx.font = '9px sans-serif'
    this.ctx.fillText(node.startDate.toLocaleDateString(), x + 8, y + height - 7)
    this.ctx.textAlign = 'right'
    this.ctx.fillText(node.endDate.toLocaleDateString(), x + width - 8, y + height - 7)
    this.ctx.textAlign = 'left'

    // 4. Progress bar at bottom
    if (node.progress > 0) {
      this.ctx.fillStyle = '#e2e8f0'
      this.ctx.fillRect(x, y + height - 2, width, 2)
      this.ctx.fillStyle = '#10b981'
      this.ctx.fillRect(x, y + height - 2, width * node.progress, 2)
    }

    // 5. Render Ports (if selected, hovered or linking)
    const isLinking = !!this.data.linkingFromId
    if (isSelected || isHovered || isLinking) {
      this.drawPorts(node)
    }

    this.ctx.restore()
  }

  private drawPorts(node: NetworkNode): void {
    const isSelected = this.data.selectedNodeId === node.id
    const isHovered = this.data.hoveredNodeId === node.id
    const isLinkingSource = this.data.linkingFromId === node.id
    const isLinkingPossibleTarget = !!this.data.linkingFromId && this.data.linkingFromId !== node.id && isHovered

    // Размер порта меняется в зависимости от состояния
    const baseSize = 5
    const portSize = isLinkingSource || isLinkingPossibleTarget ? 9 : (isHovered ? 7 : baseSize)

    this.ctx.save()

    // Свечение для активных портов
    if (isLinkingSource || isLinkingPossibleTarget) {
      this.ctx.shadowBlur = 10
      this.ctx.shadowColor = '#1F1F1F'
    }

    const accentColor = ThemeApplier.getCurrentAccentHex()
    this.ctx.fillStyle = isLinkingSource ? accentColor : (isLinkingPossibleTarget ? '#4A4A4A' : accentColor)
    this.ctx.strokeStyle = '#ffffff'
    this.ctx.lineWidth = 2

    // Out port (Right) - всегда рисуем если выбран или наведен
    if (isSelected || isHovered || isLinkingSource) {
      this.ctx.beginPath()
      this.ctx.arc(node.x + node.width, node.y + node.height / 2, portSize, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.stroke()
    }

    // In port (Left) - акцентируем если это потенциальный приемник связи
    if (isSelected || isHovered || isLinkingPossibleTarget) {
      this.ctx.beginPath()
      this.ctx.arc(node.x, node.y + node.height / 2, portSize, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.stroke()
    }

    this.ctx.restore()
  }

  private wrapText(text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
    const words = text.split(' ')
    let line = ''
    let currentY = y

    for (let n = 0; n < words.length; n++) {
      const word = words[n]
      const testLine = `${line + word  } `
      const metrics = this.ctx.measureText(testLine)
      const testWidth = metrics.width
      if (testWidth > maxWidth && n > 0) {
        this.ctx.fillText(line, x, currentY)
        line = `${word  } `
        currentY += lineHeight
      } else {
        line = testLine
      }
    }
    this.ctx.fillText(line, x, currentY)
  }
}



