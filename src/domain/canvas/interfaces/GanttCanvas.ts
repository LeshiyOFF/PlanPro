/**
 * Canvas interfaces for Gantt diagram.
 * Following Clean Architecture principles.
 */

import {
  GanttRenderData,
  HitTestTarget,
  TypedCanvasRenderStrategy,
  TypedCanvasEventHandlers,
  TypedCanvasLayer
} from '@/types/gantt/CanvasRenderTypes';

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
 * Canvas render strategy (re-export типизированной версии)
 */
export type CanvasRenderStrategy = TypedCanvasRenderStrategy<GanttRenderData>;

/**
 * Canvas event handlers (re-export типизированной версии)
 */
export type CanvasEventHandlers = TypedCanvasEventHandlers<HitTestTarget>;

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
 * Canvas layer (re-export типизированной версии)
 */
export type CanvasLayer = TypedCanvasLayer<GanttRenderData>;

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
