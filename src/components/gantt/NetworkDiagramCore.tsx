import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import { NetworkDiagramEngine } from '@/domain/network/services/NetworkDiagramEngine'
import { SugiyamaLayoutStrategy } from '@/domain/network/layout/SugiyamaLayoutStrategy'
import { NetworkNode, NetworkConnection, NetworkNodeType } from '@/domain/network/interfaces/NetworkDiagram'
import { CanvasPoint } from '@/domain/canvas/interfaces/GanttCanvas'

interface NetworkDiagramCoreProps {
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  width?: number;
  height?: number;
  zoomLevel?: number;
  onNodesChange?: (nodes: NetworkNode[]) => void;
  onNodeSelect?: (nodeId: string | null) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
  onConnectionCreate?: (fromId: string, toId: string) => void;
  /** Колбэк для сворачивания/разворачивания суммарной задачи (клик на +/−). */
  onCollapseToggle?: (nodeId: string) => void;
}

/**
 * Core React component for Network Diagram
 * Coordinates layout strategy and rendering engine with interactivity
 */
export const NetworkDiagramCore: React.FC<NetworkDiagramCoreProps> = ({
  nodes: initialNodes,
  connections,
  width = 1200,
  height = 800,
  zoomLevel = 1,
  onNodesChange,
  onNodeSelect,
  onNodeDoubleClick,
  onConnectionCreate,
  onCollapseToggle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<NetworkDiagramEngine | null>(null)
  const layoutStrategy = useMemo(() => new SugiyamaLayoutStrategy(), [])

  const [viewport, setViewport] = useState({ scale: zoomLevel, offsetX: 0, offsetY: 0 })
  const [nodes, setNodes] = useState<NetworkNode[]>([])
  const [selection, setSelection] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [isLinking, setIsLinking] = useState(false)
  const [dragStart, setDragStart] = useState<CanvasPoint | null>(null)
  const [panStart, setPanStart] = useState<CanvasPoint | null>(null)
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null)
  const [linkingFromId, setLinkingFromId] = useState<string | null>(null)

  // 1. Initial layout or updates from props
  useEffect(() => {
    const positioned = layoutStrategy.calculateLayout(initialNodes, connections)
    setNodes(positioned)
  }, [initialNodes, connections, layoutStrategy])

  // 2. Initialize engine (HD support)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    engineRef.current = new NetworkDiagramEngine(canvas)
    engineRef.current.initialize(width, height)
  }, [width, height])

  // 3. Update engine and render
  useEffect(() => {
    if (!engineRef.current) return

    // Sync viewport scale with zoomLevel prop (only if not panning/zooming locally)
    // For now we trust the prop zoomLevel for the base scale

    engineRef.current.updateData({
      nodes,
      connections,
      viewport: { ...viewport, scale: viewport.scale },
      selectedNodeId: selection || undefined,
      linkingFromId: linkingFromId || undefined,
    })
    engineRef.current.render()
  }, [nodes, connections, viewport, selection, linkingFromId])

  // Sync zoomLevel prop to internal viewport state
  useEffect(() => {
    setViewport(prev => ({ ...prev, scale: zoomLevel }))
  }, [zoomLevel])

  // 4. Mouse Event Handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current || !engineRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    // Коэффициент пересчета экранных пикселей в логические пиксели холста (width/height)
    const cssScaleX = width / rect.width
    const cssScaleY = height / rect.height

    const point = {
      x: (e.clientX - rect.left) * cssScaleX,
      y: (e.clientY - rect.top) * cssScaleY,
    }

    // Приоритет 1: проверяем клик по кнопке сворачивания (+/−)
    const collapseNodeId = engineRef.current.hitTestCollapseButton(point)
    if (collapseNodeId) {
      onCollapseToggle?.(collapseNodeId)
      return // Не продолжаем обработку — клик обработан
    }

    const nodeId = engineRef.current.hitTestNode(point)
    if (nodeId) {
      const port = engineRef.current.hitTestPort(point, nodeId)
      if (port === 'out') {
        setIsLinking(true)
        setLinkingFromId(nodeId)
      } else {
        setSelection(nodeId)
        setDraggedNodeId(nodeId)
        setIsDragging(true)
        setDragStart(point)
        onNodeSelect?.(nodeId)
      }
    } else {
      // Start Panning
      setSelection(null)
      setIsPanning(true)
      setPanStart(point) // Используем point в логических координатах
      onNodeSelect?.(null)
    }
  }, [onNodeSelect, onCollapseToggle, width, height])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current || !engineRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    const cssScaleX = width / rect.width
    const cssScaleY = height / rect.height

    const currentPoint = {
      x: (e.clientX - rect.left) * cssScaleX,
      y: (e.clientY - rect.top) * cssScaleY,
    }

    if (isDragging && draggedNodeId && dragStart) {
      const dx = (currentPoint.x - dragStart.x) / viewport.scale
      const dy = (currentPoint.y - dragStart.y) / viewport.scale

      setNodes((prev: NetworkNode[]) => {
        // Определяем, является ли перемещаемый узел суммарной задачей
        const draggedNode = prev.find(n => n.id === draggedNodeId)
        const isSummaryNode = draggedNode?.type === NetworkNodeType.SUMMARY
        const childIds = isSummaryNode ? (draggedNode?.childIds || []) : []

        return prev.map((node: NetworkNode) => {
          // Перемещаем саму суммарную задачу ИЛИ все её дочерние задачи
          const shouldMove = node.id === draggedNodeId || childIds.includes(node.id)
          
          if (shouldMove) {
            return {
              ...node,
              x: node.x + dx,
              y: node.y + dy,
              isPinned: true,
            }
          }
          return node
        })
      })
      setDragStart(currentPoint)
    } else if (isPanning && panStart) {
      const dx = currentPoint.x - panStart.x
      const dy = currentPoint.y - panStart.y

      setViewport(prev => ({
        ...prev,
        offsetX: prev.offsetX + dx,
        offsetY: prev.offsetY + dy,
      }))
      setPanStart(currentPoint)
    } else if (isLinking && linkingFromId) {
      engineRef.current.updateData({ hoveredNodeId: engineRef.current.hitTestNode(currentPoint) ?? undefined })
      engineRef.current.render()
      const ctx = canvas.getContext('2d')!
      const fromNode = nodes.find(n => n.id === linkingFromId)
      if (fromNode) {
        const dpr = window.devicePixelRatio || 1
        ctx.save()
        ctx.scale(dpr, dpr)
        ctx.translate(viewport.offsetX, viewport.offsetY)
        ctx.scale(viewport.scale, viewport.scale)
        ctx.beginPath()
        ctx.strokeStyle = 'hsl(var(--primary))'
        ctx.setLineDash([5, 5])
        ctx.lineWidth = 2 / viewport.scale
        ctx.moveTo(fromNode.x + fromNode.width, fromNode.y + fromNode.height / 2)
        ctx.lineTo((currentPoint.x - viewport.offsetX) / viewport.scale,
          (currentPoint.y - viewport.offsetY) / viewport.scale)
        ctx.stroke()
        ctx.restore()
      }
    } else {
      // Normal hover
      const hoveredId = engineRef.current.hitTestNode(currentPoint)
      engineRef.current.updateData({ hoveredNodeId: hoveredId ?? undefined })
      engineRef.current.render()
    }
  }, [isDragging, isPanning, isLinking, draggedNodeId, linkingFromId, dragStart, panStart, nodes, viewport, width, height])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isLinking && linkingFromId && canvasRef.current && engineRef.current) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const cssScaleX = width / rect.width
      const cssScaleY = height / rect.height
      const point = {
        x: (e.clientX - rect.left) * cssScaleX,
        y: (e.clientY - rect.top) * cssScaleY,
      }

      const targetNodeId = engineRef.current.hitTestNode(point)
      if (targetNodeId && targetNodeId !== linkingFromId) {
        onConnectionCreate?.(linkingFromId, targetNodeId)
      }
      setIsLinking(false)
      setLinkingFromId(null)
      engineRef.current.updateData({ hoveredNodeId: undefined })
    }

    setIsDragging(false)
    setIsPanning(false)
    setDraggedNodeId(null)
    setDragStart(null)
    setPanStart(null)
    if (isDragging) onNodesChange?.(nodes)
  }, [isLinking, isDragging, isPanning, linkingFromId, nodes, onNodesChange, onConnectionCreate])

  // Smart Zoom logic
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    // Mouse position relative to canvas
    const mouseX = (e.clientX - rect.left)
    const mouseY = (e.clientY - rect.top)

    const zoomSpeed = 0.001
    const delta = -e.deltaY * zoomSpeed
    const newScale = Math.max(0.2, Math.min(3, viewport.scale + delta))

    // Calculate offset adjustment to zoom at mouse position
    const ratio = newScale / viewport.scale
    const newOffsetX = mouseX - (mouseX - viewport.offsetX) * ratio
    const newOffsetY = mouseY - (mouseY - viewport.offsetY) * ratio

    setViewport({
      scale: newScale,
      offsetX: newOffsetX,
      offsetY: newOffsetY,
    })
  }, [viewport])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current || !engineRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = canvasRef.current.width / rect.width
    const scaleY = canvasRef.current.height / rect.height
    const point = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }

    const nodeId = engineRef.current.hitTestNode(point)
    if (nodeId) {
      onNodeDoubleClick?.(nodeId)
    }
  }, [onNodeDoubleClick])

  return (
    <div className="network-diagram-container bg-white/50 overflow-hidden h-full select-none">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        className="block cursor-default"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}


