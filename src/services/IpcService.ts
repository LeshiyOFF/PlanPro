/**
 * Интерфейс IPC сервиса для взаимодействия с Electron main процессом
 */
export interface IIpcService {
  // Информация о приложении
  getAppInfo(): Promise<any>;
  
  // Java процесс управление
  startJava(): Promise<{ success: boolean; error?: string; recoverable?: boolean }>;
  stopJava(): Promise<{ success: boolean; error?: string; recoverable?: boolean }>;
  restartJava(): Promise<{ success: boolean; error?: string; recoverable?: boolean }>;
  getJavaStatus(): Promise<{
    success: boolean;
    data?: {
      running: boolean;
      status: string;
      pid?: number;
      port?: number;
      configuration?: any;
    };
    error?: string;
  }>;
  
  // Java API команды
  executeJavaCommand(command: string, args: any[]): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    command: string;
    args: any[];
  }>;
  
  executeJavaApiRequest(command: string, args: any[]): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    command: string;
    args: any[];
  }>;
  
  // Подписка на события
  subscribeToJavaEvents(): Promise<{ success: boolean; message?: string }>;
  unsubscribeFromJavaEvents(): Promise<{ success: boolean; message?: string }>;
  
  // Диалоги
  showMessageBox(options: any): Promise<any>;
  showOpenDialog(options: any): Promise<any>;
  showSaveDialog(options: any): Promise<any>;
  
  // Внешние ссылки
  openExternal(url: string): Promise<void>;
}

/**
 * Сервис для работы с IPC в React приложении
 * Предоставляет типизированный интерфейс к Electron main процессу
 */
export class IpcService implements IIpcService {
  
  /**
   * Получение информации о приложении
   */
  public async getAppInfo(): Promise<any> {
    return await window.electronAPI?.invoke('get-app-info') || {};
  }
  
  /**
   * Запуск Java процесса
   */
  public async startJava(): Promise<{ success: boolean; error?: string; recoverable?: boolean }> {
    return await window.electronAPI?.invoke('java-start') || { 
      success: false, 
      error: 'Electron API not available' 
    };
  }
  
  /**
   * Остановка Java процесса
   */
  public async stopJava(): Promise<{ success: boolean; error?: string; recoverable?: boolean }> {
    return await window.electronAPI?.invoke('java-stop') || { 
      success: false, 
      error: 'Electron API not available' 
    };
  }
  
  /**
   * Перезапуск Java процесса
   */
  public async restartJava(): Promise<{ success: boolean; error?: string; recoverable?: boolean }> {
    return await window.electronAPI?.invoke('java-restart') || { 
      success: false, 
      error: 'Electron API not available' 
    };
  }
  
  /**
   * Получение детального статуса Java процесса
   */
  public async getJavaStatus(): Promise<{
    success: boolean;
    data?: {
      running: boolean;
      status: string;
      pid?: number;
      port?: number;
      configuration?: any;
      version?: string;
      memoryUsage?: number;
      uptime?: number;
      activeConnections?: number;
      lastRestart?: Date;
    };
    error?: string;
  }> {
    return await window.electronAPI?.invoke('java-status') || { 
      success: false, 
      error: 'Electron API not available' 
    };
  }
  
  /**
   * Выполнение Java команды
   */
  public async executeJavaCommand(command: string, args: any[] = []): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    command: string;
    args: any[];
  }> {
    return await window.electronAPI?.invoke('java-execute-command', { command, args }) || { 
      success: false, 
      error: 'Electron API not available',
      command,
      args
    };
  }
  
  /**
   * Выполнение Java API запроса
   */
  public async executeJavaApiRequest(command: string, args: any[] = []): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    command: string;
    args: any[];
  }> {
    return await window.electronAPI?.invoke('java-api-request', { command, args }) || { 
      success: false, 
      error: 'Electron API not available',
      command,
      args
    };
  }
  
  /**
   * Подписка на Java события
   */
  public async subscribeToJavaEvents(): Promise<{ success: boolean; message?: string }> {
    return await window.electronAPI?.invoke('java-subscribe-events') || { 
      success: false, 
      error: 'Electron API not available' 
    };
  }
  
  /**
   * Отписка от Java событий
   */
  public async unsubscribeFromJavaEvents(): Promise<{ success: boolean; message?: string }> {
    return await window.electronAPI?.invoke('java-unsubscribe-events') || { 
      success: false, 
      error: 'Electron API not available' 
    };
  }
  
  /**
   * Показать диалоговое окно
   */
  public async showMessageBox(options: any): Promise<any> {
    return await window.electronAPI?.invoke('show-message-box', options);
  }
  
  /**
   * Показать диалог открытия файла
   */
  public async showOpenDialog(options: any): Promise<any> {
    return await window.electronAPI?.invoke('show-open-dialog', options);
  }
  
  /**
   * Показать диалог сохранения файла
   */
  public async showSaveDialog(options: any): Promise<any> {
    return await window.electronAPI?.invoke('show-save-dialog', options);
  }
  
  /**
   * Открыть внешнюю ссылку
   */
  public async openExternal(url: string): Promise<void> {
    await window.electronAPI?.invoke('open-external', url);
  }
}

// Экспорт единственного экземпляра сервиса
export const ipcService = new IpcService();

