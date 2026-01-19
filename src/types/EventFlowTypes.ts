import { EventType } from './Master_Functionality_Catalog';

/**
 * Типы Event Flow системы для ProjectLibre
 * Следует SOLID принципу Single Responsibility
 */

// Re-exported from Master_Functionality_Catalog
export { EventType };

// Базовый интерфейс события
export interface BaseEvent {
  id: string;
  type: EventType;
  timestamp: Date;
  source: string;
  data?: any;
  metadata?: Record<string, any>;
}

// Интерфейс обработчика событий
export interface EventHandler<T = any> {
  (event: BaseEvent & { data?: T }): void | Promise<void>;
}

// Интерфейс подписчика на события
export interface EventSubscription {
  id: string;
  eventType: EventType;
  handler: EventHandler;
  priority: number;
  once: boolean;
}

// Интерфейс диспетчера событий
export interface IEventDispatcher {
  dispatch(event: BaseEvent): void;
  subscribe(eventType: EventType, handler: EventHandler, priority?: number): string;
  unsubscribe(subscriptionId: string): void;
  once(eventType: EventType, handler: EventHandler): string;
  clear(): void;
}

// Типы данных для специфичных событий
export interface ProjectEventData {
  projectId: string;
  filePath?: string;
  changes?: string[];
}

export interface TaskEventData {
  taskId: string;
  taskData?: any;
  oldValues?: any;
  newValues?: any;
  selectedTasks?: string[];
}

export interface ResourceEventData {
  resourceId: string;
  resourceData?: any;
  assignments?: Array<{
    taskId: string;
    units: number;
    work: number;
  }>;
}

export interface ViewEventData {
  viewType: string;
  settings?: any;
  zoomLevel?: number;
  scrollPosition?: { x: number; y: number };
}

export interface ValidationEventData {
  validationResult: {
    isValid: boolean;
    errors: Array<{
      field: string;
      message: string;
      severity: 'error' | 'warning' | 'info';
    }>;
    warnings: Array<{
      field: string;
      message: string;
    }>;
  };
}

export interface NotificationEventData {
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}
