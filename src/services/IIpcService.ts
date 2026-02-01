import type { JsonObject } from '@/types/json-types';

/**
 * Интерфейс IPC сервиса для взаимодействия с Electron main процессом.
 */

import {
  JavaApiResponse,
  JavaApiResponseBase,
  JavaStatusData,
  JavaCommandArgs,
  JavaCommandResponse,
  JavaEventSubscriptionResponse,
  AppInfo,
  UserPreferences
} from '@/types/ipc';
import {
  MessageBoxOptions,
  MessageBoxResult,
  OpenDialogOptions,
  OpenDialogResult,
  SaveDialogOptions,
  SaveDialogResult
} from '@/types/ipc/DialogTypes';

/**
 * Интерфейс IPC сервиса
 */
export interface IIpcService {
  getAppInfo(): Promise<AppInfo>;

  startJava(): Promise<JavaApiResponseBase>;
  stopJava(): Promise<JavaApiResponseBase>;
  restartJava(): Promise<JavaApiResponseBase>;
  getJavaStatus(): Promise<JavaApiResponse<JavaStatusData>>;

  executeJavaCommand(
    command: string,
    args: JavaCommandArgs[]
  ): Promise<JavaCommandResponse>;

  executeJavaApiRequest<T = JsonObject>(
    command: string,
    args: JavaCommandArgs[]
  ): Promise<JavaApiResponse<T>>;

  subscribeToJavaEvents(): Promise<JavaEventSubscriptionResponse>;
  unsubscribeFromJavaEvents(): Promise<JavaEventSubscriptionResponse>;

  showMessageBox(options: MessageBoxOptions): Promise<MessageBoxResult>;
  showOpenDialog(options: OpenDialogOptions): Promise<OpenDialogResult>;
  showSaveDialog(options: SaveDialogOptions): Promise<SaveDialogResult>;

  openExternal(url: string): Promise<void>;

  loadPreferences(): Promise<JavaApiResponseBase & { preferences?: UserPreferences }>;
  savePreferences(preferences: UserPreferences): Promise<JavaApiResponseBase>;
}

/**
 * Ответ по умолчанию при отсутствии Electron API
 */
export const DEFAULT_ERROR_RESPONSE: JavaApiResponseBase = {
  success: false,
  error: 'Electron API not available'
};

/**
 * Информация о приложении по умолчанию
 */
export const DEFAULT_APP_INFO: AppInfo = {
  name: 'Unknown',
  version: '0.0.0',
  electron: '0.0.0',
  chrome: '0.0.0',
  node: '0.0.0',
  platform: 'unknown' as NodeJS.Platform,
  arch: 'unknown',
  locale: 'en',
  resourcesPath: '',
  userDataPath: ''
};
