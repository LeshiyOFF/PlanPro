import { useMemo, useCallback } from 'react'
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences'
import { TaskEstimationService } from '@/services/task/TaskEstimationService'
import { Task } from '@/store/projectStore'

/**
 * useTaskEstimation - Хук для управления визуализацией оценочных сроков.
 * Связывает TaskEstimationService с текущим состоянием настроек.
 */
export const useTaskEstimation = () => {
  const { preferences } = useUserPreferences()
  const estimationService = useMemo(() => new TaskEstimationService(), [])

  /**
   * Проверка необходимости показа индикатора для задачи
   */
  const shouldShowEstimation = useCallback((task: Task) => {
    return estimationService.shouldShowEstimation(task, preferences)
  }, [estimationService, preferences])

  /**
   * Получение форматированного имени задачи
   */
  const getFormattedName = useCallback((task: Task) => {
    return estimationService.getFormattedName(task, preferences)
  }, [estimationService, preferences])

  /**
   * Форматирование произвольного строкового значения (длительности и т.д.)
   */
  const formatValue = useCallback((value: string, task: Task) => {
    return estimationService.formatValueWithEstimation(value, task, preferences)
  }, [estimationService, preferences])

  return {
    shouldShowEstimation,
    getFormattedName,
    formatValue,
  }
}

