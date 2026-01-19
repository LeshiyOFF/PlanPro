import { ViewType } from './Master_Functionality_Catalog';

/**
 * Типы представлений для ProjectLibre
 * Следует SOLID принципу Single Responsibility
 */

/**
 * Enum типов представлений - Re-exported from Master_Functionality_Catalog
 */
export { ViewType };

/**
 * Интерфейс настроек представления
 */
export interface ViewSettings {
  type: ViewType;
  timescale: Timescale;
  showCriticalPath: boolean;
  showProgress: boolean;
  showResources: boolean;
  zoom: number;
  filter?: ViewFilter;
  sort?: ViewSort;
}

/**
 * Типы временных шкал
 */
export enum Timescale {
  DAYS = 'days',
  WEEKS = 'weeks', 
  MONTHS = 'months',
  QUARTERS = 'quarters'
}

/**
 * Интерфейс фильтра представления
 */
export interface ViewFilter {
  searchText?: string;
  status?: TaskStatus[];
  resources?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  priority?: TaskPriority[];
}

/**
 * Интерфейс сортировки представления
 */
export interface ViewSort {
  field: SortField;
  direction: SortDirection;
}

/**
 * Поля сортировки
 */
export enum SortField {
  ID = 'id',
  NAME = 'name',
  START = 'start',
  FINISH = 'finish',
  PRIORITY = 'priority',
  STATUS = 'status'
}

/**
 * Направление сортировки
 */
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * Статусы задач
 */
export enum TaskStatus {
  NOT_STARTED = 'not-started',
  IN_PROGRESS = 'in-progress', 
  COMPLETED = 'completed',
  DELAYED = 'delayed'
}

/**
 * Приоритеты задач
 */
export enum TaskPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

/**
 * Интерфейс конфигурации представления
 */
export interface ViewConfig {
  id: string;
  type: ViewType;
  title: string;
  description: string;
  icon: string;
  path: string;
  component: React.ComponentType<any>;
  permissions?: string[];
  defaultSettings?: Partial<ViewSettings>;
}

/**
 * Интерфейс маршрута представления
 */
export interface ViewRoute {
  path: string;
  component: React.ComponentType<any>;
  settings: Partial<ViewSettings>;
  permissions?: string[];
}
