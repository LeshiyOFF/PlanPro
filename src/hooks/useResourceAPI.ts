import { useCallback, useMemo } from 'react'

import { ResourceAPIClient } from '@/services'
import { stringToCatalogId, uiResourcePartialToCatalog } from '@/services/CatalogResourceMapper'
import type { APIClientConfig } from '@/services/BaseAPIClient'
import type { Resource } from '@/types/resource-types'
import type { ID } from '@/types/Master_Functionality_Catalog'
import type { CaughtError } from '@/errors/CaughtError'
import { toCaughtError } from '@/errors/CaughtError'

/**
 * React хук для работы с Resource API.
 * Использует типы store (resource-types); маппинг в Catalog выполняется на границе.
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

  const handleError = useCallback((error: CaughtError, context: string) => {
    console.error(`${context}:`, error);
    return { message: error.message, code: 'API_ERROR', context };
  }, []);

  const toId = (id: string | ID): ID =>
    typeof id === 'string' ? stringToCatalogId(id) : id;

  return useMemo(() => ({
    getAll: async (projectId: string | ID) => {
      try {
        return await apiClient.getResources(toId(projectId));
      } catch (error) {
        throw handleError(toCaughtError(error), 'Failed to fetch resources for project');
      }
    },

    getById: async (id: string | ID) => {
      try {
        return await apiClient.getResource(toId(id));
      } catch (error) {
        throw handleError(toCaughtError(error), 'Failed to fetch resource');
      }
    },

    create: async (resource: Partial<Resource>) => {
      try {
        return await apiClient.createResource(uiResourcePartialToCatalog(resource));
      } catch (error) {
        throw handleError(toCaughtError(error), 'Failed to create resource');
      }
    },

    update: async (id: string | ID, resource: Partial<Resource>) => {
      try {
        return await apiClient.updateResource(toId(id), uiResourcePartialToCatalog(resource));
      } catch (error) {
        throw handleError(toCaughtError(error), 'Failed to update resource');
      }
    },

    delete: async (id: string | ID) => {
      try {
        await apiClient.deleteResource(toId(id));
      } catch (error) {
        throw handleError(toCaughtError(error), 'Failed to delete resource');
      }
    }
  }), [apiClient, handleError]);
}

