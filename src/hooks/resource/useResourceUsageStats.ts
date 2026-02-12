import { useMemo } from 'react'
import { Resource } from '@/types/resource-types'
import { Task, getTaskResourceIds } from '@/store/project/interfaces'

/** Базовая загрузка: 100% = полная занятость ресурса */
const BASE_CAPACITY = 1.0

/**
 * Интерфейс статистики использования ресурсов.
 * Занято и Перегрузка не взаимоисключающие: перегруженный ресурс учитывается в обоих блоках.
 */
export interface ResourceUsageStats {
  /** Количество доступных ресурсов (загрузка = 0%, нет назначений) */
  available: number;
  /** Количество занятых ресурсов (хотя бы одно назначение на любой процент) */
  busy: number;
  /** Количество перегруженных ресурсов (загрузка > 100% от мощности) */
  overloaded: number;
}

/**
 * Вычисляет суммарный процент загрузки ресурса из всех назначений.
 * Учитывает maxUnits ресурса для определения реальной перегрузки.
 *
 * @param resource Ресурс для расчёта
 * @param tasks Массив задач проекта
 * @returns Загрузка относительно maxUnits (1.0 = 100% от возможностей)
 */
const calculateResourceLoad = (resource: Resource, tasks: Task[]): number => {
  let totalUnits = 0
  const resourceIdStr = String(resource.id)

  for (const task of tasks) {
    if (task.isSummary) continue
    const assignment = task.resourceAssignments?.find(a => String(a.resourceId) === resourceIdStr)
    if (assignment) {
      totalUnits += assignment.units
    } else if (getTaskResourceIds(task).includes(resourceIdStr)) {
      // Fallback: старый формат resourceIds (100% по умолчанию)
      totalUnits += BASE_CAPACITY
    }
  }

  // Нормализуем по maxUnits ресурса (поддержка шкалы 0–1 и 0–100)
  const rawMax = resource.maxUnits ?? BASE_CAPACITY
  const effectiveMaxUnits = rawMax > 10 ? rawMax / 100 : rawMax
  return effectiveMaxUnits > 0 ? totalUnits / effectiveMaxUnits : 0
}

/**
 * Хук для вычисления статистики использования ресурсов.
 *
 * Занято: ресурс с хотя бы одним назначением (loadPercent > 0).
 * Перегрузка: ресурс с загрузкой > 100% (loadPercent > 1).
 * Перегруженный ресурс учитывается и в Занято, и в Перегрузка.
 */
export const useResourceUsageStats = (
  resources: Resource[],
  tasks: Task[],
): ResourceUsageStats => {
  return useMemo(() => {
    let available = 0
    let busy = 0
    let overloaded = 0

    resources.forEach(resource => {
      const loadPercent = calculateResourceLoad(resource, tasks)

      if (loadPercent > BASE_CAPACITY) {
        overloaded++
      }
      if (loadPercent > 0) {
        busy++
      } else {
        available++
      }
    })

    return { available, busy, overloaded }
  }, [resources, tasks])
}
