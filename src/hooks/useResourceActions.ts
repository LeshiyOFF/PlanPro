import { useCallback } from 'react'
import type { Resource } from '@/types'
import { useProjectState } from './useProjectState'
import { useAsyncOperation } from './useAsyncOperation'
import { ResourceUtils } from '@/utils/resource-utils'
import { logger } from '@/utils/logger'
import { useAppStore } from '@/store/appStore'
import { ResourceFactory } from '@/domain/resources/ResourceFactory'

/**
 * Хук для действий с ресурсами
 */
export const useResourceActions = (execute: ReturnType<typeof useAsyncOperation>['execute']) => {
  const { addResourceUpdater, updateResourceUpdater, deleteResourceUpdater } = useProjectState()
  const preferences = useAppStore((state) => state.preferences)

  const addResource = addResourceUpdater()
  const updateResource = updateResourceUpdater()
  const deleteResource = deleteResourceUpdater()

  /**
   * Создание нового ресурса
   */
  const createResource = useCallback(async (
    resourceData: Omit<Resource, 'id'>,
  ): Promise<Resource> => {
    const validateResult = ResourceUtils.validateResource(resourceData)
    if (validateResult) {
      throw new Error(validateResult)
    }

    const newResource = ResourceFactory.createResource(resourceData, preferences)

    await execute(
      async () => {
        addResource(newResource)
        logger.info('Ресурс создан', {
          resourceId: newResource.id,
          resourceName: newResource.name,
        })
        return newResource
      },
      'Не удалось создать ресурс',
    )

    return newResource
  }, [addResource, execute, preferences])

  /**
   * Обновление ресурса
   */
  const editResource = useCallback(async (
    id: string,
    updates: Partial<Resource>,
  ): Promise<Resource> => {
    const validateResult = ResourceUtils.validateResource(updates)
    if (validateResult) {
      throw new Error(validateResult)
    }

    await execute(
      async () => {
        const updatedResource = updateResource(id, updates)
        if (!updatedResource) {
          throw new Error('Ресурс не найден')
        }

        logger.info('Ресурс обновлен', {
          resourceId: id,
          updates: Object.keys(updates),
        })

        return updatedResource
      },
      'Не удалось обновить ресурс',
    )

    const updated = updateResource(id, updates)
    if (!updated) {
      throw new Error('Ресурс не найден')
    }
    return updated
  }, [updateResource, execute])

  /**
   * Удаление ресурса
   */
  const removeResource = useCallback(async (id: string): Promise<void> => {
    await execute(
      async () => {
        const success = deleteResource(id)
        if (!success) {
          throw new Error('Ресурс не найден')
        }

        logger.info('Ресурс удален', { resourceId: id })
      },
      'Не удалось удалить ресурс',
    )
  }, [deleteResource, execute])

  return {
    createResource,
    editResource,
    removeResource,
  }
}
