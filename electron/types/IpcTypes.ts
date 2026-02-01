import type { JsonValue } from './JsonValue';

/**
 * Типы IPC для Electron процесса.
 * Эти типы используются в preload.ts и main процессе.
 */

/**
 * IPC каналы приложения
 */
export enum IpcChannels {
  JAVA_EXECUTE_COMMAND = 'java-execute-command',
  JAVA_START = 'java-start',
  JAVA_STOP = 'java-stop',
  JAVA_RESTART = 'java-restart',
  JAVA_STATUS = 'java-status',
  JAVA_API_REQUEST = 'java-api-request',
  JAVA_SUBSCRIBE_EVENTS = 'java-subscribe-events',
  JAVA_UNSUBSCRIBE_EVENTS = 'java-unsubscribe-events',
  JAVA_PROCESS_STARTED = 'java-process-started',
  JAVA_PROCESS_STOPPED = 'java-process-stopped',
  JAVA_STATUS_CHANGE = 'java-status-change',
  JAVA_PROCESS_ERROR = 'java-process-error',
  JAVA_ERROR_DETAILS = 'java-error-details',
  GET_APP_INFO = 'get-app-info',
  SHOW_MESSAGE_BOX = 'show-message-box',
  SHOW_OPEN_DIALOG = 'show-open-dialog',
  SHOW_SAVE_DIALOG = 'show-save-dialog',
  SAVE_BINARY_FILE = 'save-binary-file',
  OPEN_EXTERNAL = 'open-external',
  PREFERENCES_LOAD = 'preferences:load',
  PREFERENCES_SAVE = 'preferences:save',
  PREFERENCES_EXPORT = 'preferences:export-to-file',
  PREFERENCES_IMPORT = 'preferences:import-from-file',
  BOOTSTRAP_STATUS_CHANGE = 'bootstrap-status-change'
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
 * Событие запуска Java процесса
 */
export interface JavaProcessStartedEvent {
  timestamp: number;
  source: string;
  pid: number;
  port: number;
  status: 'running' | 'starting';
  javaVersion?: string;
}

/**
 * Событие остановки Java процесса
 */
export interface JavaProcessStoppedEvent {
  timestamp: number;
  source: string;
  pid?: number;
  port?: number;
  status: 'stopped' | 'terminated';
  exitCode?: number;
  reason?: string;
}

/**
 * Событие изменения статуса Java
 */
export interface JavaStatusChangeEvent {
  timestamp: number;
  source: string;
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
export interface JavaProcessErrorEvent {
  timestamp: number;
  source: string;
  error: string;
  errorCode?: string;
  recoverable: boolean;
  stack?: string;
  context?: Record<string, JsonValue>;
}

/**
 * Детали ошибки Java
 */
export interface JavaErrorDetailsEvent {
  timestamp: number;
  source: string;
  errorType: string;
  message: string;
  details: Record<string, JsonValue>;
  suggestions?: string[];
}

/**
 * Базовый ответ Java API
 */
export interface JavaApiResponseBase {
  success: boolean;
  error?: string;
  recoverable?: boolean;
}

/**
 * Аргументы Java команды
 */
export type JavaCommandArgs =
  | string
  | number
  | boolean
  | null
  | JavaCommandArgs[]
  | { [key: string]: string | number | boolean | null | undefined };

/**
 * Данные статуса Java
 */
export interface JavaStatusData {
  running: boolean;
  status: JavaProcessStatus;
  pid?: number;
  port?: number;
  version?: string;
  memoryUsage?: number;
  uptime?: number;
  activeConnections?: number;
  configuration?: Record<string, JsonValue>;
}

/**
 * Информация о приложении
 */
export interface AppInfo {
  name: string;
  version: string;
  electron: string;
  chrome: string;
  node: string;
  platform: string;
  arch: string;
  locale: string;
  resourcesPath: string;
  userDataPath: string;
}

/**
 * Настройки пользователя
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  dateFormat: string;
  timeFormat: string;
  autoSave: boolean;
  autoSaveInterval: number;
  recentProjects: string[];
  windowState?: {
    width: number;
    height: number;
    x?: number;
    y?: number;
    maximized: boolean;
  };
}

/**
 * Результат сохранения бинарного файла
 */
export interface BinaryFileSaveResult {
  success: boolean;
  error?: string;
}

/**
 * Функция отписки от события
 */
export type UnsubscribeFunction = () => void;
