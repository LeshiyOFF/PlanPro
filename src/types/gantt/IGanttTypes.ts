/**
 * Типизированные интерфейсы для Gantt компонентов
 * Устраняет использование any в GanttCanvas и связанных компонентах
 */

import { Task } from '@/store/project/interfaces'
import { GanttDisplayMode } from './GanttTaskTypes'

/**
 * Обновление задачи в Gantt
 */
export interface IGanttTaskUpdate {
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly duration?: number;
  readonly progress?: number;
  readonly name?: string;
}

/**
 * Колбэки для взаимодействия с Gantt
 */
export interface IGanttCallbacks {
  readonly onTaskSelect?: (task: Task) => void;
  readonly onTaskDoubleClick?: (task: Task) => void;
  readonly onTaskUpdate?: (taskId: string, updates: IGanttTaskUpdate) => void;
  readonly onNavigationComplete?: () => void;
}

/**
 * Конфигурация отображения Gantt
 */
export interface IGanttDisplayConfig {
  readonly zoomLevel: number;
  readonly mode: GanttDisplayMode;
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly forcedEndDate?: Date | null;
  readonly targetDate?: Date | null;
}

/**
 * Состояние навигации Gantt
 */
export interface IGanttNavigationState {
  readonly currentDate: Date;
  readonly viewMode: 'day' | 'week' | 'month';
  readonly showToday: boolean;
  readonly scrollPosition: number;
}

/**
 * Координаты на Canvas
 */
export interface ICanvasCoordinates {
  readonly x: number;
  readonly y: number;
}

/**
 * Размеры элемента на Canvas
 */
export interface ICanvasDimensions {
  readonly width: number;
  readonly height: number;
}

/**
 * Прямоугольная область на Canvas
 */
export interface ICanvasRect extends ICanvasCoordinates, ICanvasDimensions {}

/**
 * Элемент для отрисовки на Gantt
 */
export interface IGanttRenderItem {
  readonly id: string;
  readonly task: Task;
  readonly rect: ICanvasRect;
  readonly color: string;
  readonly progress: number;
}

/**
 * Контекст отрисовки Canvas
 */
export interface ICanvasRenderContext {
  readonly ctx: CanvasRenderingContext2D;
  readonly viewport: ICanvasRect;
  readonly scale: number;
  readonly pixelsPerDay: number;
}

/**
 * Параметры слоя отрисовки
 */
export interface ILayerRenderParams {
  readonly context: ICanvasRenderContext;
  readonly items: ReadonlyArray<IGanttRenderItem>;
  readonly displayConfig: IGanttDisplayConfig;
}
