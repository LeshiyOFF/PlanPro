import { NetworkNode, NetworkConnection, NetworkLayoutStrategy, NetworkNodeType } from '../interfaces/NetworkDiagram'

/**
 * Professional hierarchical layout strategy for Network Diagram (Sugiyama-style)
 * Organizes nodes into layers based on dependencies.
 * Supports hierarchy: summary tasks as containers around their children.
 */
export class SugiyamaLayoutStrategy implements NetworkLayoutStrategy {
  private readonly NODE_WIDTH = 180
  private readonly NODE_HEIGHT = 80
  private readonly HORIZONTAL_GAP = 60
  private readonly VERTICAL_GAP = 40
  private readonly CONTAINER_PADDING = 20

  public calculateLayout(nodes: NetworkNode[], connections: NetworkConnection[]): NetworkNode[] {
    if (nodes.length === 0) return []

    // Разделяем на leaf nodes и summary nodes
    const leafNodes = nodes.filter(n => n.type !== NetworkNodeType.SUMMARY)
    const summaryNodes = nodes.filter(n => n.type === NetworkNodeType.SUMMARY)

    // 1. Раскладываем только leaf nodes по зависимостям
    const positionedLeafs = this.layoutLeafNodes(leafNodes, connections)

    // 2. Позиционируем summary nodes как контейнеры вокруг дочерних
    const positionedSummaries = this.layoutSummaryNodes(summaryNodes, positionedLeafs)

    return [...positionedLeafs, ...positionedSummaries]
  }

  /**
   * Раскладка листовых узлов по зависимостям (Sugiyama)
   */
  private layoutLeafNodes(nodes: NetworkNode[], connections: NetworkConnection[]): NetworkNode[] {
    if (nodes.length === 0) return []

    const nodeLayers = this.assignLayers(nodes, connections)
    const layerGroups = this.groupByLayer(nodeLayers)

    return nodes.map(node => {
      if (node.isPinned && (node.x !== 0 || node.y !== 0)) {
        return node
      }

      const layer = nodeLayers.get(node.id) || 0
      const nodesInLayer = layerGroups.get(layer) || []
      const indexInLayer = nodesInLayer.indexOf(node.id)

      return {
        ...node,
        x: 50 + layer * (this.NODE_WIDTH + this.HORIZONTAL_GAP),
        y: 50 + indexInLayer * (this.NODE_HEIGHT + this.VERTICAL_GAP),
        width: this.NODE_WIDTH,
        height: this.NODE_HEIGHT,
      }
    })
  }

  /**
   * Позиционирование summary nodes как контейнеров вокруг дочерних задач
   */
  private layoutSummaryNodes(summaryNodes: NetworkNode[], leafNodes: NetworkNode[]): NetworkNode[] {
    return summaryNodes.map(summary => {
      const childIds = summary.childIds || []
      const children = leafNodes.filter(n => childIds.includes(n.id))

      if (children.length === 0) {
        // Нет дочерних — позиционируем как обычный узел
        return { ...summary, width: this.NODE_WIDTH, height: this.NODE_HEIGHT }
      }

      // Вычисляем bounding box дочерних задач
      const bounds = this.calculateBoundingBox(children)

      return {
        ...summary,
        x: bounds.minX - this.CONTAINER_PADDING,
        y: bounds.minY - this.CONTAINER_PADDING - 30, // Место под заголовок
        width: bounds.maxX - bounds.minX + this.NODE_WIDTH + this.CONTAINER_PADDING * 2,
        height: bounds.maxY - bounds.minY + this.NODE_HEIGHT + this.CONTAINER_PADDING * 2 + 30,
      }
    })
  }

  /**
   * Вычисление bounding box для группы узлов
   */
  private calculateBoundingBox(nodes: NetworkNode[]): { minX: number; minY: number; maxX: number; maxY: number } {
    if (nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    nodes.forEach(node => {
      minX = Math.min(minX, node.x)
      minY = Math.min(minY, node.y)
      maxX = Math.max(maxX, node.x)
      maxY = Math.max(maxY, node.y)
    })

    return { minX, minY, maxX, maxY }
  }

  /**
   * Группировка узлов по слоям
   */
  private groupByLayer(nodeLayers: Map<string, number>): Map<number, string[]> {
    const layerGroups = new Map<number, string[]>()
    nodeLayers.forEach((layer, nodeId) => {
      if (!layerGroups.has(layer)) layerGroups.set(layer, [])
      layerGroups.get(layer)!.push(nodeId)
    })
    return layerGroups
  }

  /**
   * Assigns each node to a layer based on its longest path from start
   */
  private assignLayers(nodes: NetworkNode[], connections: NetworkConnection[]): Map<string, number> {
    const nodeLayers = new Map<string, number>()
    const nodeIds = new Set(nodes.map(n => n.id))

    // Фильтруем connections только для текущих nodes
    const relevantConns = connections.filter(c => nodeIds.has(c.fromId) && nodeIds.has(c.toId))

    nodes.forEach(node => {
      const hasPredecessor = relevantConns.some(c => c.toId === node.id)
      if (!hasPredecessor) {
        nodeLayers.set(node.id, 0)
      }
    })

    let changed = true
    let iterations = 0
    const maxIterations = nodes.length * 2

    while (changed && iterations < maxIterations) {
      changed = false
      iterations++
      relevantConns.forEach((conn) => {
        const fromLayer = nodeLayers.get(conn.fromId)
        if (fromLayer !== undefined) {
          const currentToLayer = nodeLayers.get(conn.toId)
          const nextLayer = fromLayer + 1
          if (currentToLayer === undefined || nextLayer > currentToLayer) {
            nodeLayers.set(conn.toId, nextLayer)
            changed = true
          }
        }
      })
    }

    nodes.forEach(node => {
      if (!nodeLayers.has(node.id)) {
        nodeLayers.set(node.id, 0)
      }
    })

    return nodeLayers
  }
}


