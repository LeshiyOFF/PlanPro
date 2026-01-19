import { useCallback, useMemo } from 'react'

// API клиенты и типы
import { TaskAPIClient } from '@/services'
import type { 
  Task, 
  ID,
  TaskAPI,
  APIClientConfig 
} from '@/types'

/**
 * React хук для работы с Task API
 * Следует SOLID принципам
 */
export const useTaskAPI = (config?: APIClientConfig) => {
  const apiClient = useMemo(() => {
    return new TaskAPIClient({
      timeout: 5000,
      retryAttempts: 3,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...config
    });
  }, [config]);

  const handleError = useCallback((error: unknown, context: string) => {
    console.error(`${context}:`, error);
    
    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'API_ERROR',
        context
      };
    }

    return {
      message: 'Unknown error occurred',
      code: 'UNKNOWN_ERROR',
      context
    };
  }, []);

  return useMemo(() => ({
    /**
     * Получение всех задач проекта
     */
    getAll: async (projectId: ID) => {
      try {
        return await apiClient.getTasks(projectId);
      } catch (error) {
        throw handleError(error, `Failed to fetch tasks for project ${projectId.value}`);
      }
    },

    /**
     * Получение задачи по ID
     */
    getById: async (id: ID) => {
      try {
        return await apiClient.getTask(id);
      } catch (error) {
        throw handleError(error, `Failed to fetch task ${id.value}`);
      }
    },

    /**
     * Создание задачи
     */
    create: async (task: Partial<Task>) => {
      try {
        return await apiClient.createTask(task);
      } catch (error) {
        throw handleError(error, 'Failed to create task');
      }
    },

    /**
     * Обновление задачи
     */
    update: async (id: ID, task: Partial<Task>) => {
      try {
        return await apiClient.updateTask(id, task);
      } catch (error) {
        throw handleError(error, `Failed to update task ${id.value}`);
      }
    },

    /**
     * Удаление задачи
     */
    delete: async (id: ID) => {
      try {
        await apiClient.deleteTask(id);
      } catch (error) {
        throw handleError(error, `Failed to delete task ${id.value}`);
      }
    }
  }), [apiClient, handleError]);
}

