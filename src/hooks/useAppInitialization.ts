import React, { useEffect, useCallback } from 'react'
import { PerformanceMetricsCollector } from '@/providers/ReactProfilerProvider'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useSentry } from '@/providers/SentryProvider'
import { logger } from '@/utils/logger'
import { RecalculationEngine } from '@/services/RecalculationEngine'
import { useIpcService } from '@/hooks/useIpcService'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useProjectLibreAPI } from '@/hooks/useProjectLibreAPI'
import { useProjectStore } from '@/store/projectStore'
import { TaskDataConverter } from '@/services/TaskDataConverter'
import { ResourceDataConverter } from '@/services/ResourceDataConverter'
import { ProjectAutoSaveService } from '@/services/ProjectAutoSaveService'

/**
 * Хук для инициализации системных сервисов приложения
 */
export const useAppInitialization = () => {
  const { handleError } = useErrorHandler()
  const { captureError } = useSentry()
  const ipcService = useIpcService()
  const { file } = useProjectLibreAPI()

  // Инициализация автосохранения
  useAutoSave()

  // Регистрация sync с Core для автосохранения (возвращает resourceIdMapping)
  useEffect(() => {
    if (!file?.syncProjectToCore) return
    const syncFn = async () => {
      const state = useProjectStore.getState()
      if (state.currentProjectId == null || state.currentProjectId < 0) return null
      return file.syncProjectToCore({
        projectId: state.currentProjectId,
        tasks: TaskDataConverter.frontendTasksToSync(state.tasks),
        resources: ResourceDataConverter.frontendResourcesToSync(state.resources, state.calendars),
        projectCalendars: ResourceDataConverter.calendarsToSyncData(state.calendars),
      })
    }
    ProjectAutoSaveService.getInstance().setSyncProjectToCoreFn(syncFn)
    return () => ProjectAutoSaveService.getInstance().setSyncProjectToCoreFn(undefined)
  }, [file])

  // Инициализация Profiler и Metrics Collector
  useEffect(() => {
    const metricsCollector = PerformanceMetricsCollector.getInstance({
      enabled: process.env.NODE_ENV === 'development',
      collectInterval: 30000,
      maxHistorySize: 100,
      performanceThresholds: {
        renderTime: 16,
        memoryUsage: 100,
        score: 80,
      },
    })

    metricsCollector.start()
    return () => metricsCollector.stop()
  }, [])

  // Инициализация движка пересчета и Java событий
  useEffect(() => {
    RecalculationEngine.getInstance()

    const initializeJavaEvents = async () => {
      try {
        await ipcService.subscribeToJavaEvents()
        logger.info('Subscribed to Java events via IPC service')
      } catch (error) {
        logger.error('Failed to subscribe to Java events:', {
          message: error instanceof Error ? error.message : String(error),
        })
      }
    }

    initializeJavaEvents()
  }, [ipcService])

  const handleGlobalError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    handleError(error, 'App Root')
    captureError(error, {
      component: 'App',
      errorBoundary: true,
      errorInfo,
    })
  }, [handleError, captureError])

  return { handleGlobalError }
}

