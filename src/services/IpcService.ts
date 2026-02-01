/**
 * Сервис для работы с IPC в React приложении.
 * Предоставляет типизированный интерфейс к Electron main процессу.
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
import type { IIpcService } from './IIpcService';
import { DEFAULT_ERROR_RESPONSE, DEFAULT_APP_INFO } from './IIpcService';
import { getElectronAPI } from '@/utils/electronAPI';
import type { JsonObject, JsonValue } from '@/types/json-types';

export type { IIpcService };

/**
 * Реализация IPC сервиса
 */
export class IpcService implements IIpcService {
  public async getAppInfo(): Promise<AppInfo> {
    const api = getElectronAPI();
    const result = api ? await api.getAppInfo?.() : undefined;
    return (result as AppInfo | undefined) ?? DEFAULT_APP_INFO;
  }

  public async startJava(): Promise<JavaApiResponseBase> {
    const api = getElectronAPI();
    if (!api?.javaExecute) return DEFAULT_ERROR_RESPONSE;
    const result = (await api.javaExecute('start')) as JavaApiResponseBase | undefined;
    return {
      success: result?.success ?? false,
      error: result?.error,
      recoverable: result?.recoverable
    };
  }

  public async stopJava(): Promise<JavaApiResponseBase> {
    const api = getElectronAPI();
    if (!api?.javaExecute) return DEFAULT_ERROR_RESPONSE;
    const result = (await api.javaExecute('stop')) as JavaApiResponseBase | undefined;
    return {
      success: result?.success ?? false,
      error: result?.error,
      recoverable: result?.recoverable
    };
  }

  public async restartJava(): Promise<JavaApiResponseBase> {
    const api = getElectronAPI();
    if (!api?.javaExecute) return DEFAULT_ERROR_RESPONSE;
    const result = (await api.javaExecute('restart')) as JavaApiResponseBase | undefined;
    return {
      success: result?.success ?? false,
      error: result?.error,
      recoverable: result?.recoverable
    };
  }

  public async getJavaStatus(): Promise<JavaApiResponse<JavaStatusData>> {
    const api = getElectronAPI();
    if (!api?.getJavaStatus) return { ...DEFAULT_ERROR_RESPONSE, data: undefined };
    const result = (await api.getJavaStatus()) as JavaApiResponse<JavaStatusData> | undefined;
    return {
      success: result?.success ?? false,
      data: result?.data,
      error: result?.error
    };
  }

  public async executeJavaCommand(
    command: string,
    args: JavaCommandArgs[] = []
  ): Promise<JavaCommandResponse> {
    const api = getElectronAPI();
    if (!api?.javaExecute) return { ...DEFAULT_ERROR_RESPONSE, command, args };
    const result = (await api.javaExecute(command, args)) as JavaCommandResponse | undefined;
    return {
      success: result?.success ?? false,
      data: result?.data,
      error: result?.error,
      command,
      args
    };
  }

  public async executeJavaApiRequest<T = JsonObject>(
    command: string,
    args: JavaCommandArgs[] = []
  ): Promise<JavaApiResponse<T>> {
    const api = getElectronAPI();
    if (!api?.javaApiRequest) return { ...DEFAULT_ERROR_RESPONSE, data: undefined };
    const result = (await api.javaApiRequest(command, args)) as JavaApiResponse<T> | undefined;
    return {
      success: result?.success ?? false,
      data: result?.data as T | undefined,
      error: result?.error
    };
  }

  public async subscribeToJavaEvents(): Promise<JavaEventSubscriptionResponse> {
    const api = getElectronAPI();
    if (!api?.javaExecute) return DEFAULT_ERROR_RESPONSE;
    const result = (await api.javaExecute('subscribe-events')) as JavaEventSubscriptionResponse | undefined;
    return {
      success: result?.success ?? false,
      message: typeof result?.message === 'string' ? result.message : undefined,
      error: result?.error
    };
  }

  public async unsubscribeFromJavaEvents(): Promise<JavaEventSubscriptionResponse> {
    const api = getElectronAPI();
    if (!api?.javaExecute) return DEFAULT_ERROR_RESPONSE;
    const result = (await api.javaExecute('unsubscribe-events')) as JavaEventSubscriptionResponse | undefined;
    return {
      success: result?.success ?? false,
      message: typeof result?.message === 'string' ? result.message : undefined,
      error: result?.error
    };
  }

  public async showMessageBox(options: MessageBoxOptions): Promise<MessageBoxResult> {
    const api = getElectronAPI();
    if (!api?.showMessageBox) return { response: 0, checkboxChecked: false };
    const result = await api.showMessageBox(options);
    return { response: result.response, checkboxChecked: result.checkboxChecked ?? false };
  }

  public async showOpenDialog(options: Record<string, JsonValue>): Promise<OpenDialogResult> {
    const api = getElectronAPI();
    if (!api?.showOpenDialog) return { canceled: true, filePaths: [] };
    return api.showOpenDialog(options as Record<string, JsonObject>) as Promise<OpenDialogResult>;
  }

  public async showSaveDialog(options: Record<string, JsonValue>): Promise<SaveDialogResult> {
    const api = getElectronAPI();
    if (!api?.showSaveDialog) return { canceled: true };
    return api.showSaveDialog(options as Record<string, JsonObject>) as Promise<SaveDialogResult>;
  }

  public async openExternal(url: string): Promise<void> {
    const api = getElectronAPI();
    if (api?.openExternal) await api.openExternal(url);
  }

  public async loadPreferences(): Promise<
    JavaApiResponseBase & { preferences?: UserPreferences }
  > {
    const api = getElectronAPI();
    if (!api?.loadPreferences) return DEFAULT_ERROR_RESPONSE;
    return api.loadPreferences() as Promise<JavaApiResponseBase & { preferences?: UserPreferences }>;
  }

  public async savePreferences(preferences: UserPreferences): Promise<JavaApiResponseBase> {
    const api = getElectronAPI();
    if (!api?.savePreferences) return DEFAULT_ERROR_RESPONSE;
    return api.savePreferences(preferences) as Promise<JavaApiResponseBase>;
  }

  public async fileExists(path: string): Promise<boolean> {
    const api = getElectronAPI();
    if (!api?.fileExists) return false;
    return api.fileExists(path);
  }

  public async saveBinaryFile(path: string, data: ArrayBuffer | Uint8Array): Promise<{ success: boolean; error?: string; bytesWritten?: number }> {
    const api = getElectronAPI();
    if (!api?.saveBinaryFile) return { success: false, error: 'API not available' };
    return api.saveBinaryFile(path, data);
  }

  public async removeAllListeners(channel: string): Promise<void> {
    const api = getElectronAPI();
    if (api?.removeAllListeners) api.removeAllListeners(channel);
  }
}

export const ipcService = new IpcService();
