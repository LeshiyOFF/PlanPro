import { useCallback, useMemo } from 'react'

// API клиенты и типы
import { ProjectAPIClient } from '@/services'
import type { 
  Project, 
  ID,
  ProjectAPI,
  APIClientConfig 
} from '@/types'

/**
 * React хук для работы с Project API
 * Следует SOLID принципам
 */
export const useProjectAPI = (config?: APIClientConfig) => {
  const apiClient = useMemo(() => {
    return new ProjectAPIClient({
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
     * Получение всех проектов
     */
    getAllProjects: async () => {
      try {
        return await apiClient.getProjects();
      } catch (error) {
        throw handleError(error, 'Failed to fetch projects');
      }
    },

    /**
     * Получение проекта по ID
     */
    getProject: async (id: ID) => {
      try {
        return await apiClient.getProject(id);
      } catch (error) {
        throw handleError(error, `Failed to fetch project ${id.value}`);
      }
    },

    /**
     * Создание проекта
     */
    createProject: async (project: Partial<Project>) => {
      try {
        return await apiClient.createProject(project);
      } catch (error) {
        throw handleError(error, 'Failed to create project');
      }
    },

    /**
     * Обновление проекта
     */
    updateProject: async (id: ID, project: Partial<Project>) => {
      try {
        return await apiClient.updateProject(id, project);
      } catch (error) {
        throw handleError(error, `Failed to update project ${id.value}`);
      }
    },

    /**
     * Удаление проекта
     */
    deleteProject: async (id: ID) => {
      try {
        await apiClient.deleteProject(id);
      } catch (error) {
        throw handleError(error, `Failed to delete project ${id.value}`);
      }
    },

    /**
     * Экспорт проекта
     */
    exportProject: async (id: ID, format: 'xml' | 'xlsx' | 'pdf') => {
      try {
        return await apiClient.exportProject(id, format);
      } catch (error) {
        throw handleError(error, `Failed to export project ${id.value}`);
      }
    }
  }), [apiClient, handleError]);
}
