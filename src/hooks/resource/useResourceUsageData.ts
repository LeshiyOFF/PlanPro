import { useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Resource } from '@/types/resource-types'
import { Task, getTaskResourceIds } from '@/store/project/interfaces'
import { IResourceUsage } from '@/domain/sheets/entities/IResourceUsage'

/** Базовая загрузка: 100% = полная занятость ресурса */
const BASE_CAPACITY = 1.0

/** Тип функции перевода */
type TranslationFn = (key: string) => string;

/**
 * Вычисляет суммарный процент загрузки ресурса из всех назначений.
 * Поддерживает обратную совместимость: resourceAssignments и устаревший resourceIds.
 * @param resource - Ресурс для которого вычисляется загрузка
 * @param tasks - Массив задач проекта
 * @returns Суммарная загрузка ресурса (0-N, где 1 = 100%)
 */
const calculateAssignedPercent = (resource: Resource, tasks: Task[]): number => {
  let totalUnits = 0

  for (const task of tasks) {
    // Приоритет: новый формат resourceAssignments
    const assignment = task.resourceAssignments?.find(a => a.resourceId === resource.id)
    if (assignment) {
      totalUnits += assignment.units
    } else if (getTaskResourceIds(task).includes(String(resource.id))) {
      // Fallback: старый формат resourceIds (100% по умолчанию)
      totalUnits += BASE_CAPACITY
    }
  }

  return totalUnits
}

/**
 * Определяет статус ресурса на основе загрузки относительно 100%
 * @param assignedPercent - Процент загрузки (0-N)
 * @param t - Функция локализации
 */
const getResourceStatus = (assignedPercent: number, t: TranslationFn): string => {
  if (assignedPercent === 0) return t('sheets.status_available')
  if (assignedPercent < BASE_CAPACITY) return t('sheets.status_partial')
  if (assignedPercent === BASE_CAPACITY) return t('sheets.status_busy')
  return t('sheets.status_overloaded')
}

/**
 * Определяет уровень нагрузки ресурса
 * @param assignedPercent - Процент загрузки (0-N)
 * @param t - Функция локализации
 */
const getWorkloadLevel = (assignedPercent: number, t: TranslationFn): string => {
  if (assignedPercent > BASE_CAPACITY) return t('sheets.workload_overload')
  return t('sheets.workload_normal')
}

/**
 * Хук для преобразования ресурсов в формат IResourceUsage.
 * Использует реальные units из resourceAssignments.
 * @param resources - Массив ресурсов проекта
 * @param tasks - Массив задач проекта
 * @returns Массив данных для отображения в таблице использования
 */
export const useResourceUsageData = (
  resources: Resource[],
  tasks: Task[],
): IResourceUsage[] => {
  const { t } = useTranslation()

  // Мемоизируем функции форматирования для стабильности
  const formatStatus = useCallback(
    (assignedPercent: number) => getResourceStatus(assignedPercent, t),
    [t],
  )

  const formatWorkload = useCallback(
    (assignedPercent: number) => getWorkloadLevel(assignedPercent, t),
    [t],
  )

  return useMemo(() => {
    return resources.map(resource => {
      const assignedPercent = calculateAssignedPercent(resource, tasks)
      const availablePercent = Math.max(0, BASE_CAPACITY - assignedPercent)

      return {
        id: resource.id,
        resourceName: resource.name,
        assignedPercent,
        availablePercent,
        status: formatStatus(assignedPercent),
        workload: formatWorkload(assignedPercent),
      }
    })
  }, [resources, tasks, formatStatus, formatWorkload])
}
