/**
 * Типизированные интерфейсы для контекстного меню
 * Устраняет использование any в обработчиках меню
 */

import { Task, Resource } from '@/store/project/interfaces';
import { ICalendarEvent } from '@/types/views/IViewTypes';

/**
 * Действия контекстного меню для задачи
 */
export interface ITaskMenuActions {
  readonly onShowProperties: (task: Task) => Promise<void>;
  readonly onDelete: (task: Task) => Promise<void>;
  readonly onEdit?: (task: Task) => Promise<void>;
  readonly onDuplicate?: (task: Task) => Promise<void>;
}

/**
 * Действия контекстного меню для ресурса
 */
export interface IResourceMenuActions {
  readonly onShowProperties: (resource: Resource) => Promise<void>;
  readonly onDelete: (resource: Resource) => Promise<void>;
  readonly onEdit?: (resource: Resource) => Promise<void>;
}

/**
 * Целевой объект для контекстного меню задачи
 */
export interface ITaskMenuTarget extends ICalendarEvent, ITaskMenuActions {
  readonly type: 'task';
}

/**
 * Целевой объект для контекстного меню ресурса
 */
export interface IResourceMenuTarget extends IResourceMenuActions {
  readonly type: 'resource';
  readonly id: string;
  readonly name: string;
}

/**
 * Позиция меню
 */
export interface IMenuPosition {
  readonly x: number;
  readonly y: number;
}
