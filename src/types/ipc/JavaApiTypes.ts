/**
 * Типы для Java API ответов и запросов.
 * Заменяет использование `any` в Promise<any>.
 */

import { JavaProcessStatus } from './JavaProcessEvents'
import { StrictData } from '../Master_Functionality_Catalog'

/**
 * Базовый ответ Java API
 */
export interface JavaApiResponseBase {
  success: boolean;
  error?: string;
  recoverable?: boolean;
  timestamp?: number;
}

/**
 * Типизированный ответ Java API с данными
 */
export interface JavaApiResponse<T = StrictData> extends JavaApiResponseBase {
  data?: T;
}

/**
 * Конфигурация Java процесса
 */
export interface JavaProcessConfiguration {
  javaPath: string;
  jarPath: string;
  port: number;
  maxMemory: number;
  minMemory: number;
  arguments: string[];
  environment: Record<string, string>;
}

/**
 * Данные статуса Java процесса
 */
export interface JavaStatusData {
  running: boolean;
  status: JavaProcessStatus;
  pid?: number;
  port?: number;
  configuration?: JavaProcessConfiguration;
  version?: string;
  memoryUsage?: number;
  uptime?: number;
  activeConnections?: number;
  lastRestart?: Date;
}

/**
 * Ответ статуса Java процесса
 */
export type JavaStatusResponse = JavaApiResponse<JavaStatusData>;

/**
 * Аргументы Java команды
 */
export type JavaCommandArgs = string | number | boolean | null | JavaCommandArgs[] | {
  [key: string]: string | number | boolean | null | undefined;
};

/**
 * Ответ выполнения Java команды
 */
export interface JavaCommandResponse<T = StrictData> extends JavaApiResponseBase {
  data?: T;
  command: string;
  args: JavaCommandArgs[];
  executionTime?: number;
}

/**
 * Ответ подписки на события
 */
export interface JavaEventSubscriptionResponse extends JavaApiResponseBase {
  message?: string;
  subscriptionId?: string;
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
  platform: NodeJS.Platform;
  arch: string;
  locale: string;
  resourcesPath: string;
  userDataPath: string;
}

/**
 * Ответ сохранения бинарного файла
 */
export interface BinaryFileSaveResponse {
  success: boolean;
  error?: string;
  bytesWritten?: number;
}

/**
 * Пользовательские настройки
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
 * Ответ операции с настройками
 */
export interface PreferencesResponse extends JavaApiResponseBase {
  preferences?: UserPreferences;
}

/**
 * Ответ экспорта/импорта настроек
 */
export interface PreferencesFileResponse extends JavaApiResponseBase {
  filePath?: string;
  preferences?: UserPreferences;
}
