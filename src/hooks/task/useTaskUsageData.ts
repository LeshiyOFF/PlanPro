import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Task, ResourceAssignment, getTaskResourceIds } from '@/store/project/interfaces'
import { Resource } from '@/types/resource-types'
import { ITaskUsage } from '@/domain/sheets/entities/ITaskUsage'
import { CalendarMathService } from '@/domain/services/CalendarMathService'
import { useAppStore } from '@/store/appStore'
import { CalendarPreferences } from '@/types/Master_Functionality_Catalog'

/** Дефолтные настройки календаря */
const DEFAULT_CALENDAR_PREFS: CalendarPreferences = {
  hoursPerDay: 8,
  hoursPerWeek: 40,
  daysPerMonth: 20,
}

/** Допустимые единицы длительности */
type DurationUnit = 'days' | 'hours' | 'weeks' | 'months';

/**
 * Формирует строку с именами назначенных ресурсов и процентами.
 * Формат: "Иван (100%), Петр (50%)" или "Не назначено"
 * Поддерживает обратную совместимость с устаревшим resourceIds.
 */
const formatAssignedResources = (
  task: Task,
  resources: Resource[],
  fallback: string,
): string => {
  // Приоритет: новый формат resourceAssignments
  if (task.resourceAssignments && task.resourceAssignments.length > 0) {
    const formatted = task.resourceAssignments
      .map(a => {
        const resource = resources.find(r => r.id === a.resourceId)
        if (!resource) return null
        const percent = Math.round(a.units * 100)
        return `${resource.name} (${percent}%)`
      })
      .filter((s): s is string => Boolean(s))

    if (formatted.length > 0) return formatted.join(', ')
  }

  // Fallback: из resourceAssignments через getTaskResourceIds
  const resourceIds = getTaskResourceIds(task)
  if (resourceIds.length > 0) {
    const names = resourceIds
      .map(id => resources.find(r => String(r.id) === id)?.name)
      .filter((name): name is string => Boolean(name))

    if (names.length > 0) return names.map(n => `${n} (100%)`).join(', ')
  }

  return fallback
}

/**
 * Получает resourceAssignments с обратной совместимостью.
 */
const getResourceAssignments = (task: Task): ResourceAssignment[] => {
  if (task.resourceAssignments && task.resourceAssignments.length > 0) {
    return task.resourceAssignments
  }
  // Fallback: конвертируем старый формат в новый
  if (task.resourceIds && task.resourceIds.length > 0) {
    return task.resourceIds.map(resourceId => ({ resourceId, units: 1.0 }))
  }
  return []
}

/**
 * Интерфейс настроек приложения с расширенными типами
 */
interface ExtendedPreferences {
  calendar?: CalendarPreferences;
  schedule?: { durationEnteredIn?: string };
}

/**
 * Хук для преобразования задач в формат ITaskUsage.
 * Использует мемоизацию с корректными примитивными зависимостями.
 */
export const useTaskUsageData = (tasks: Task[], resources: Resource[]): ITaskUsage[] => {
  const { t } = useTranslation()
  const { preferences } = useAppStore()

  // Извлекаем примитивные значения для стабильных зависимостей
  const extPrefs = preferences as ExtendedPreferences
  const hoursPerDay = extPrefs.calendar?.hoursPerDay ?? DEFAULT_CALENDAR_PREFS.hoursPerDay
  const hoursPerWeek = extPrefs.calendar?.hoursPerWeek ?? DEFAULT_CALENDAR_PREFS.hoursPerWeek
  const daysPerMonth = extPrefs.calendar?.daysPerMonth ?? DEFAULT_CALENDAR_PREFS.daysPerMonth
  const durationUnit = (extPrefs.schedule?.durationEnteredIn || 'days') as DurationUnit

  return useMemo(() => {
    // Собираем CalendarPreferences внутри useMemo
    const calendarPrefs: CalendarPreferences = {
      hoursPerDay,
      hoursPerWeek,
      daysPerMonth,
    }

    return tasks.map(task => {
      const duration = CalendarMathService.calculateDuration(
        new Date(task.startDate),
        new Date(task.endDate),
        durationUnit,
        calendarPrefs,
      )

      return {
        id: task.id,
        taskName: task.name,
        startDate: task.startDate,
        endDate: task.endDate,
        duration: duration.value,
        percentComplete: task.progress,
        resources: formatAssignedResources(task, resources, t('sheets.not_assigned') || 'Не назначено'),
        resourceAssignments: getResourceAssignments(task),
        level: task.level || 1,
        milestone: task.isMilestone || false,
        summary: task.isSummary || false,
      }
    })
  }, [tasks, resources, t, hoursPerDay, hoursPerWeek, daysPerMonth, durationUnit])
}
