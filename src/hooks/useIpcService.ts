import { useState, useEffect, useCallback } from 'react';
import { ipcService, IIpcService } from '@/services/IpcService';

/**
 * React Hook для работы с IPC сервисом
 * Предоставляет состояние и методы для взаимодействия с Electron main процессом
 */
export const useIpcService = () => {
  const [javaStatus, setJavaStatus] = useState<{
    running: boolean;
    status: string;
    pid?: number;
    port?: number;
  } | null>(null);
  
  const [isJavaEventsSubscribed, setIsJavaEventsSubscribed] = useState(false);
  
  /**
   * Запуск Java процесса
   */
  const startJava = useCallback(async () => {
    try {
      const result = await ipcService.startJava();
      if (result.success) {
        // Обновляем статус после успешного запуска
        await refreshJavaStatus();
      } else {
        console.error('Failed to start Java:', result.error);
      }
      return result;
    } catch (error) {
      console.error('Error starting Java:', error);
      return { success: false, error: (error as Error).message };
    }
  }, []);
  
  /**
   * Остановка Java процесса
   */
  const stopJava = useCallback(async () => {
    try {
      const result = await ipcService.stopJava();
      if (result.success) {
        // Обновляем статус после успешной остановки
        await refreshJavaStatus();
      } else {
        console.error('Failed to stop Java:', result.error);
      }
      return result;
    } catch (error) {
      console.error('Error stopping Java:', error);
      return { success: false, error: (error as Error).message };
    }
  }, []);
  
  /**
   * Перезапуск Java процесса
   */
  const restartJava = useCallback(async () => {
    try {
      const result = await ipcService.restartJava();
      if (result.success) {
        // Обновляем статус после успешного перезапуска
        await refreshJavaStatus();
      } else {
        console.error('Failed to restart Java:', result.error);
      }
      return result;
    } catch (error) {
      console.error('Error restarting Java:', error);
      return { success: false, error: (error as Error).message };
    }
  }, []);
  
  /**
   * Получение статуса Java процесса
   */
  const refreshJavaStatus = useCallback(async () => {
    try {
      const result = await ipcService.getJavaStatus();
      if (result.success && result.data) {
        setJavaStatus(result.data);
      }
      return result;
    } catch (error) {
      console.error('Error getting Java status:', error);
      return { success: false, error: (error as Error).message };
    }
  }, []);
  
  /**
   * Выполнение Java команды
   */
  const executeJavaCommand = useCallback(async (command: string, args: any[] = []) => {
    try {
      return await ipcService.executeJavaCommand(command, args);
    } catch (error) {
      console.error('Error executing Java command:', error);
      return { success: false, error: (error as Error).message, command, args };
    }
  }, []);
  
  /**
   * Выполнение Java API запроса
   */
  const executeJavaApiRequest = useCallback(async (command: string, args: any[] = []) => {
    try {
      return await ipcService.executeJavaApiRequest(command, args);
    } catch (error) {
      console.error('Error executing Java API request:', error);
      return { success: false, error: (error as Error).message, command, args };
    }
  }, []);
  
  /**
   * Подписка на Java события
   */
  const subscribeToJavaEvents = useCallback(async () => {
    try {
      const result = await ipcService.subscribeToJavaEvents();
      if (result.success) {
        setIsJavaEventsSubscribed(true);
      }
      return result;
    } catch (error) {
      console.error('Error subscribing to Java events:', error);
      return { success: false, error: (error as Error).message };
    }
  }, []);
  
  /**
   * Отписка от Java событий
   */
  const unsubscribeFromJavaEvents = useCallback(async () => {
    try {
      const result = await ipcService.unsubscribeFromJavaEvents();
      if (result.success) {
        setIsJavaEventsSubscribed(false);
      }
      return result;
    } catch (error) {
      console.error('Error unsubscribing from Java events:', error);
      return { success: false, error: (error as Error).message };
    }
  }, []);
  
  // Автоматическое получение статуса при монтировании компонента
  useEffect(() => {
    refreshJavaStatus();
  }, [refreshJavaStatus]);
  
  // Установка слушателей событий от main процесса
  useEffect(() => {
    if (window.electronAPI) {
      // Слушаем события запуска Java
      const unsubscribeStarted = window.electronAPI.onJavaProcessStarted((data) => {
        console.log('Java process started:', data);
        setJavaStatus({
          running: true,
          status: data.status || 'running',
          pid: data.pid,
          port: data.port
        });
      });
      
      // Слушаем события остановки Java
      const unsubscribeStopped = window.electronAPI.onJavaProcessStopped((data) => {
        console.log('Java process stopped:', data);
        setJavaStatus({
          running: false,
          status: data.status || 'stopped',
          pid: data.pid,
          port: data.port
        });
      });
      
      // Слушаем события изменения статуса
      const unsubscribeStatusChange = window.electronAPI.onJavaStatusChange((data) => {
        console.log('Java status changed:', data);
        setJavaStatus({
          running: data.running,
          status: data.status,
          pid: data.pid,
          port: data.port
        });
      });
      
      // Слушаем события ошибок
      const unsubscribeError = window.electronAPI.onJavaProcessError((data) => {
        console.error('Java process error:', data);
        // Можно добавить обработку ошибок или показ уведомлений
      });
      
      // Очистка при размонтировании
      return () => {
        unsubscribeStarted?.();
        unsubscribeStopped?.();
        unsubscribeStatusChange?.();
        unsubscribeError?.();
      };
    }
  }, []);
  
  return {
    // Состояние
    javaStatus,
    isJavaEventsSubscribed,
    
    // Методы управления Java процессом
    startJava,
    stopJava,
    restartJava,
    refreshJavaStatus,
    
    // Методы выполнения команд
    executeJavaCommand,
    executeJavaApiRequest,
    
    // Методы подписки на события
    subscribeToJavaEvents,
    unsubscribeFromJavaEvents,
    
    // IPC сервис для прямого доступа
    ipcService
  };
};

export type UseIpcServiceReturn = ReturnType<typeof useIpcService>;
