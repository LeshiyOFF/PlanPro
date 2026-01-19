import { useEffect, useRef, useState, useCallback } from 'react';
import { LastProjectService } from '@/services/LastProjectService';
import { useFileOperations } from './useFileOperations';

export type LoadErrorType = 'FILE_NOT_FOUND' | 'FILE_MOVED' | 'LOAD_FAILED' | 'API_ERROR' | 'CREATE_FAILED' | null;

interface LoaderState {
  isLoading: boolean;
  errorType: LoadErrorType;
  errorMessage: string | null;
  filePath: string | null;
}

/**
 * Хук для автоматической загрузки последнего проекта или создания нового при старте.
 * Включает улучшенную обработку ошибок и уведомления пользователя.
 * 
 * Логика:
 * 1. Если есть MRU (последний открытый проект) → загружаем его
 * 2. Если MRU пуст → автоматически создаём новый проект в Java-ядре
 * 
 * Принцип SRP: отвечает только за инициализацию проекта при старте.
 */
export const useLastProjectLoader = () => {
  const { loadProjectFromPath, createNewProject } = useFileOperations();
  const [state, setState] = useState<LoaderState>({
    isLoading: false,
    errorType: null,
    errorMessage: null,
    filePath: null
  });
  const hasAttemptedRef = useRef(false);
  
  const showErrorNotification = useCallback(async (errorType: LoadErrorType, filePath: string) => {
    if (!window.electronAPI) return;
    
    const messages: Record<Exclude<LoadErrorType, null>, string> = {
      'FILE_NOT_FOUND': `Файл последнего проекта не найден:\n${filePath}\n\nФайл мог быть удален или перемещен.`,
      'FILE_MOVED': `Файл проекта был перемещен или переименован:\n${filePath}`,
      'LOAD_FAILED': `Не удалось загрузить проект:\n${filePath}\n\nФайл может быть поврежден.`,
      'API_ERROR': `Ошибка при загрузке проекта.\nПроверьте, что Java-бэкенд запущен.`
    };
    
    if (errorType) {
      await window.electronAPI.showMessageBox({
        type: 'warning',
        title: 'Автозагрузка проекта',
        message: messages[errorType]
      });
    }
  }, []);
  
  const checkFileExists = useCallback(async (filePath: string): Promise<boolean> => {
    if (!window.electronAPI?.fileExists) {
      return true; // Если метод недоступен, пропускаем проверку
    }
    
    try {
      return await window.electronAPI.fileExists(filePath);
    } catch (error) {
      console.warn('[useLastProjectLoader] fileExists check failed:', error);
      return true; // При ошибке проверки, пробуем загрузить
    }
  }, []);
  
  useEffect(() => {
    if (hasAttemptedRef.current) return;
    hasAttemptedRef.current = true;
    
    const initializeProject = async () => {
      const lastProjectService = LastProjectService.getInstance();
      const lastProjectPath = lastProjectService.getLastProject();
      
      // Если нет MRU — создаём новый проект в Java-ядре
      if (!lastProjectPath) {
        console.log('[useLastProjectLoader] No last project found, creating new project...');
        await createNewProjectSilently();
        return;
      }
      
      console.log('[useLastProjectLoader] Loading:', lastProjectPath);
      setState(s => ({ ...s, isLoading: true, filePath: lastProjectPath }));
      
      // Проверяем существование файла
      const exists = await checkFileExists(lastProjectPath);
      if (!exists) {
        console.warn('[useLastProjectLoader] File not found:', lastProjectPath);
        lastProjectService.clearLastProject();
        setState(s => ({ ...s, isLoading: false, errorType: 'FILE_NOT_FOUND', errorMessage: 'Файл не найден' }));
        await showErrorNotification('FILE_NOT_FOUND', lastProjectPath);
        // После уведомления создаём новый проект
        await createNewProjectSilently();
        return;
      }
      
      try {
        const success = await loadProjectFromPath(lastProjectPath);
        
        if (success) {
          console.log('[useLastProjectLoader] ✅ Loaded successfully');
          setState(s => ({ ...s, isLoading: false, errorType: null, errorMessage: null }));
        } else {
          console.warn('[useLastProjectLoader] ⚠️ Load returned false');
          lastProjectService.clearLastProject();
          setState(s => ({ ...s, isLoading: false, errorType: 'LOAD_FAILED', errorMessage: 'Ошибка загрузки' }));
          await showErrorNotification('LOAD_FAILED', lastProjectPath);
          // После ошибки загрузки создаём новый проект
          await createNewProjectSilently();
        }
      } catch (error) {
        console.error('[useLastProjectLoader] ❌ Error:', error);
        lastProjectService.clearLastProject();
        const message = (error as Error).message;
        const errorType: LoadErrorType = message.includes('API') ? 'API_ERROR' : 'LOAD_FAILED';
        setState(s => ({ ...s, isLoading: false, errorType, errorMessage: message }));
        await showErrorNotification(errorType, lastProjectPath);
        // После ошибки создаём новый проект (если не API ошибка)
        if (errorType !== 'API_ERROR') {
          await createNewProjectSilently();
        }
      }
    };
    
    /**
     * Создаёт новый проект без показа диалога.
     * Используется для автоматической инициализации при старте.
     */
    const createNewProjectSilently = async () => {
      try {
        console.log('[useLastProjectLoader] Creating new project silently...');
        const success = await createNewProject(true); // silent mode
        if (success) {
          console.log('[useLastProjectLoader] ✅ New project created');
        } else {
          console.warn('[useLastProjectLoader] ⚠️ New project creation returned false');
          setState(s => ({ ...s, errorType: 'CREATE_FAILED', errorMessage: 'Не удалось создать проект' }));
        }
      } catch (error) {
        console.error('[useLastProjectLoader] ❌ Failed to create new project:', error);
        setState(s => ({ ...s, errorType: 'CREATE_FAILED', errorMessage: 'Не удалось создать проект' }));
      }
    };
    
    const timeoutId = setTimeout(initializeProject, 500);
    return () => clearTimeout(timeoutId);
  }, [loadProjectFromPath, createNewProject, checkFileExists, showErrorNotification]);
  
  return { 
    isLoading: state.isLoading, 
    loadError: state.errorMessage,
    errorType: state.errorType 
  };
};

