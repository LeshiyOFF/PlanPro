import { useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Resource } from '@/types/resource-types'
import { Task, getTaskResourceIds } from '@/store/project/interfaces'
import { IResourceUsage } from '@/domain/sheets/entities/IResourceUsage'

/** Базовая загрузка: 100% = полная занятость ресурса */
const BASE_CAPACITY = 1.0

/** Тип функции перевода */
type TranslationFn = (key: string) => string

/** Результат расчёта нагрузки: сумма назначений и загрузка относительно мощности */
export interface ResourceLoadResult {
  /** Сумма units по всем назначениям (0.5 = 50%, 2.5 = 250%). Для колонки «Назначено %». */
  totalUnits: number
  /** Загрузка относительно maxUnits (1 = 100%, >1 = перегрузка). Для статуса и блоков. */
  loadPercent: number
}

/**
 * Вычисляет суммарные назначения (totalUnits) и загрузку относительно мощности (loadPercent).
 * Один проход по задачам, одна формула — без дублирования логики.
 *
 * @param resource - Ресурс
 * @param tasks - Задачи проекта
 * @returns totalUnits для отображения «Назначено %», loadPercent для статуса/перегрузки
 */
function calculateResourceLoad(
  resource: Resource,
  tasks: Task[],
): ResourceLoadResult {
  let totalUnits = 0
  const resourceIdStr = String(resource.id)

  for (const task of tasks) {
    if (task.isSummary) continue
    const assignment = task.resourceAssignments?.find(
      (a) => String(a.resourceId) === resourceIdStr,
    )
    if (assignment) {
      totalUnits += assignment.units
    } else if (getTaskResourceIds(task).includes(resourceIdStr)) {
      totalUnits += BASE_CAPACITY
    }
  }

  const rawMax = resource.maxUnits ?? BASE_CAPACITY
  const effectiveMaxUnits = rawMax > 10 ? rawMax / 100 : rawMax
  const loadPercent =
    effectiveMaxUnits > 0 ? totalUnits / effectiveMaxUnits : 0

  return { totalUnits, loadPercent }
}

/**
 * Статус по загрузке относительно мощности (согласовано со сводкой).
 */
const getResourceStatus = (loadPercent: number, t: TranslationFn): string => {
  if (loadPercent === 0) return t('sheets.status_available')
  if (loadPercent > BASE_CAPACITY) return t('sheets.status_overloaded')
  if (loadPercent < BASE_CAPACITY) return t('sheets.status_partial')
  return t('sheets.status_busy')
}

/**
 * Уровень нагрузки (перегрузка / норма).
 */
const getWorkloadLevel = (loadPercent: number, t: TranslationFn): string => {
  if (loadPercent > BASE_CAPACITY) return t('sheets.workload_overload')
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
    (loadPercent: number) => getResourceStatus(loadPercent, t),
    [t],
  )

  const formatWorkload = useCallback(
    (loadPercent: number) => getWorkloadLevel(loadPercent, t),
    [t],
  )

  return useMemo(() => {
    return resources.map((resource) => {
      const { totalUnits, loadPercent } = calculateResourceLoad(resource, tasks)
      const assignedPercent = totalUnits
      const availablePercent = Math.max(
        0,
        BASE_CAPACITY - Math.min(totalUnits, BASE_CAPACITY),
      )

      return {
        id: resource.id,
        resourceName: resource.name,
        assignedPercent,
        availablePercent,
        status: formatStatus(loadPercent),
        workload: formatWorkload(loadPercent),
        actualHours: 0,
        plannedHours: 0,
        variance: 0,
      }
    })
  }, [resources, tasks, formatStatus, formatWorkload])
}
