import { useCallback, useMemo } from 'react'

import { ProjectAPIClient } from '@/services'
import { stringToCatalogId, uiProjectPartialToCatalog } from '@/services/CatalogProjectMapper'
import type { APIClientConfig } from '@/services/BaseAPIClient'
import type { Project } from '@/types/project-types'
import { ExportFormat, type ID } from '@/types/Master_Functionality_Catalog'
import type { CaughtError } from '@/errors/CaughtError'
import { toCaughtError } from '@/errors/CaughtError'

/** Преобразует строковый формат экспорта в ExportFormat. */
function toExportFormat(format: 'xml' | 'xlsx' | 'pdf'): ExportFormat {
  const map: Record<'xml' | 'xlsx' | 'pdf', ExportFormat> = {
    xml: ExportFormat.XML,
    xlsx: ExportFormat.EXCEL,
    pdf: ExportFormat.PDF,
  }
  return map[format]
}

/**
 * React хук для работы с Project API.
 * Использует типы store (project-types); маппинг в Catalog выполняется на границе.
 */
export const useProjectAPI = (config?: APIClientConfig) => {
  const apiClient = useMemo(() => {
    return new ProjectAPIClient({
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

  return useMemo(() => ({
    getAllProjects: async () => {
      try {
        return await apiClient.getProjects()
      } catch (error) {
        throw handleError(toCaughtError(error), 'Failed to fetch projects')
      }
    },

    getProject: async (id: string | ID) => {
      const catalogId = typeof id === 'string' ? stringToCatalogId(id) : id
      try {
        return await apiClient.getProject(catalogId)
      } catch (error) {
        throw handleError(toCaughtError(error), `Failed to fetch project ${typeof id === 'string' ? id : (id as ID).value}`)
      }
    },

    createProject: async (project: Partial<Project>) => {
      try {
        return await apiClient.createProject(uiProjectPartialToCatalog(project))
      } catch (error) {
        throw handleError(toCaughtError(error), 'Failed to create project')
      }
    },

    updateProject: async (id: string | ID, project: Partial<Project>) => {
      const catalogId = typeof id === 'string' ? stringToCatalogId(id) : id
      try {
        return await apiClient.updateProject(catalogId, uiProjectPartialToCatalog(project))
      } catch (error) {
        throw handleError(toCaughtError(error), `Failed to update project ${typeof id === 'string' ? id : (id as ID).value}`)
      }
    },

    deleteProject: async (id: string | ID) => {
      const catalogId = typeof id === 'string' ? stringToCatalogId(id) : id
      try {
        await apiClient.deleteProject(catalogId)
      } catch (error) {
        throw handleError(toCaughtError(error), `Failed to delete project ${typeof id === 'string' ? id : (id as ID).value}`)
      }
    },

    exportProject: async (id: string | ID, format: 'xml' | 'xlsx' | 'pdf') => {
      const catalogId = typeof id === 'string' ? stringToCatalogId(id) : id
      try {
        return await apiClient.exportProject(catalogId, toExportFormat(format))
      } catch (error) {
        throw handleError(toCaughtError(error), `Failed to export project ${typeof id === 'string' ? id : (id as ID).value}`)
      }
    },
  }), [apiClient, handleError])
}

