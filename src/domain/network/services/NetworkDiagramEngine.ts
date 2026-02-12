import { NetworkDiagramData, NetworkNode, NetworkNodeType } from '../interfaces/NetworkDiagram'
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

  // Размеры узлов
  private readonly NODE_WIDTH = 180
  private readonly NODE_HEIGHT = 80
  private readonly HEADER_HEIGHT = 20
  private readonly FOOTER_HEIGHT = 20

  // Стили контейнеров суммарных задач (MS Project style)
  private readonly CONTAINER_HEADER_HEIGHT = 28
  private readonly CONTAINER_BORDER_RADIUS = 8
  private readonly COLLAPSE_BUTTON_SIZE = 18
  private readonly COLLAPSE_BUTTON_MARGIN = 8

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

    // 1. Сначала контейнеры (суммарные задачи) — фон под обычными узлами
    this.renderSummaryContainers()

    // 2. Затем связи
    this.renderConnections()

    // 3. Затем обычные узлы
    this.renderNodes()

    this.ctx.restore()
  }

  /**
   * Hit test to find node at specific point.
   * 
   * ПРИОРИТЕТ (как в MS Project / Primavera):
   * 1. Сначала проверяем LEAF-узлы (обычные задачи, вехи) — они имеют приоритет.
   * 2. Только если не попали в leaf, проверяем SUMMARY-контейнеры.
   * 
   * Это обеспечивает интерактивность дочерних задач внутри контейнеров:
   * hover → порты → возможность создания связей.
   */
  public hitTestNode(point: CanvasPoint): string | null {
    const { scale, offsetX, offsetY } = this.data.viewport

    const logicX = (point.x - offsetX) / scale
    const logicY = (point.y - offsetY) / scale

    // ПРИОРИТЕТ 1: Проверяем LEAF-узлы (от конца к началу для корректного z-order)
    for (let i = this.data.nodes.length - 1; i >= 0; i--) {
      const node = this.data.nodes[i]
      if (node.type === NetworkNodeType.SUMMARY) continue // Пропускаем summary
      
      if (logicX >= node.x && logicX <= node.x + node.width &&
          logicY >= node.y && logicY <= node.y + node.height) {
        return node.id
      }
    }

    // ПРИОРИТЕТ 2: Только если не попали в leaf, проверяем SUMMARY-контейнеры
    for (let i = this.data.nodes.length - 1; i >= 0; i--) {
      const node = this.data.nodes[i]
      if (node.type !== NetworkNodeType.SUMMARY) continue // Только summary
      
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

  /**
   * Hit test для кнопки сворачивания на суммарной задаче.
   * Возвращает ID узла, если клик попал на кнопку +/−.
   */
  public hitTestCollapseButton(point: CanvasPoint): string | null {
    const { scale, offsetX, offsetY } = this.data.viewport
    const logicX = (point.x - offsetX) / scale
    const logicY = (point.y - offsetY) / scale

    // Проверяем только суммарные узлы
    const summaryNodes = this.data.nodes.filter(n => n.type === NetworkNodeType.SUMMARY)

    for (const node of summaryNodes) {
      // Кнопка сворачивания находится в правом верхнем углу заголовка контейнера
      const btnX = node.x + node.width - this.COLLAPSE_BUTTON_MARGIN - this.COLLAPSE_BUTTON_SIZE
      const btnY = node.y + (this.CONTAINER_HEADER_HEIGHT - this.COLLAPSE_BUTTON_SIZE) / 2

      if (
        logicX >= btnX && logicX <= btnX + this.COLLAPSE_BUTTON_SIZE &&
        logicY >= btnY && logicY <= btnY + this.COLLAPSE_BUTTON_SIZE
      ) {
        return node.id
      }
    }

    return null
  }

  /**
   * Рендеринг контейнеров суммарных задач (MS Project style).
   * Суммарные задачи отображаются как группы с заголовком и вложенными задачами.
   */
  private renderSummaryContainers(): void {
    const summaryNodes = this.data.nodes.filter(n => n.type === NetworkNodeType.SUMMARY)

    summaryNodes.forEach(node => {
      this.drawSummaryContainer(node)
    })
  }

  /**
   * Отрисовка контейнера суммарной задачи.
   * Дизайн: полупрозрачный фон акцентного цвета, пунктирная рамка, заголовок сверху, кнопка +/−.
   */
  private drawSummaryContainer(node: NetworkNode): void {
    const { x, y, width, height, name, isCollapsed, critical, childIds } = node
    const isSelected = this.data.selectedNodeId === node.id
    const isHovered = this.data.hoveredNodeId === node.id
    const hasChildren = childIds && childIds.length > 0
    const accentColor = ThemeApplier.getCurrentAccentHex()

    this.ctx.save()

    // === 1. Фон контейнера (полупрозрачный акцентный цвет) ===
    const bgOpacity = critical ? 0.12 : 0.06
    const bgColor = this.hexToRgba(accentColor, bgOpacity)
    this.ctx.fillStyle = bgColor
    this.ctx.beginPath()
    this.ctx.roundRect(x, y, width, height, this.CONTAINER_BORDER_RADIUS)
    this.ctx.fill()

    // === 2. Пунктирная рамка контейнера (акцентный цвет) ===
    const borderOpacity = isSelected ? 1.0 : (critical ? 0.6 : 0.4)
    this.ctx.strokeStyle = this.hexToRgba(accentColor, borderOpacity)
    this.ctx.lineWidth = isSelected || isHovered ? 2 : 1.5
    this.ctx.setLineDash([6, 4])
    this.ctx.stroke()
    this.ctx.setLineDash([]) // Сброс пунктира

    // === 3. Заголовок контейнера (акцентный цвет, более насыщенный) ===
    const headerOpacity = critical ? 0.20 : 0.12
    const headerColor = this.hexToRgba(accentColor, headerOpacity)
    this.ctx.fillStyle = headerColor
    this.ctx.beginPath()
    this.ctx.roundRect(x, y, width, this.CONTAINER_HEADER_HEIGHT, [this.CONTAINER_BORDER_RADIUS, this.CONTAINER_BORDER_RADIUS, 0, 0])
    this.ctx.fill()

    // Разделительная линия под заголовком (акцентный цвет)
    const separatorOpacity = critical ? 0.4 : 0.25
    this.ctx.strokeStyle = this.hexToRgba(accentColor, separatorOpacity)
    this.ctx.lineWidth = 1
    this.ctx.beginPath()
    this.ctx.moveTo(x, y + this.CONTAINER_HEADER_HEIGHT)
    this.ctx.lineTo(x + width, y + this.CONTAINER_HEADER_HEIGHT)
    this.ctx.stroke()

    // === 4. Иконка папки и название суммарной задачи ===
    this.ctx.fillStyle = critical ? '#dc2626' : '#475569'
    this.ctx.font = 'bold 12px sans-serif'

    // Иконка папки (простая векторная)
    const iconX = x + 10
    const iconY = y + this.CONTAINER_HEADER_HEIGHT / 2 - 5
    this.drawFolderIcon(iconX, iconY, critical ? '#dc2626' : '#64748b')

    // Название задачи (с обрезкой если длинное)
    const maxTextWidth = width - this.COLLAPSE_BUTTON_SIZE - this.COLLAPSE_BUTTON_MARGIN * 2 - 30
    const displayName = this.truncateText(name, maxTextWidth)
    this.ctx.fillText(displayName, x + 28, y + this.CONTAINER_HEADER_HEIGHT / 2 + 4)

    // === 5. Кнопка сворачивания +/− (только если есть дочерние) ===
    if (hasChildren) {
      this.drawCollapseButton(
        x + width - this.COLLAPSE_BUTTON_MARGIN - this.COLLAPSE_BUTTON_SIZE,
        y + (this.CONTAINER_HEADER_HEIGHT - this.COLLAPSE_BUTTON_SIZE) / 2,
        isCollapsed ?? false,
        isHovered,
        accentColor
      )
    }

    // === 6. Индикатор количества дочерних задач ===
    if (hasChildren && childIds) {
      const countText = `${childIds.length}`
      this.ctx.fillStyle = '#64748b'
      this.ctx.font = '10px sans-serif'
      this.ctx.textAlign = 'right'
      this.ctx.fillText(countText, x + width - this.COLLAPSE_BUTTON_SIZE - this.COLLAPSE_BUTTON_MARGIN * 2 - 4, y + this.CONTAINER_HEADER_HEIGHT / 2 + 3)
      this.ctx.textAlign = 'left'
    }

    // === 7. Подсказка при свёрнутом состоянии ===
    if (isCollapsed && hasChildren && childIds) {
      this.ctx.fillStyle = '#94a3b8'
      this.ctx.font = 'italic 11px sans-serif'
      const collapsedText = `${childIds.length} задач скрыто`
      this.ctx.fillText(collapsedText, x + 10, y + height - 10)
    }

    this.ctx.restore()
  }

  /**
   * Отрисовка иконки папки в стиле Lucide.
   * Геометрия: скруглённые углы (arcTo), плавный скос верхнего клапана,
   * обводка без заливки, lineJoin/lineCap round для консистентности с Lucide.
   */
  private drawFolderIcon(x: number, y: number, color: string): void {
    const w = 14
    const h = 10
    const r = 1.5 // Характерное скругление Lucide (2px в 24px, масштаб ~1.5)
    const tabBottom = 3  // Высота «язычка» папки
    const tabLeft = 6
    const tabRight = 8

    this.ctx.save()
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = 1.5
    this.ctx.lineJoin = 'round'
    this.ctx.lineCap = 'round'

    this.ctx.beginPath()
    // Старт: левый нижний угол (после скругления)
    this.ctx.moveTo(x + r, y + h)
    this.ctx.lineTo(x + w - r, y + h)
    this.ctx.arcTo(x + w, y + h, x + w, y + h - r, r)
    this.ctx.lineTo(x + w, y + tabBottom + r)
    this.ctx.arcTo(x + w, y + tabBottom, x + w - r, y + tabBottom, r)
    this.ctx.lineTo(x + tabRight, y + tabBottom)
    this.ctx.lineTo(x + tabLeft, y)
    this.ctx.lineTo(x + r, y)
    this.ctx.arcTo(x, y, x, y + r, r)
    this.ctx.lineTo(x, y + h - r)
    this.ctx.arcTo(x, y + h, x + r, y + h, r)
    this.ctx.closePath()
    this.ctx.stroke()

    this.ctx.restore()
  }

  /**
   * Отрисовка кнопки сворачивания +/−.
   */
  private drawCollapseButton(x: number, y: number, isCollapsed: boolean, isHovered: boolean, accentColor: string): void {
    const size = this.COLLAPSE_BUTTON_SIZE

    this.ctx.save()

    // Фон кнопки
    this.ctx.fillStyle = isHovered ? accentColor : '#f1f5f9'
    this.ctx.strokeStyle = isHovered ? accentColor : '#cbd5e1'
    this.ctx.lineWidth = 1
    this.ctx.beginPath()
    this.ctx.roundRect(x, y, size, size, 4)
    this.ctx.fill()
    this.ctx.stroke()

    // Символ + или −
    this.ctx.fillStyle = isHovered ? '#ffffff' : '#475569'
    this.ctx.font = 'bold 14px sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText(isCollapsed ? '+' : '−', x + size / 2, y + size / 2)
    this.ctx.textAlign = 'left'
    this.ctx.textBaseline = 'alphabetic'

    this.ctx.restore()
  }

  /**
   * Обрезка текста с добавлением "..." если слишком длинный.
   */
  private truncateText(text: string, maxWidth: number): string {
    const metrics = this.ctx.measureText(text)
    if (metrics.width <= maxWidth) return text

    let truncated = text
    while (this.ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1)
    }
    return truncated + '...'
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
    // Рендерим только leaf-узлы (не суммарные задачи — они отрисованы как контейнеры)
    const leafNodes = this.data.nodes.filter(n => n.type !== NetworkNodeType.SUMMARY)
    leafNodes.forEach(node => {
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

  /**
   * Конвертация HEX цвета в RGBA с заданной прозрачностью.
   * Поддерживает форматы: #RGB, #RRGGBB.
   * 
   * @param hex - HEX цвет (например, '#10b981' или '#1a2')
   * @param alpha - Прозрачность от 0 до 1
   * @returns RGBA строка для Canvas (например, 'rgba(16, 185, 129, 0.12)')
   */
  private hexToRgba(hex: string, alpha: number): string {
    // Удаляем # если есть
    const cleanHex = hex.replace('#', '')
    
    let r: number, g: number, b: number
    
    if (cleanHex.length === 3) {
      // Формат #RGB -> #RRGGBB
      r = parseInt(cleanHex[0] + cleanHex[0], 16)
      g = parseInt(cleanHex[1] + cleanHex[1], 16)
      b = parseInt(cleanHex[2] + cleanHex[2], 16)
    } else {
      // Формат #RRGGBB
      r = parseInt(cleanHex.substring(0, 2), 16)
      g = parseInt(cleanHex.substring(2, 4), 16)
      b = parseInt(cleanHex.substring(4, 6), 16)
    }
    
    // Проверка на валидность
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      // Fallback на серый при ошибке парсинга
      return `rgba(148, 163, 184, ${alpha})`
    }
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
}



