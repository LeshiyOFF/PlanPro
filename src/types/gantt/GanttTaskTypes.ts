/**
 * Типы задач для Gantt диаграммы.
 */

import { TaskSegment } from '../task-types'

/**
 * Базовая задача для отображения в Gantt
 */
export interface GanttTask {
  id: string;
  name: string;
  start: Date;
  finish: Date;
  progress: number;
  parentId?: string | null;
  level: number;
  position: number;
  baselineStart?: Date;
  baselineFinish?: Date;
  finishVariance?: number;
  estimated?: boolean;
  segments?: TaskSegment[];
}

/**
 * Обновления задачи Gantt
 */
export interface GanttTaskUpdate {
  startDate: Date;
  endDate: Date;
  progress: number;
}

/**
 * Режимы отображения Gantt
 */
export type GanttDisplayMode = 'standard' | 'tracking';

/**
 * Цель навигации в Gantt
 */
export interface GanttNavigationTarget {
  taskId?: string;
  date?: Date;
  smooth?: boolean;
}
