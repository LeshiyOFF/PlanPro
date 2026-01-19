import { useCallback, useMemo } from 'react'

// API клиенты и типы
import { ResourceAPIClient } from '@/services'
import type { 
  Resource, 
  ID,
  ResourceAPI,
  APIClientConfig 
} from '@/types'

/**
 * React хук для работы с Resource API
 * Следует SOLID принципам
 */
export const useResourceAPI = (config?: APIClientConfig) => {
  const apiClient = useMemo(() => {
    return new ResourceAPIClient({
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
     * Получение всех ресурсов проекта
     */
    getAll: async (projectId: ID) => {
      try {
        return await apiClient.getResources(projectId);
      } catch (error) {
        throw handleError(error, `Failed to fetch resources for project ${projectId.value}`);
      }
    },

    /**
     * Получение ресурса по ID
     */
    getById: async (id: ID) => {
      try {
        return await apiClient.getResource(id);
      } catch (error) {
        throw handleError(error, `Failed to fetch resource ${id.value}`);
      }
    },

    /**
     * Создание ресурса
     */
    create: async (resource: Partial<Resource>) => {
      try {
        return await apiClient.createResource(resource);
      } catch (error) {
        throw handleError(error, 'Failed to create resource');
      }
    },

    /**
     * Обновление ресурса
     */
    update: async (id: ID, resource: Partial<Resource>) => {
      try {
        return await apiClient.updateResource(id, resource);
      } catch (error) {
        throw handleError(error, `Failed to update resource ${id.value}`);
      }
    },

    /**
     * Удаление ресурса
     */
    delete: async (id: ID) => {
      try {
        await apiClient.deleteResource(id);
      } catch (error) {
        throw handleError(error, `Failed to delete resource ${id.value}`);
      }
    }
  }), [apiClient, handleError]);
}
