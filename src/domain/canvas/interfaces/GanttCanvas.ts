/**
 * Canvas interfaces for Gantt diagram
 * Following Clean Architecture principles
 */

/**
 * Base canvas rendering context
 */
export interface CanvasContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Canvas coordinate system
 */
export interface CanvasPoint {
  x: number;
  y: number;
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface CanvasRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Gantt task visualization data
 */
export interface GanttTaskRender extends CanvasRect {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  color: string;
  selected: boolean;
  level: number;
  parent?: string;
  children?: string[];
  baselineX?: number;
  baselineWidth?: number;
  hasBaseline?: boolean;
  varianceX?: number;
  varianceWidth?: number;
  varianceDays?: number;
  segments?: Array<{ x: number; width: number; startDate: Date; endDate: Date }>;
}

/**
 * Gantt timeline visualization
 */
export interface GanttTimeline {
  startDate: Date;
  endDate: Date;
  unit: 'day' | 'week' | 'month';
  intervals: GanttTimelineInterval[];
  scale: number;
}

export interface GanttTimelineInterval {
  start: Date;
  end: Date;
  label: string;
  x: number;
  width: number;
  isWeekend: boolean;
  isToday: boolean;
}

/**
 * Canvas render strategy
 */
export interface CanvasRenderStrategy {
  name: string;
  render: (context: CanvasContext, data: any) => void;
  hitTest: (point: CanvasPoint, context: CanvasContext, data: any) => any;
}

/**
 * Canvas event handlers
 */
export interface CanvasEventHandlers {
  onClick: (point: CanvasPoint, target: any) => void;
  onDoubleClick: (point: CanvasPoint, target: any) => void;
  onRightClick: (point: CanvasPoint, target: any) => void;
  onMouseMove: (point: CanvasPoint, target: any) => void;
  onMouseDown: (point: CanvasPoint, target: any) => void;
  onMouseUp: (point: CanvasPoint, target: any) => void;
  onWheel: (delta: number) => void;
}

/**
 * Interaction types for Gantt bars
 */
export enum GanttInteractionType {
  NONE = 'NONE',
  DRAG = 'DRAG',
  RESIZE_START = 'RESIZE_START',
  RESIZE_END = 'RESIZE_END'
}

/**
 * Interaction data for current operation
 */
export interface GanttInteraction {
  taskId: string;
  type: GanttInteractionType;
  startPoint: CanvasPoint;
  originalStartDate: Date;
  originalEndDate: Date;
}

/**
 * Result of interaction update
 */
export interface InteractionResult {
  taskId: string;
  newStartDate: Date;
  newEndDate: Date;
}

/**
 * Canvas viewport management
 */
export interface CanvasViewport {
  scale: number;
  offsetX: number;
  offsetY: number;
  minScale: number;
  maxScale: number;
}

/**
 * Canvas layer system
 */
export interface CanvasLayer {
  id: string;
  name: string;
  visible: boolean;
  zIndex: number;
  render: (context: CanvasContext, data: any) => void;
}

/**
 * Gantt canvas data
 */
export interface GanttCanvasData {
  tasks: GanttTaskRender[];
  timeline: GanttTimeline;
  viewport: CanvasViewport;
  selectedTask?: string;
  hoveredTask?: string;
  layers: CanvasLayer[];
}

