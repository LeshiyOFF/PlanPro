import { contextBridge, ipcRenderer } from 'electron';

/**
 * Централизованный список IPC каналов приложения.
 * Временно дублируем здесь для стабильности в production (избегаем module not found в asar)
 */
export enum IpcChannels {
  // Java Bridge - Команды (Main <- Renderer)
  JAVA_EXECUTE_COMMAND = 'java-execute-command',
  JAVA_START = 'java-start',
  JAVA_STOP = 'java-stop',
  JAVA_RESTART = 'java-restart',
  JAVA_STATUS = 'java-status',
  JAVA_API_REQUEST = 'java-api-request',
  JAVA_SUBSCRIBE_EVENTS = 'java-subscribe-events',
  JAVA_UNSUBSCRIBE_EVENTS = 'java-unsubscribe-events',

  // Java Bridge - События (Main -> Renderer)
  JAVA_PROCESS_STARTED = 'java-process-started',
  JAVA_PROCESS_STOPPED = 'java-process-stopped',
  JAVA_STATUS_CHANGE = 'java-status-change',
  JAVA_PROCESS_ERROR = 'java-process-error',
  JAVA_ERROR_DETAILS = 'java-error-details',

  // Системные - Команды (Main <- Renderer)
  GET_APP_INFO = 'get-app-info',
  SHOW_MESSAGE_BOX = 'show-message-box',
  SHOW_OPEN_DIALOG = 'show-open-dialog',
  SHOW_SAVE_DIALOG = 'show-save-dialog',
  OPEN_EXTERNAL = 'open-external'
}

/**
 * Экспортируемый API для renderer процесса
 * Безопасный мост между main и renderer процессами.
 * 
 * ВНИМАНИЕ: Названия функций должны строго соответствовать ожиданиям в vendor.js и main.js
 */
export interface ElectronAPI {
  // Общий метод invoke, который ищут некоторые части приложения
  invoke: (channel: string, ...args: any[]) => Promise<any>;
  
  // Java взаимодействие
  javaExecute: (command: string, args?: any[]) => Promise<any>;
  javaApiRequest: (command: string, args?: any) => Promise<any>;
  getJavaStatus: () => Promise<any>;
  
  // Системные функции
  getAppInfo: () => Promise<any>;
  showMessageBox: (options: Electron.MessageBoxOptions) => Promise<Electron.MessageBoxReturnValue>;
  showOpenDialog: (options: Electron.OpenDialogOptions) => Promise<Electron.OpenDialogReturnValue>;
  showSaveDialog: (options: Electron.SaveDialogOptions) => Promise<Electron.SaveDialogReturnValue>;
  openExternal: (url: string) => Promise<void>;
  
  // События (Строгие имена из логов ошибок)
  onJavaProcessStarted: (callback: (data: any) => void) => () => void;
  onJavaProcessStopped: (callback: (data: any) => void) => () => void;
  onJavaStatusChange: (callback: (data: any) => void) => () => void;
  onJavaProcessError: (callback: (data: any) => void) => () => void;
  onJavaErrorDetails: (callback: (data: any) => void) => () => void;
  onBootstrapStatusChange: (callback: (status: string) => void) => () => void;
  
  // Пользовательские настройки
  loadPreferences: () => Promise<any>;
  savePreferences: (preferences: any) => Promise<any>;
  exportPreferencesToFile: (path: string, data: any) => Promise<any>;
  importPreferencesFromFile: (path: string) => Promise<any>;
  
  // Удаление слушателей
  removeAllListeners: (channel: string) => void;
}

/**
 * Реализация безопасного API
 */
