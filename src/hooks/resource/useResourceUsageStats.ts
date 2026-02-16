import { useMemo } from 'react'
import { Resource } from '@/types/resource-types'
import { Task, getTaskResourceIds } from '@/store/project/interfaces'
import { ResourceLoadingService } from '@/domain/resources/services/ResourceLoadingService'

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
  /** Количество перегруженных по времени (хотя бы один день с загрузкой > maxUnits) */
  overloaded: number;
}

/** Диапазон дат проекта: min start, max end по задачам с датами. */
function getProjectDateRange(tasks: Task[]): { start: Date; end: Date } | null {
  const withDates = tasks.filter(
    (task) => !task.isSummary && task.startDate && task.endDate,
  )
  if (withDates.length === 0) return null
  let minStart = new Date(withDates[0].startDate!)
  let maxEnd = new Date(withDates[0].endDate!)
  for (const task of withDates) {
    const s = new Date(task.startDate!)
    const e = new Date(task.endDate!)
    if (s < minStart) minStart = s
    if (e > maxEnd) maxEnd = e
  }
  if (minStart > maxEnd) return null
  return { start: minStart, end: maxEnd }
}

/**
 * Вычисляет суммарный процент загрузки ресурса из всех назначений.
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
      totalUnits += BASE_CAPACITY
    }
  }

  const rawMax = resource.maxUnits ?? BASE_CAPACITY
  const effectiveMaxUnits = rawMax > 10 ? rawMax / 100 : rawMax
  return effectiveMaxUnits > 0 ? totalUnits / effectiveMaxUnits : 0
}

/**
 * Хук для вычисления статистики использования ресурсов.
 * Перегрузка (MS Project–style): учитываются только ресурсы с перегрузом по времени.
 */
export const useResourceUsageStats = (
  resources: Resource[],
  tasks: Task[],
): ResourceUsageStats => {
  const loadingService = useMemo(() => new ResourceLoadingService(), [])
  const dateRange = useMemo(() => getProjectDateRange(tasks), [tasks])

  return useMemo(() => {
    let available = 0
    let busy = 0
    let overloaded = 0

    resources.forEach(resource => {
      const loadPercent = calculateResourceLoad(resource, tasks)
      const overloadedInTime =
        dateRange !== null
          ? loadingService.isResourceOverloadedInTime(
              resource,
              tasks,
              dateRange.start,
              dateRange.end,
            )
          : loadPercent > BASE_CAPACITY

      if (overloadedInTime) overloaded++
      if (loadPercent > 0) busy++
      else available++
    })

    return { available, busy, overloaded }
  }, [resources, tasks, dateRange, loadingService])
}
