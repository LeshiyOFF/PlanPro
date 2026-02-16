import type { JsonValue } from '../types/JsonValue';
import {
  JavaProcessStartedEvent,
  JavaProcessStoppedEvent,
  JavaStatusChangeEvent,
  JavaProcessErrorEvent,
  JavaErrorDetailsEvent,
  JavaApiResponseBase,
  JavaStatusData,
  JavaCommandArgs,
  AppInfo,
  UserPreferences,
  BinaryFileSaveResult,
  UnsubscribeFunction
} from '../types/IpcTypes';

/**
 * Экспортируемый API для renderer процесса.
 * Типизированный интерфейс без использования `any`.
 */
export interface ElectronAPI {
  javaExecute: (
    command: string,
    args?: JavaCommandArgs[]
  ) => Promise<JavaApiResponseBase & { data?: JsonValue }>;

  javaApiRequest: (
    command: string,
    args?: JavaCommandArgs
  ) => Promise<JavaApiResponseBase & { data?: JsonValue }>;

  getJavaStatus: () => Promise<JavaApiResponseBase & { data?: JavaStatusData }>;
  subscribeToJavaEvents: () => Promise<JavaApiResponseBase>;
  unsubscribeFromJavaEvents: () => Promise<JavaApiResponseBase>;
  getAppInfo: () => Promise<AppInfo>;

  showMessageBox: (
    options: Electron.MessageBoxOptions
  ) => Promise<Electron.MessageBoxReturnValue>;

  showOpenDialog: (
    options: Electron.OpenDialogOptions
  ) => Promise<Electron.OpenDialogReturnValue>;

  showSaveDialog: (
    options: Electron.SaveDialogOptions
  ) => Promise<Electron.SaveDialogReturnValue>;

  saveBinaryFile: (
    path: string,
    data: ArrayBuffer | Uint8Array
  ) => Promise<BinaryFileSaveResult>;

  openExternal: (url: string) => Promise<void>;

  onJavaProcessStarted: (
    callback: (data: JavaProcessStartedEvent) => void
  ) => UnsubscribeFunction;

  onJavaProcessStopped: (
    callback: (data: JavaProcessStoppedEvent) => void
  ) => UnsubscribeFunction;

  onJavaStatusChange: (
    callback: (data: JavaStatusChangeEvent) => void
  ) => UnsubscribeFunction;

  onJavaProcessError: (
    callback: (data: JavaProcessErrorEvent) => void
  ) => UnsubscribeFunction;

  onJavaErrorDetails: (
    callback: (data: JavaErrorDetailsEvent) => void
  ) => UnsubscribeFunction;

  onBootstrapStatusChange: (
    callback: (status: string) => void
  ) => UnsubscribeFunction;

  loadPreferences: () => Promise<JavaApiResponseBase & { preferences?: UserPreferences }>;
  savePreferences: (preferences: UserPreferences) => Promise<JavaApiResponseBase>;

  exportPreferencesToFile: (
    path: string,
    data: UserPreferences
  ) => Promise<JavaApiResponseBase>;

  importPreferencesFromFile: (
    path: string
  ) => Promise<JavaApiResponseBase & { preferences?: UserPreferences }>;

  removeAllListeners: (channel: string) => void;

  /**
   * Получить абсолютный путь к файлу из drag-and-drop события.
   * Использует webUtils.getPathForFile() для кроссплатформенной совместимости.
   * @param file - File объект из e.dataTransfer.files
   * @returns Абсолютный путь к файлу или пустая строка если недоступен
   */
  getFilePathFromDrop: (file: File) => string;
}