const electronAPI: ElectronAPI = {
  // Метод invoke для гибкости
  invoke: (channel: string, ...args: any[]): Promise<any> => {
    return ipcRenderer.invoke(channel, ...args);
  },

  // Java взаимодействие
  javaExecute: (command: string, args?: string[]): Promise<any> => {
    return ipcRenderer.invoke(IpcChannels.JAVA_EXECUTE_COMMAND, { command, args: args || [] });
  },

  javaApiRequest: (command: string, args?: any): Promise<any> => {
    return ipcRenderer.invoke(IpcChannels.JAVA_API_REQUEST, { command, args });
  },

  getJavaStatus: (): Promise<any> => {
    return ipcRenderer.invoke(IpcChannels.JAVA_STATUS);
  },
  
  // Системные функции
  getAppInfo: (): Promise<any> => {
    return ipcRenderer.invoke(IpcChannels.GET_APP_INFO);
  },
    
  showMessageBox: (options: Electron.MessageBoxOptions): Promise<Electron.MessageBoxReturnValue> => {
    return ipcRenderer.invoke(IpcChannels.SHOW_MESSAGE_BOX, options);
  },

  showOpenDialog: (options: Electron.OpenDialogOptions): Promise<Electron.OpenDialogReturnValue> => {
    return ipcRenderer.invoke(IpcChannels.SHOW_OPEN_DIALOG, options);
  },

  showSaveDialog: (options: Electron.SaveDialogOptions): Promise<Electron.SaveDialogReturnValue> => {
    return ipcRenderer.invoke(IpcChannels.SHOW_SAVE_DIALOG, options);
  },
    
  openExternal: (url: string): Promise<void> => {
    return ipcRenderer.invoke(IpcChannels.OPEN_EXTERNAL, url);
  },
  
  // События (С восстановленными именами и логикой отписки)
  onJavaProcessStarted: (callback: (data: any) => void): (() => void) => {
    const listener = (_: any, data: any) => callback(data);
    ipcRenderer.on(IpcChannels.JAVA_PROCESS_STARTED, listener);
    return () => {
      ipcRenderer.removeListener(IpcChannels.JAVA_PROCESS_STARTED, listener);
    };
  },
  
  onJavaProcessStopped: (callback: (data: any) => void): (() => void) => {
    const listener = (_: any, data: any) => callback(data);
    ipcRenderer.on(IpcChannels.JAVA_PROCESS_STOPPED, listener);
    return () => {
      ipcRenderer.removeListener(IpcChannels.JAVA_PROCESS_STOPPED, listener);
    };
  },

  onJavaStatusChange: (callback: (data: any) => void): (() => void) => {
    const listener = (_: any, data: any) => callback(data);
    ipcRenderer.on(IpcChannels.JAVA_STATUS_CHANGE, listener);
    return () => {
      ipcRenderer.removeListener(IpcChannels.JAVA_STATUS_CHANGE, listener);
    };
  },
  
  onJavaProcessError: (callback: (data: any) => void): (() => void) => {
    const listener = (_: any, data: any) => callback(data);
    ipcRenderer.on(IpcChannels.JAVA_PROCESS_ERROR, listener);
    return () => {
      ipcRenderer.removeListener(IpcChannels.JAVA_PROCESS_ERROR, listener);
    };
  },

  onJavaErrorDetails: (callback: (data: any) => void): (() => void) => {
    const listener = (_: any, data: any) => callback(data);
    ipcRenderer.on(IpcChannels.JAVA_ERROR_DETAILS, listener);
    return () => {
      ipcRenderer.removeListener(IpcChannels.JAVA_ERROR_DETAILS, listener);
    };
  },

  onBootstrapStatusChange: (callback: (status: string) => void): (() => void) => {
    const listener = (_: any, status: string) => callback(status);
    ipcRenderer.on('bootstrap-status-change', listener);
    return () => {
      ipcRenderer.removeListener('bootstrap-status-change', listener);
    };
  },

  // Пользовательские настройки
  loadPreferences: (): Promise<any> => {
    return ipcRenderer.invoke('preferences:load');
  },

  savePreferences: (preferences: any): Promise<any> => {
    return ipcRenderer.invoke('preferences:save', preferences);
  },

  exportPreferencesToFile: (path: string, data: any): Promise<any> => {
    return ipcRenderer.invoke('preferences:export-to-file', { path, data });
  },

  importPreferencesFromFile: (path: string): Promise<any> => {
    return ipcRenderer.invoke('preferences:import-from-file', path);
  },
  
  // Удаление слушателей
  removeAllListeners: (channel: string): void => {
    ipcRenderer.removeAllListeners(channel);
  }
};

/**
 * Регистрация API в глобальном контексте window.electronAPI
 */
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

/**
 * Определение типов для TypeScript глобально
 */
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
