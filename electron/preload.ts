import { contextBridge, ipcRenderer } from 'electron';

/**
 * Экспортируемый API для renderer процесса
 * Безопасный мост между main и renderer процессами
 */
export interface ElectronAPI {
  // Java взаимодействие
  javaExecute: (command: string, args?: string[]) => Promise<any>;
  
  // Системные функции
  getAppVersion: () => Promise<string>;
  showMessageBox: (options: Electron.MessageBoxOptions) => Promise<Electron.MessageBoxReturnValue>;
  openExternal: (url: string) => Promise<void>;
  
  // События
  onJavaStarted: (callback: () => void) => void;
  onJavaStopped: (callback: () => void) => void;
  onJavaError: (callback: (error: Error) => void) => void;
  
  // Удаление слушателей
  removeAllListeners: (channel: string) => void;
}

/**
 * Создание и регистрация безопасного API
 */
const electronAPI: ElectronAPI = {
  // Java взаимодействие
  javaExecute: (command: string, args?: string[]): Promise<any> => 
    ipcRenderer.invoke('java-execute', command, args || []),
  
  // Системные функции
  getAppVersion: (): Promise<string> => 
    ipcRenderer.invoke('get-app-version'),
    
  showMessageBox: (options: Electron.MessageBoxOptions): Promise<Electron.MessageBoxReturnValue> => 
    ipcRenderer.invoke('show-message-box', options),
    
  openExternal: (url: string): Promise<void> => 
    ipcRenderer.invoke('open-external', url),
  
  // События
  onJavaStarted: (callback: () => void): void => {
    ipcRenderer.on('java-started', callback);
  },
  
  onJavaStopped: (callback: () => void): void => {
    ipcRenderer.on('java-stopped', callback);
  },
  
  onJavaError: (callback: (error: Error) => void): void => {
    ipcRenderer.on('java-error', (_, error) => callback(error));
  },
  
  // Удаление слушателей
  removeAllListeners: (channel: string): void => {
    ipcRenderer.removeAllListeners(channel);
  }
};

/**
 * Регистрация API в глобальном контексте
 */
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

/**
 * Определение типов для TypeScript
 */
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

/**
 * Вспомогательные утилиты для renderer процесса
 */
const utils = {
  /**
   * Получение информации о приложении
   */
  async getAppInfo(): Promise<{ version: string; platform: string }> {
    const version = (globalThis as any).electronAPI ? 
      await (globalThis as any).electronAPI.getAppVersion() : 
      'Unknown';
    
    return {
      version,
      platform: 'Unknown'
    };
  }
};

// Экспорт утилит для использования в приложении
contextBridge.exposeInMainWorld('appUtils', utils);

/**
 * Определение типов утилит
 */
declare global {
  interface Window {
    appUtils: typeof utils;
  }
}