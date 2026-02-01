/**
 * Типы для Canvas rendering Gantt диаграммы.
 * Заменяет использование `any` в render функциях.
 */

import { CanvasContext, CanvasPoint } from '@/domain/canvas/interfaces/GanttCanvas'
import { GanttTask } from './GanttTaskTypes'

/**
 * Данные для рендеринга Gantt задачи
 */
export interface GanttRenderData {
  tasks: GanttTask[];
  selectedTaskId?: string;
  hoveredTaskId?: string;
  highlightedTaskIds?: string[];
}

/**
 * Цель хит-теста в Canvas
 */
export interface HitTestTarget {
  type: 'task' | 'baseline' | 'segment' | 'connection' | 'none';
  taskId?: string;
  segmentIndex?: number;
  interactionZone?: 'body' | 'start' | 'end';
}

/**
 * Стратегия рендеринга Canvas с типизацией
 */
export interface TypedCanvasRenderStrategy<TData = GanttRenderData> {
  name: string;
  render: (context: CanvasContext, data: TData) => void;
  hitTest: (point: CanvasPoint, context: CanvasContext, data: TData) => HitTestTarget;
}

/**
 * Обработчики событий Canvas с типизацией
 */
export interface TypedCanvasEventHandlers<TTarget = HitTestTarget> {
  onClick: (point: CanvasPoint, target: TTarget) => void;
  onDoubleClick: (point: CanvasPoint, target: TTarget) => void;
  onRightClick: (point: CanvasPoint, target: TTarget) => void;
  onMouseMove: (point: CanvasPoint, target: TTarget) => void;
  onMouseDown: (point: CanvasPoint, target: TTarget) => void;
  onMouseUp: (point: CanvasPoint, target: TTarget) => void;
  onWheel: (delta: number) => void;
}

/**
 * Слой Canvas с типизацией
 */
export interface TypedCanvasLayer<TData = GanttRenderData> {
  id: string;
  name: string;
  visible: boolean;
  zIndex: number;
  render: (context: CanvasContext, data: TData) => void;
}

/**
 * Данные Gantt Canvas с типизацией
 */
export interface TypedGanttCanvasData {
  tasks: GanttTask[];
  selectedTaskId?: string;
  hoveredTaskId?: string;
  layers: TypedCanvasLayer[];
}
