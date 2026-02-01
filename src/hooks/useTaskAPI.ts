import { useCallback, useMemo } from 'react'

import { TaskAPIClient } from '@/services'
import { stringToCatalogTaskId, uiTaskPartialToCatalog } from '@/services/CatalogTaskMapper'
import type { APIClientConfig } from '@/services/BaseAPIClient'
import type { Task } from '@/types/task-types'
import type { ID } from '@/types/Master_Functionality_Catalog'
import type { CaughtError } from '@/errors/CaughtError'
import { toCaughtError } from '@/errors/CaughtError'

/**
 * React хук для работы с Task API.
 * Использует типы store (task-types); маппинг в Catalog выполняется на границе.
 */
export const useTaskAPI = (config?: APIClientConfig) => {
  const apiClient = useMemo(() => {
    return new TaskAPIClient({
      timeout: 5000,
      retryAttempts: 3,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ...config,
    })
  }, [config])

  const handleError = useCallback((error: CaughtError, context: string) => {
    console.error(`${context}:`, error)
    return { message: error.message, code: 'API_ERROR', context }
  }, [])

  const toId = (id: string | ID): ID =>
    typeof id === 'string' ? stringToCatalogTaskId(id) : id

  return useMemo(() => ({
    getAll: async (projectId: string | ID) => {
      try {
        return await apiClient.getTasks(toId(projectId))
      } catch (error) {
        throw handleError(toCaughtError(error), 'Failed to fetch tasks for project')
      }
    },

    getById: async (id: string | ID) => {
      try {
        return await apiClient.getTask(toId(id))
      } catch (error) {
        throw handleError(toCaughtError(error), 'Failed to fetch task')
      }
    },

    create: async (task: Partial<Task>) => {
      try {
        return await apiClient.createTask(uiTaskPartialToCatalog(task))
      } catch (error) {
        throw handleError(toCaughtError(error), 'Failed to create task')
      }
    },

    update: async (id: string | ID, task: Partial<Task>) => {
      try {
        return await apiClient.updateTask(toId(id), uiTaskPartialToCatalog(task))
      } catch (error) {
        throw handleError(toCaughtError(error), 'Failed to update task')
      }
    },

    delete: async (id: string | ID) => {
      try {
        await apiClient.deleteTask(toId(id))
      } catch (error) {
        throw handleError(toCaughtError(error), 'Failed to delete task')
      }
    },
  }), [apiClient, handleError])
}

