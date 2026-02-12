/**
 * Расширение глобального Window для Electron API (preload).
 * В веб-сборке electronAPI отсутствует; в Electron — предоставляется preload.
 */

import type { JsonValue, JsonArray, JsonObject } from './json-types'

export interface MessageBoxOptions {
  type?: 'none' | 'info' | 'error' | 'question' | 'warning';
  title?: string;
  message: string;
  detail?: string;
  buttons?: string[];
  defaultId?: number;
  cancelId?: number;
  checkboxLabel?: string;
  checkboxChecked?: boolean;
}

export interface MessageBoxReturnValue {
  response: number;
  checkboxChecked?: boolean;
}

/** Минимальный контракт Electron API, используемый в renderer (src). */
export interface ElectronAPIWindow {
  showMessageBox: (options: MessageBoxOptions) => Promise<MessageBoxReturnValue>;
  /** Обработчик запроса закрытия окна (Electron). Возврат true разрешает закрытие. */
  onCloseRequested?: (handler: () => Promise<boolean>) => void;
  closeWindow?: () => void;
  showOpenDialog?: (options: Record<string, JsonObject>) => Promise<{ canceled: boolean; filePaths: string[] }>;
  showSaveDialog?: (options: Record<string, JsonObject>) => Promise<{ canceled: boolean; filePath?: string }>;
  loadPreferences?: () => Promise<LoadPreferencesResult>;
  savePreferences?: (preferences: JsonObject | null) => Promise<SavePreferencesResult>;
  /** Экспорт настроек в файл (Electron). */
  exportPreferencesToFile?: (filePath: string, preferences: JsonObject) => Promise<void>;
  /** Импорт настроек из файла (Electron). */
  importPreferencesFromFile?: (filePath: string) => Promise<ImportPreferencesResult>;
  openExternal?: (url: string) => Promise<void>;
  getAppInfo?: () => Promise<JsonObject>;
  javaExecute?: (command: string, args?: JsonArray) => Promise<JsonObject>;
  getJavaStatus?: () => Promise<JsonObject>;
  subscribeToJavaEvents?: () => Promise<{ success: boolean; message?: string; error?: string }>;
  unsubscribeFromJavaEvents?: () => Promise<{ success: boolean; message?: string; error?: string }>;
  javaApiRequest?: (command: string, args?: JsonValue) => Promise<JsonObject>;
  onJavaProcessStarted?: (callback: (data: JsonObject) => void) => () => void;
  onJavaProcessStopped?: (callback: (data: JsonObject) => void) => () => void;
  onJavaStatusChange?: (callback: (data: JsonObject) => void) => () => void;
  onJavaProcessError?: (callback: (data: JsonObject) => void) => () => void;
  onJavaErrorDetails?: (callback: (data: JsonObject) => void) => () => void;
  onBootstrapStatusChange?: (callback: (status: string) => void) => () => void;
  fileExists?: (path: string) => Promise<boolean>;
  /** Результат сохранения бинарного файла (типизировано, без unknown). */
  saveBinaryFile?: (path: string, data: ArrayBuffer | Uint8Array) => Promise<SaveBinaryFileResult>;
  removeAllListeners?: (channel: string) => void;
}

/** Результат сохранения бинарного файла через Electron. */
export interface SaveBinaryFileResult {
  success: boolean;
  error?: string;
  bytesWritten?: number;
}

/** Результат сохранения настроек через Electron IPC. */
export interface SavePreferencesResult {
  success: boolean;
  error?: string;
}

/** Результат загрузки настроек через Electron IPC. */
export interface LoadPreferencesResult {
  success: boolean;
  data?: Record<string, JsonObject>;
}

/** Результат импорта настроек из файла. */
export interface ImportPreferencesResult {
  success: boolean;
  data?: Record<string, JsonObject>;
}

declare global {
  interface Window {
    /** API, экспортируемый из Electron preload. В веб-сборке отсутствует. */
    electronAPI?: ElectronAPIWindow;
  }
  /** Расширение ImportMeta для Vite (import.meta.env) */
  interface ImportMeta {
    env: {
      MODE: string;
      [key: string]: string | undefined;
    };
  }
}

export {}
