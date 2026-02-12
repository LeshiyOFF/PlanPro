import { ipcRenderer, IpcRendererEvent } from 'electron';
import {
  IpcChannels,
  JavaProcessStartedEvent,
  JavaProcessStoppedEvent,
  JavaStatusChangeEvent,
  JavaProcessErrorEvent,
  JavaErrorDetailsEvent,
  JavaApiResponseBase,
  JavaStatusData,
  JavaCommandArgs,
  UserPreferences,
  BinaryFileSaveResult,
  UnsubscribeFunction
} from '../types/IpcTypes';
import { ElectronAPI } from './ElectronApiTypes';

/**
 * Создаёт типизированный слушатель IPC события
 */
function createEventListener<T>(
  channel: IpcChannels,
  callback: (data: T) => void
): UnsubscribeFunction {
  const listener = (_event: IpcRendererEvent, data: T): void => callback(data);
  ipcRenderer.on(channel, listener);
  return () => {
    ipcRenderer.removeListener(channel, listener);
  };
}

/**
 * Создаёт реализацию типизированного Electron API
 */
export function createElectronAPI(): ElectronAPI {
  return {
    javaExecute: (
      command: string,
      args: JavaCommandArgs[] = []
    ): Promise<JavaApiResponseBase & { data?: import('../types/JsonValue').JsonValue }> => {
      return ipcRenderer.invoke(IpcChannels.JAVA_EXECUTE_COMMAND, { command, args });
    },

    javaApiRequest: (
      command: string,
      args?: JavaCommandArgs
    ): Promise<JavaApiResponseBase & { data?: import('../types/JsonValue').JsonValue }> => {
      return ipcRenderer.invoke(IpcChannels.JAVA_API_REQUEST, { command, args });
    },

    getJavaStatus: (): Promise<JavaApiResponseBase & { data?: JavaStatusData }> => {
      return ipcRenderer.invoke(IpcChannels.JAVA_STATUS);
    },

    subscribeToJavaEvents: (): Promise<JavaApiResponseBase> => {
      return ipcRenderer.invoke(IpcChannels.JAVA_SUBSCRIBE_EVENTS);
    },

    unsubscribeFromJavaEvents: (): Promise<JavaApiResponseBase> => {
      return ipcRenderer.invoke(IpcChannels.JAVA_UNSUBSCRIBE_EVENTS);
    },

    getAppInfo: () => ipcRenderer.invoke(IpcChannels.GET_APP_INFO),

    showMessageBox: (options) => ipcRenderer.invoke(IpcChannels.SHOW_MESSAGE_BOX, options),
    showOpenDialog: (options) => ipcRenderer.invoke(IpcChannels.SHOW_OPEN_DIALOG, options),
    showSaveDialog: (options) => ipcRenderer.invoke(IpcChannels.SHOW_SAVE_DIALOG, options),

    saveBinaryFile: (
      path: string,
      data: ArrayBuffer | Uint8Array
    ): Promise<BinaryFileSaveResult> => {
      return ipcRenderer.invoke(IpcChannels.SAVE_BINARY_FILE, { path, data });
    },

    openExternal: (url: string): Promise<void> => {
      return ipcRenderer.invoke(IpcChannels.OPEN_EXTERNAL, url);
    },

    onJavaProcessStarted: (
      callback: (data: JavaProcessStartedEvent) => void
    ): UnsubscribeFunction => createEventListener(IpcChannels.JAVA_PROCESS_STARTED, callback),

    onJavaProcessStopped: (
      callback: (data: JavaProcessStoppedEvent) => void
    ): UnsubscribeFunction => createEventListener(IpcChannels.JAVA_PROCESS_STOPPED, callback),

    onJavaStatusChange: (
      callback: (data: JavaStatusChangeEvent) => void
    ): UnsubscribeFunction => createEventListener(IpcChannels.JAVA_STATUS_CHANGE, callback),

    onJavaProcessError: (
      callback: (data: JavaProcessErrorEvent) => void
    ): UnsubscribeFunction => createEventListener(IpcChannels.JAVA_PROCESS_ERROR, callback),

    onJavaErrorDetails: (
      callback: (data: JavaErrorDetailsEvent) => void
    ): UnsubscribeFunction => createEventListener(IpcChannels.JAVA_ERROR_DETAILS, callback),

    onBootstrapStatusChange: (callback: (status: string) => void): UnsubscribeFunction => {
      return createEventListener(IpcChannels.BOOTSTRAP_STATUS_CHANGE, callback);
    },

    loadPreferences: (): Promise<JavaApiResponseBase & { preferences?: UserPreferences }> => {
      return ipcRenderer.invoke(IpcChannels.PREFERENCES_LOAD);
    },

    savePreferences: (preferences: UserPreferences): Promise<JavaApiResponseBase> => {
      return ipcRenderer.invoke(IpcChannels.PREFERENCES_SAVE, preferences);
    },

    exportPreferencesToFile: (
      path: string,
      data: UserPreferences
    ): Promise<JavaApiResponseBase> => {
      return ipcRenderer.invoke(IpcChannels.PREFERENCES_EXPORT, { path, data });
    },

    importPreferencesFromFile: (
      path: string
    ): Promise<JavaApiResponseBase & { preferences?: UserPreferences }> => {
      return ipcRenderer.invoke(IpcChannels.PREFERENCES_IMPORT, path);
    },

    removeAllListeners: (channel: string): void => {
      ipcRenderer.removeAllListeners(channel);
    }
  };
}
