import { useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Resource } from '@/types/resource-types'
import { Task, getTaskResourceIds } from '@/store/project/interfaces'
import { IResourceUsage } from '@/domain/sheets/entities/IResourceUsage'
import { ResourceLoadingService } from '@/domain/resources/services/ResourceLoadingService'

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
 * Вычисляет диапазон дат проекта по задачам (min start, max end).
 * Возвращает null, если нет задач с валидными датами.
 */
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
 * Хук для преобразования ресурсов в формат IResourceUsage.
 * Перегруз по времени (MS Project–style): статус «Перегружен» только при наличии дня с загрузкой > maxUnits.
 */
export const useResourceUsageData = (
  resources: Resource[],
  tasks: Task[],
): IResourceUsage[] => {
  const { t } = useTranslation()
  const loadingService = useMemo(() => new ResourceLoadingService(), [])

  const formatStatus = useCallback(
    (loadPercent: number) => getResourceStatus(loadPercent, t),
    [t],
  )

  const formatWorkload = useCallback(
    (loadPercent: number) => getWorkloadLevel(loadPercent, t),
    [t],
  )

  const dateRange = useMemo(() => getProjectDateRange(tasks), [tasks])

  return useMemo(() => {
    return resources.map((resource) => {
      const { totalUnits, loadPercent } = calculateResourceLoad(resource, tasks)
      const assignedPercent = totalUnits
      const availablePercent = Math.max(
        0,
        BASE_CAPACITY - Math.min(totalUnits, BASE_CAPACITY),
      )

      const overloadedInTime =
        dateRange !== null
          ? loadingService.isResourceOverloadedInTime(
              resource,
              tasks,
              dateRange.start,
              dateRange.end,
            )
          : loadPercent > BASE_CAPACITY

      let status: string
      let workload: string
      if (overloadedInTime) {
        status = t('sheets.status_overloaded')
        workload = t('sheets.workload_overload')
      } else if (loadPercent > BASE_CAPACITY) {
        status = t('sheets.status_distributed')
        workload = t('sheets.workload_distributed')
      } else {
        status = formatStatus(loadPercent)
        workload = formatWorkload(loadPercent)
      }

      return {
        id: resource.id,
        resourceName: resource.name,
        assignedPercent,
        availablePercent,
        status,
        workload,
        isOverloadedInTime: overloadedInTime,
        actualHours: 0,
        plannedHours: 0,
        variance: 0,
      }
    })
  }, [resources, tasks, dateRange, loadingService, formatStatus, formatWorkload, t])
}
