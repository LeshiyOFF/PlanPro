/**
 * Типы событий Java процесса.
 * Заменяет использование `any` в callback функциях событий.
 */

import type { JsonObject } from '../json-types';

/**
 * Базовый интерфейс события Java процесса
 */
export interface JavaProcessEventBase {
  timestamp: number;
  source: string;
}

/**
 * Событие запуска Java процесса
 */
export interface JavaProcessStartedEvent extends JavaProcessEventBase {
  pid: number;
  port: number;
  status: 'running' | 'starting';
  javaVersion?: string;
}

/**
 * Событие остановки Java процесса
 */
export interface JavaProcessStoppedEvent extends JavaProcessEventBase {
  pid?: number;
  port?: number;
  status: 'stopped' | 'terminated';
  exitCode?: number;
  reason?: string;
}

/**
 * Событие изменения статуса Java процесса
 */
export interface JavaStatusChangeEvent extends JavaProcessEventBase {
  running: boolean;
  status: JavaProcessStatus;
  pid?: number;
  port?: number;
  memoryUsage?: number;
  uptime?: number;
}

/**
 * Событие ошибки Java процесса
 */
export interface JavaProcessErrorEvent extends JavaProcessEventBase {
  error: string;
  errorCode?: string;
  recoverable: boolean;
  stack?: string;
  context?: Record<string, JsonObject>;
}

/**
 * Детали ошибки Java процесса
 */
export interface JavaErrorDetailsEvent extends JavaProcessEventBase {
  errorType: string;
  message: string;
  details: JsonObject;
  suggestions?: string[];
}

/**
 * Статусы Java процесса
 */
export type JavaProcessStatus =
  | 'idle'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'error'
  | 'crashed'
  | 'restarting';

/**
 * Объединённый тип всех событий Java процесса
 */
export type JavaProcessEvent =
  | JavaProcessStartedEvent
  | JavaProcessStoppedEvent
  | JavaStatusChangeEvent
  | JavaProcessErrorEvent
  | JavaErrorDetailsEvent;
