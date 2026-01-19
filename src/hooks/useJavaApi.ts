import { useState, useEffect, useCallback } from 'react';
import { javaApiService, IJavaApiService } from '@/services/JavaApiService';
import { useIpcService } from './useIpcService';

/**
 * Структура данных проекта
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  created?: string;
  updated?: string;
}

/**
 * Структура данных задачи
 */
export interface Task {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  duration?: number;
  progress?: number;
  status?: string;
  dependencies?: string[];
  resourceId?: string;
  created?: string;
  updated?: string;
}

/**
 * Структура данных ресурса
 */
export interface Resource {
  id: string;
  name: string;
  email?: string;
  role?: string;
  availability?: number;
  costPerHour?: number;
  created?: string;
  updated?: string;
}

/**
 * React Hook для работы с Java API
 * Предоставляет состояние и методы для взаимодействия с Java бэкендом
 */
export const useJavaApi = () => {
  const { javaStatus } = useIpcService();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiAvailable, setIsApiAvailable] = useState(false);
  
  // State для данных
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  
  /**
   * Проверка доступности Java API
   */
  const checkApiAvailability = useCallback(async () => {
    try {
      const isAvailable = await javaApiService.ping();
      setIsApiAvailable(isAvailable);
      return isAvailable;
    } catch (error) {
      setIsApiAvailable(false);
      return false;
    }
  }, []);
  
  /**
   * Wrapper для выполнения API вызовов с обработкой ошибок
   */
  const executeApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    loadingState: boolean = true
  ): Promise<T | null> => {
    if (loadingState) {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      const errorMessage = (error as Error).message;
      setError(errorMessage);
      console.error('Java API call failed:', error);
      return null;
    } finally {
      if (loadingState) {
        setIsLoading(false);
      }
    }
  }, []);
  
  // Project operations
  
  /**
   * Загрузка всех проектов
   */
  const loadProjects = useCallback(async () => {
    const result = await executeApiCall(() => javaApiService.getAllProjects());
    if (result && Array.isArray(result)) {
      setProjects(result);
    }
    return result;
  }, [executeApiCall]);
  
  /**
   * Создание проекта
   */
  const createProject = useCallback(async (projectData: Omit<Project, 'id' | 'created' | 'updated'>) => {
    const result = await executeApiCall(() => javaApiService.createProject(projectData));
    if (result) {
      await loadProjects(); // Обновляем список проектов
    }
    return result;
  }, [executeApiCall, loadProjects]);
  
  /**
   * Загрузка конкретного проекта
   */
  const loadProject = useCallback(async (projectId: string) => {
    const result = await executeApiCall(() => javaApiService.getProject(projectId));
    if (result) {
      setCurrentProject(result);
    }
    return result;
  }, [executeApiCall]);
  
  /**
   * Обновление проекта
   */
  const updateProject = useCallback(async (projectId: string, updates: Partial<Project>) => {
    const result = await executeApiCall(() => javaApiService.updateProject(projectId, updates));
    if (result) {
      await loadProjects(); // Обновляем список
      if (currentProject?.id === projectId) {
        setCurrentProject({ ...currentProject, ...updates });
      }
    }
    return result;
  }, [executeApiCall, loadProjects, currentProject]);
  
  /**
   * Удаление проекта
   */
  const deleteProject = useCallback(async (projectId: string) => {
    const result = await executeApiCall(() => javaApiService.deleteProject(projectId));
    if (result) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
      }
    }
    return result;
  }, [executeApiCall, currentProject]);
  
  // Task operations
  
  /**
   * Загрузка задач проекта
   */
  const loadProjectTasks = useCallback(async (projectId: string) => {
    const result = await executeApiCall(() => javaApiService.getTasksByProject(projectId));
    if (result && Array.isArray(result)) {
      setTasks(result);
    }
    return result;
  }, [executeApiCall]);
  
  /**
   * Создание задачи
   */
  const createTask = useCallback(async (projectId: string, taskData: Omit<Task, 'id' | 'created' | 'updated'>) => {
    const result = await executeApiCall(() => javaApiService.createTask(projectId, taskData));
    if (result) {
      await loadProjectTasks(projectId); // Обновляем список задач
    }
    return result;
  }, [executeApiCall, loadProjectTasks]);
  
  // Resource operations
  
  /**
   * Загрузка всех ресурсов
   */
  const loadResources = useCallback(async () => {
    const result = await executeApiCall(() => javaApiService.getAllResources());
    if (result && Array.isArray(result)) {
      setResources(result);
    }
    return result;
  }, [executeApiCall]);
  
  /**
   * Создание ресурса
   */
  const createResource = useCallback(async (resourceData: Omit<Resource, 'id' | 'created' | 'updated'>) => {
    const result = await executeApiCall(() => javaApiService.createResource(resourceData));
    if (result) {
      await loadResources(); // Обновляем список ресурсов
    }
    return result;
  }, [executeApiCall, loadResources]);
  
  // Utility operations
  
  /**
   * Получение версии API
   */
  const getApiVersion = useCallback(async () => {
    return await executeApiCall(() => javaApiService.getVersion(), false);
  }, [executeApiCall]);
  
  /**
   * Экспорт проекта
   */
  const exportProject = useCallback(async (projectId: string, format: string = 'json') => {
    return await executeApiCall(() => javaApiService.exportProject(projectId, format));
  }, [executeApiCall]);
  
  /**
   * Импорт проекта
   */
  const importProject = useCallback(async (filePath: string) => {
    const result = await executeApiCall(() => javaApiService.importProject(filePath));
    if (result) {
      await loadProjects(); // Обновляем список проектов после импорта
    }
    return result;
  }, [executeApiCall, loadProjects]);
  
  // Автоматическая проверка доступности API
  useEffect(() => {
    if (javaStatus?.running) {
      checkApiAvailability();
    } else {
      setIsApiAvailable(false);
    }
  }, [javaStatus?.running, checkApiAvailability]);
  
  return {
    // Состояние
    isLoading,
    error,
    isApiAvailable,
    javaStatus,
    
    // Данные
    projects,
    currentProject,
    tasks,
    resources,
    
    // Project operations
    loadProjects,
    createProject,
    loadProject,
    updateProject,
    deleteProject,
    
    // Task operations
    loadProjectTasks,
    createTask,
    
    // Resource operations
    loadResources,
    createResource,
    
    // Utility operations
    checkApiAvailability,
    getApiVersion,
    exportProject,
    importProject,
    
    // API сервис для прямого доступа
    javaApiService
  };
};

export type UseJavaApiReturn = ReturnType<typeof useJavaApi>;

