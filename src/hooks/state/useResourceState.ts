import { useState, useCallback } from 'react'
import type { Resource } from '@/types'
import { ResourceUtils } from '@/utils/resource-utils'

/**
 * Хук для управления состоянием ресурсов
 * Следует принципу Single Responsibility
 */
export const useResourceState = () => {
  const [resources, setResources] = useState<Resource[]>([])

  /**
   * Добавление нового ресурса
   */
  const addResource = useCallback((newResource: Resource) => {
    setResources(prev => [...prev, newResource])
  }, [])

  /**
   * Обновление существующего ресурса
   */
  const updateResource = useCallback((
    id: string,
    updates: Partial<Resource>,
  ): Resource | undefined => {
    setResources(prev =>
      prev.map(resource =>
        resource.id === id ? { ...resource, ...updates } : resource,
      ),
    )

    return resources.find(resource => resource.id === id)
  }, [resources])

  /**
   * Удаление ресурса
   */
  const deleteResource = useCallback((id: string): boolean => {
    const exists = resources.some(resource => resource.id === id)
    if (exists) {
      setResources(prev => prev.filter(resource => resource.id !== id))
    }
    return exists
  }, [resources])

  /**
   * Поиск ресурса по ID
   */
  const findResource = useCallback((id: string): Resource | undefined => {
    return resources.find(resource => resource.id === id)
  }, [resources])

  /**
   * Валидация ресурса
   */
  const validateResource = useCallback((resource: Partial<Resource>): string | null => {
    return ResourceUtils.validateResource(resource)
  }, [])

  /**
   * Очистка всех ресурсов
   */
  const clearResources = useCallback(() => {
    setResources([])
  }, [])

  /**
   * Фильтрация ресурсов по типу
   */
  const getResourcesByType = useCallback((type: Resource['type']): Resource[] => {
    return resources.filter(resource => resource.type === type)
  }, [resources])

  /**
   * Расчет утилизации ресурсов
   */
  const calculateUtilization = useCallback((): number => {
    return ResourceUtils.calculateUtilization(resources)
  }, [resources])

  /**
   * Фильтрация доступных ресурсов
   */
  const getAvailableResources = useCallback((): Resource[] => {
    return resources.filter(resource => resource.available)
  }, [resources])

  /**
   * Обновление доступности ресурса
   */
  const setResourceAvailability = useCallback((
    id: string,
    available: boolean,
  ): boolean => {
    const resource = resources.find(r => r.id === id)
    if (!resource) return false

    updateResource(id, { available })
    return true
  }, [resources, updateResource])

  return {
    resources,
    setResources,
    addResource,
    updateResource,
    deleteResource,
    findResource,
    validateResource,
    clearResources,
    getResourcesByType,
    calculateUtilization,
    getAvailableResources,
    setResourceAvailability,
  }
}
