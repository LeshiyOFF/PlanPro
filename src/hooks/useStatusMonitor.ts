import { useState, useEffect, useCallback } from 'react'
import { useIpcService } from './useIpcService'
import { useJavaApi } from './useJavaApi'

interface DetailedStatus {
  running: boolean;
  status: string;
  pid?: number;
  port?: number;
  version?: string;
  memoryUsage?: number;
  uptime?: number;
  activeConnections?: number;
  lastRestart?: Date;
}

interface StatusHistory {
  timestamp: Date;
  status: DetailedStatus;
}

/**
 * Hook для реального мониторинга статуса Java бэкенда
 */
export const useStatusMonitor = (refreshInterval: number = 5000) => {
  const { javaStatus, getJavaStatus } = useIpcService()
  const { isApiAvailable, checkApiAvailability } = useJavaApi()

  const [detailedStatus, setDetailedStatus] = useState<DetailedStatus | null>(null)
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [monitoringErrors, setMonitoringErrors] = useState<string[]>([])

  /**
   * Получение детального статуса
   */
  const refreshStatus = useCallback(async () => {
    if (!javaStatus?.running) {
      setDetailedStatus(null)
      return
    }

    try {
      const response = await getJavaStatus()

      if (response.success && response.data) {
        const statusData: DetailedStatus = {
          ...response.data,
          lastRestart: response.data.lastRestart ? new Date(response.data.lastRestart) : undefined,
        }

        setDetailedStatus(statusData)
        setLastUpdate(new Date())

        // Добавляем в историю (максимум 50 записей)
        setStatusHistory(prev => [
          { timestamp: new Date(), status: statusData },
          ...prev.slice(0, 49),
        ])

        // Очищаем ошибки при успешном обновлении
        setMonitoringErrors([])
      } else {
        const errorMsg = response.error || 'Failed to get status'
        setMonitoringErrors(prev => [...prev.slice(-4), errorMsg])
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred'
      setMonitoringErrors(prev => [...prev.slice(-4), errorMsg])
    }
  }, [javaStatus?.running, getJavaStatus])

  /**
   * Запуск мониторинга
   */
  const startMonitoring = useCallback(() => {
    if (isMonitoring || !javaStatus?.running) return

    setIsMonitoring(true)

    // Первоначальное получение статуса
    refreshStatus()

    // Проверка доступности API
    if (javaStatus?.running) {
      checkApiAvailability()
    }
  }, [isMonitoring, javaStatus?.running, refreshStatus, checkApiAvailability])

  /**
   * Остановка мониторинга
   */
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
  }, [])

  /**
   * Автоматический мониторинг при изменении статуса Java
   */
  useEffect(() => {
    if (javaStatus?.running && !isMonitoring) {
      startMonitoring()
    } else if (!javaStatus?.running && isMonitoring) {
      stopMonitoring()
    }
  }, [javaStatus?.running, isMonitoring, startMonitoring, stopMonitoring])

  /**
   * Периодическое обновление статуса
   */
  useEffect(() => {
    if (!isMonitoring || refreshInterval <= 0) return

    const interval = setInterval(() => {
      refreshStatus()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [isMonitoring, refreshInterval, refreshStatus])

  /**
   * Получение статистики из истории
   */
  const getStatistics = useCallback(() => {
    if (statusHistory.length === 0) return null

    const recentHistory = statusHistory.slice(0, 10) // Последние 10 записей
    const uptimeEntries = recentHistory.filter(h => h.status.uptime !== undefined)
    const memoryEntries = recentHistory.filter(h => h.status.memoryUsage !== undefined)

    return {
      averageUptime: uptimeEntries.length > 0
        ? uptimeEntries.reduce((sum, h) => sum + (h.status.uptime || 0), 0) / uptimeEntries.length
        : null,
      maxMemoryUsage: memoryEntries.length > 0
        ? Math.max(...memoryEntries.map(h => h.status.memoryUsage || 0))
        : null,
      averageMemoryUsage: memoryEntries.length > 0
        ? memoryEntries.reduce((sum, h) => sum + (h.status.memoryUsage || 0), 0) / memoryEntries.length
        : null,
      totalChecks: statusHistory.length,
      errorRate: monitoringErrors.length / Math.max(statusHistory.length, 1) * 100,
    }
  }, [statusHistory, monitoringErrors])

  /**
   * Очистка истории и ошибок
   */
  const clearHistory = useCallback(() => {
    setStatusHistory([])
    setMonitoringErrors([])
  }, [])

  return {
    // Текущий статус
    detailedStatus,
    isMonitoring,
    lastUpdate,

    // История и статистика
    statusHistory,
    monitoringErrors,
    getStatistics,

    // Управление
    refreshStatus,
    startMonitoring,
    stopMonitoring,
    clearHistory,

    // Флаги
    hasErrors: monitoringErrors.length > 0,
    isHealthy: detailedStatus?.running && isApiAvailable && monitoringErrors.length === 0,
  }
}

