import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { WBSCanvasEngine } from '@/domain/wbs/services/WBSCanvasEngine';
import { WBSLayoutStrategy } from '@/domain/wbs/layout/WBSLayoutStrategy';
import { WBSNode } from '@/domain/wbs/interfaces/WBS';
import { CanvasPoint } from '@/domain/canvas/interfaces/GanttCanvas';

interface WBSCanvasCoreProps {
  nodes: WBSNode[];
  width?: number;
  height?: number;
  zoomLevel?: number;
  onNodeToggle: (nodeId: string) => void;
  onNodeSelect: (nodeId: string | null) => void;
  onNodeContextMenu?: (nodeId: string, x: number, y: number) => void;
}

/**
 * Enhanced WBS Canvas Core with panning, smart zoom and context menu
 */
export const WBSCanvasCore: React.FC<WBSCanvasCoreProps> = ({
  nodes: initialNodes,
  width = 2000,
  height = 1200,
  zoomLevel = 1,
  onNodeToggle,
  onNodeSelect,
  onNodeContextMenu
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<WBSCanvasEngine | null>(null);
  const layoutStrategy = useMemo(() => new WBSLayoutStrategy(), []);
  
  const [viewport, setViewport] = useState({ scale: zoomLevel, offsetX: 0, offsetY: 0 });
  const [nodes, setNodes] = useState<WBSNode[]>([]);
  const [selection, setSelection] = useState<string | null>(null);
  
  // Interaction state
  const [isPanning, setIsPanning] = useState(false);
  const [dragStartPoint, setDragStartPoint] = useState<CanvasPoint | null>(null);

  // 1. Initial layout calculation
  useEffect(() => {
    const positioned = layoutStrategy.calculateLayout(initialNodes);
    setNodes(positioned);
  }, [initialNodes, layoutStrategy]);

  // 2. Initialize engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    engineRef.current = new WBSCanvasEngine(canvas);
  }, []);

  // 3. Sync and Render
  useEffect(() => {
    if (!engineRef.current || !canvasRef.current) return;
    
    engineRef.current.updateData({
      nodes,
      viewport: { ...viewport, scale: viewport.scale * zoomLevel },
      selectedNodeId: selection || undefined
    });
    engineRef.current.render();
  }, [nodes, zoomLevel, selection, viewport]);

  // 4. Coordinate mapping helpers
  const getCanvasPoint = useCallback((e: React.MouseEvent | React.WheelEvent): CanvasPoint => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    return { 
      x: (e.clientX - rect.left) * (canvas.width / rect.width), 
      y: (e.clientY - rect.top) * (canvas.height / rect.height) 
    };
  }, []);

  // 5. Interaction Handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current || !engineRef.current) return;
    
    const point = getCanvasPoint(e);
    const dpr = window.devicePixelRatio || 1;
    const totalScale = viewport.scale * zoomLevel;
    
    const logicalX = (point.x / dpr - viewport.offsetX) / totalScale;
    const logicalY = (point.y / dpr - viewport.offsetY) / totalScale;

    const clickedNode = nodes.find(node => 
      logicalX >= node.x && logicalX <= node.x + node.width &&
      logicalY >= node.y && logicalY <= node.y + node.height
    );

    if (e.button === 0) { // Left button
      if (clickedNode) {
        const iconDist = Math.sqrt(
          Math.pow(logicalX - (clickedNode.x + clickedNode.width / 2), 2) +
          Math.pow(logicalY - (clickedNode.y + clickedNode.height), 2)
        );

        if (iconDist < 15 && clickedNode.isSummary) {
          onNodeToggle(clickedNode.id);
        } else {
          setSelection(clickedNode.id);
          onNodeSelect(clickedNode.id);
        }
      } else {
        setIsPanning(true);
        setDragStartPoint(point);
        setSelection(null);
        onNodeSelect(null);
      }
    }
  }, [getCanvasPoint, nodes, viewport, zoomLevel, onNodeToggle, onNodeSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && dragStartPoint) {
      const point = getCanvasPoint(e);
      const dpr = window.devicePixelRatio || 1;
      setViewport(prev => ({
        ...prev,
        offsetX: prev.offsetX + (point.x - dragStartPoint.x) / dpr,
        offsetY: prev.offsetY + (point.y - dragStartPoint.y) / dpr
      }));
      setDragStartPoint(point);
    }
  }, [isPanning, dragStartPoint, getCanvasPoint]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDragStartPoint(null);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;

    const point = getCanvasPoint(e);
    const dpr = window.devicePixelRatio || 1;
    const totalScale = viewport.scale * zoomLevel;
    
    const logicalX = (point.x / dpr - viewport.offsetX) / totalScale;
    const logicalY = (point.y / dpr - viewport.offsetY) / totalScale;

    const clickedNode = nodes.find(node => 
      logicalX >= node.x && logicalX <= node.x + node.width &&
      logicalY >= node.y && logicalY <= node.y + node.height
    );

    if (clickedNode) {
      onNodeContextMenu?.(clickedNode.id, e.clientX, e.clientY);
    }
  }, [getCanvasPoint, nodes, viewport, zoomLevel, onNodeContextMenu]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleAmount = 1.1;
    const point = getCanvasPoint(e);
    const dpr = window.devicePixelRatio || 1;
    
    const oldScale = viewport.scale;
    let newScale = e.deltaY < 0 ? oldScale * scaleAmount : oldScale / scaleAmount;
    newScale = Math.max(0.2, Math.min(3, newScale));

    const mouseX = point.x / dpr;
    const mouseY = point.y / dpr;

    const worldX = (mouseX - viewport.offsetX) / oldScale;
    const worldY = (mouseY - viewport.offsetY) / oldScale;

    setViewport({
      scale: newScale,
      offsetX: mouseX - worldX * newScale,
      offsetY: mouseY - worldY * newScale
    });
  }, [viewport, getCanvasPoint]);

  return (
    <div 
      className="wbs-canvas-container bg-slate-50/50 overflow-hidden h-full relative"
      style={{ userSelect: 'none' }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
        onWheel={handleWheel}
        className="block cursor-default w-full h-full"
      />
    </div>
  );
};

