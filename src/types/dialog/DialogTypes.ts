/**
 * Базовые типы для всех диалоговых окон ProjectLibre
 * Следует SOLID принципам и Clean Architecture
 */

// ============================================================================
// БАЗОВЫЕ ИНТЕРФЕЙСЫ
// ============================================================================

/**
 * Базовый интерфейс для данных любого диалога
 */
export interface IDialogData {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
}

/**
 * Интерфейс для действий диалога
 */
export interface IDialogActions {
  onOk: (data: any) => Promise<void>;
  onCancel: () => void;
  onHelp?: () => void;
  onValidate?: (data: any) => boolean;
}

/**
 * Интерфейс для конфигурации диалога
 */
export interface IDialogConfig {
  width?: number;
  height?: number;
  resizable?: boolean;
  modal?: boolean;
  showHelp?: boolean;
  closeOnEscape?: boolean;
  closeOnEnter?: boolean;
}

// ============================================================================
// ОБЩИЕ ТИПЫ ДИАЛОГОВ
// ============================================================================

/**
 * Типы диалогов по категориям
 */
export enum DialogCategory {
  PROJECT = 'project',
  TASK = 'task',
  RESOURCE = 'resource',
  CALENDAR = 'calendar',
  INFORMATION = 'information',
  SEARCH = 'search',
  SETTINGS = 'settings',
  AUTHENTICATION = 'authentication',
  EDITING = 'editing'
}

/**
 * Статусы диалогов
 */
export enum DialogStatus {
  INITIAL = 'initial',
  LOADING = 'loading',
  VALIDATING = 'validating',
  READY = 'ready',
  ERROR = 'error',
  SUCCESS = 'success'
}

/**
 * Результат работы диалога
 */
export interface DialogResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  action: 'ok' | 'cancel' | 'help';
}

// ============================================================================
// СПЕЦИАЛИЗИРОВАННЫЕ ТИПЫ ДАННЫХ
// ============================================================================

/**
 * Базовые данные проекта
 */
export interface ProjectDialogData extends IDialogData {
  name: string;
  manager: string;
  notes: string;
  startDate: Date;
  resourcePool?: any;
  forward: boolean;
  projectType: number;
  projectStatus: number;
}

/**
 * Данные для диалога информации о задаче
 */
export interface TaskInformationData extends IDialogData {
  taskId: string;
  name: string;
  duration: number;
  progress: number;
  startDate: Date;
  endDate: Date;
  predecessors: string[];
  successors: string[];
  resources: any[];
  notes: string;
  priority: number;
  estimated?: boolean;
}

/**
 * Данные для диалога информации о ресурсе
 */
export interface ResourceInformationData extends IDialogData {
  resourceId: string;
  name: string;
  type: string;
  rate: number;
  cost: number;
  availability: any;
  assignedTasks: any[];
  notes: string;
}

/**
 * Данные для диалога поиска
 */
export interface FindDialogData extends IDialogData {
  searchText: string;
  searchType: string;
  searchContext?: any;
  results: any[];
  currentIndex: number;
}

/**
 * Данные для диалога настроек
 */
export interface SettingsDialogData extends IDialogData {
  category: string;
  settings: Record<string, any>;
  modified: boolean;
}

/**
 * Данные для диалога аутентификации
 */
export interface LoginDialogData extends IDialogData {
  username: string;
  password: string;
  rememberCredentials: boolean;
  useMenus: boolean;
}

/**
 * Данные для диалога календаря
 */
export interface CalendarDialogData extends IDialogData {
  calendarId: string;
  name: string;
  workingDays: number[];
  holidays: Date[];
  workingHours: {
    start: string;
    end: string;
  };
}

/**
 * Данные для диалога прерывания задачи
 */
export interface SplitTaskData extends IDialogData {
  taskId: string;
  taskName: string;
  splitDate: Date;
  gapDays: number;
}

// ============================================================================
// ТИПЫ ВАЛИДАЦИИ
// ============================================================================

/**
 * Правила валидации
 */
export interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

/**
 * Результат валидации
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

// ============================================================================
// ТИПЫ СОБЫТИЙ
// ============================================================================

/**
 * События диалога
 */
export interface DialogEvent {
  type: 'open' | 'close' | 'validate' | 'submit' | 'error';
  dialogId: string;
  timestamp: Date;
  data?: any;
}

/**
 * Обработчик событий диалога
 */
export type DialogEventHandler = (event: DialogEvent) => void;
