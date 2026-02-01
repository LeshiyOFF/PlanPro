/**
 * Типизированные интерфейсы для View компонентов
 * Устраняет использование any в представлениях
 */

import { Task, Resource } from '@/store/project/interfaces';
import { ViewType, ViewSettings } from '@/types/ViewTypes';

/**
 * Базовые пропсы для всех View компонентов
 */
export interface IBaseViewProps {
  readonly viewType: ViewType;
  readonly settings?: Partial<ViewSettings>;
}

/**
 * Пропсы для представлений с задачами
 */
export interface ITaskViewProps extends IBaseViewProps {
  readonly tasks: ReadonlyArray<Task>;
  readonly onTaskSelect?: (task: Task) => void;
  readonly onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  readonly onTaskDelete?: (taskId: string) => void;
}

/**
 * Пропсы для представлений с ресурсами
 */
export interface IResourceViewProps extends IBaseViewProps {
  readonly resources: ReadonlyArray<Resource>;
  readonly onResourceSelect?: (resource: Resource) => void;
  readonly onResourceUpdate?: (resourceId: string, updates: Partial<Resource>) => void;
  readonly onResourceDelete?: (resourceId: string) => void;
}

/**
 * Узел для Network диаграммы
 */
export interface INetworkNode {
  readonly id: string;
  readonly name: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly critical: boolean;
  readonly progress: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly isPinned: boolean;
}

/**
 * Обновление позиции узла
 */
export interface INodePositionUpdate {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly isPinned: boolean;
}

/**
 * Конфигурация Calendar View
 */
export interface ICalendarViewConfig {
  readonly showWeekends: boolean;
  readonly showResourceAllocations: boolean;
  readonly highlightOverallocated: boolean;
}

/**
 * Событие календаря
 */
export interface ICalendarEvent {
  readonly id: string;
  readonly title: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly resourceId?: string;
  readonly taskId?: string;
  readonly color: string;
}

/**
 * Расширенный Task с полями для Network диаграммы
 */
export interface ITaskWithPosition extends Task {
  readonly x?: number;
  readonly y?: number;
  readonly isPinned?: boolean;
}

/**
 * Создание новой задачи для Network View
 */
export interface INetworkTaskCreate {
  readonly name: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly progress: number;
  readonly x: number;
  readonly y: number;
  readonly isPinned: boolean;
}
