import { useCallback, useMemo } from 'react'

// API клиенты и типы
import { useProjectAPI } from './useProjectAPI'
import { useTaskAPI } from './useTaskAPI'
import { useResourceAPI } from './useResourceAPI'
import { useFileAPI } from './useFileAPI'
import type { APIClientConfig } from '@/types'

import { EnvironmentConfig } from '@/config/EnvironmentConfig'

/**
 * Конфигурация для API клиентов
 */
interface UseAPIConfig extends APIClientConfig {
  projectAPI?: Partial<APIClientConfig>
  taskAPI?: Partial<APIClientConfig>
  resourceAPI?: Partial<APIClientConfig>
  fileAPI?: Partial<APIClientConfig>
}

/**
 * Комбинированный React хук для работы с ProjectLibre API
 * Предоставляет все типизированные клиенты из Master Functionality Catalog
 * Следует SOLID принципам
 */
export const useProjectLibreAPI = (config?: UseAPIConfig) => {
  const defaultBaseUrl = `${EnvironmentConfig.getApiBaseUrl()}/api`;

  // Получение отдельных API клиентов
  const projects = useProjectAPI({
    ...config?.projectAPI,
    baseURL: config?.projectAPI?.baseURL || config?.baseURL || defaultBaseUrl,
    timeout: config?.timeout || 5000
  });

  const tasks = useTaskAPI({
    ...config?.taskAPI,
    baseURL: config?.taskAPI?.baseURL || config?.baseURL || defaultBaseUrl,
    timeout: config?.timeout || 5000
  });

  const resources = useResourceAPI({
    ...config?.resourceAPI,
    baseURL: config?.resourceAPI?.baseURL || config?.baseURL || defaultBaseUrl,
    timeout: config?.timeout || 5000
  });

  const file = useFileAPI({
    ...config?.fileAPI,
    baseURL: config?.fileAPI?.baseURL || config?.baseURL || defaultBaseUrl,
    timeout: config?.timeout || 10000
  });

  return useMemo(() => ({
    projects,
    tasks,
    resources,
    file
  }), [projects, tasks, resources, file]);
}

