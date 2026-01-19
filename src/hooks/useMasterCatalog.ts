import { useCallback, useMemo } from 'react'

// Master Functionality Catalog типы и сервисы
import { ViewType, EventType } from '@/types'
import type {
  View,
  UIEvent
} from '@/types'

import { useMasterCatalogValidation } from './useMasterCatalogValidation'
import { useMasterCatalogUtils } from './useMasterCatalogUtils'

/**
 * Основной React хук для работы с Master Functionality Catalog
 * Комбинирует валидацию и утилиты, следуя SOLID принципам
 */
export const useMasterCatalog = () => {
  // Используем разделенные хуки
  const { validateProject, validateTask, validateResource } = useMasterCatalogValidation()
  const { 
    dateUtils, 
    durationUtils, 
    filterTasksByStatus, 
    filterResourcesByType, 
    getTaskDependencies, 
    isCriticalPathTask 
  } = useMasterCatalogUtils()

  /**
   * Создание UI события
   */
  const createUIEvent = useCallback((
    type: EventType,
    source: string,
    data?: any
  ): UIEvent => {
    return {
      type,
      source,
      timestamp: new Date(),
      data,
      preventDefault: false,
      stopPropagation: false
    }
  }, [])

  /**
   * Создание представления по умолчанию
   */
  const createDefaultView = useCallback((type: ViewType): View => {
    const now = new Date()
    return {
      id: { value: Date.now(), type: 'view' },
      name: getDefaultViewName(type),
      type,
      configuration: {
        scale: {
          unit: 'days' as const,
          count: 30,
          zoomLevel: 100,
          showNonWorkingTime: true,
          showWeekNumbers: true,
          fiscalYearStart: 1
        },
        filters: [],
        groups: [],
        sorts: []
      },
      isVisible: true,
      isActive: false
    }
  }, [])

  /**
   * Получение названия представления по умолчанию
   */
  const getDefaultViewName = useCallback((type: ViewType): string => {
    switch (type) {
      case ViewType.GANTT:
        return 'Диаграмма Ганта'
      case ViewType.TASK_SHEET:
        return 'Таблица задач'
      case ViewType.RESOURCE_SHEET:
        return 'Таблица ресурсов'
      case ViewType.NETWORK:
        return 'Сетевая диаграмма'
      case ViewType.CALENDAR:
        return 'Календарь'
      case ViewType.RESOURCE_USAGE:
        return 'Использование ресурсов'
      case ViewType.TASK_USAGE:
        return 'Использование задач'
      default:
        return 'Новое представление'
    }
  }, [])

  return useMemo(() => ({
    // Валидация
    validateProject,
    validateTask,
    validateResource,
    
    // Работа с сущностями
    filterTasksByStatus,
    filterResourcesByType,
    getTaskDependencies,
    isCriticalPathTask,
    
    // Утилиты
    dateUtils,
    durationUtils,
    
    // Представления
    createDefaultView,
    getDefaultViewName,
    
    // Создание событий
    createUIEvent
  }), [
    validateProject,
    validateTask,
    validateResource,
    filterTasksByStatus,
    filterResourcesByType,
    getTaskDependencies,
    isCriticalPathTask,
    dateUtils,
    durationUtils,
    createDefaultView,
    getDefaultViewName,
    createUIEvent
  ])
}

