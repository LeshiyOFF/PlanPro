import type { Task, ResourceAssignment } from '@/store/project/interfaces'
import type { Resource } from '@/types/resource-types'
import type { CoreTaskData, CoreResourceData } from '@/types/api/response-types'
import type { FrontendTaskData } from '@/types/api/request-types'
import { TaskType } from '@/types/Master_Functionality_Catalog'
import { CalendarDateService } from '@/services/CalendarDateService'

/**
 * Сервис конвертации данных задач между Core и Frontend форматами.
 *
 * V2.0: Исправлена передача дат - теперь используется ISO-8601 вместо timestamp.
 * Это исправляет баг, когда DateTimeMapper не мог распарсить числовые timestamp.
 *
 * Принцип SRP: отвечает только за конвертацию данных.
 *
 * @author ProjectLibre Team
 * @version 2.0.0
 */
export class TaskDataConverter {

  /**
   * Безопасно конвертирует Date в ISO-8601 строку.
   * Защита от невалидных Date объектов.
   *
   * @param date объект Date для конвертации
   * @returns ISO-8601 строка или текущая дата как fallback
   */
  private static dateToIsoString(date: Date): string {
    if (!date || isNaN(date.getTime())) {
      console.warn('[TaskDataConverter] Invalid date detected, using current date as fallback')
      return new Date().toISOString()
    }
    return date.toISOString()
  }

  /**
   * Конвертирует CoreTaskData из бэкенда в формат frontend Task.
   * Нормализует даты к локальной полуночи для устранения UTC-сдвигов.
   *
   * V3.0: КРИТИЧНО - Добавлена миграция resourceIds → resourceAssignments.
   * Если Java бэкенд передаёт только resourceIds, они автоматически
   * конвертируются в resourceAssignments с units=1.0 (100% загрузки).
   */
  static coreToFrontendTask(coreTask: CoreTaskData): Task {
    const rawStart = new Date(coreTask.startDate)
    const rawEnd = new Date(coreTask.endDate)

    // Миграция resourceIds → resourceAssignments для совместимости
    const resourceAssignments = TaskDataConverter.migrateResourceAssignments(coreTask)

    return {
      id: coreTask.id,
      name: coreTask.name || 'Unnamed Task',
      startDate: CalendarDateService.toLocalMidnight(rawStart),
      endDate: CalendarDateService.toLocalMidnight(rawEnd),
      progress: coreTask.progress || 0,
      color: coreTask.color || '#4A90D9',
      level: (coreTask.level ?? 0) + 1,
      isSummary: coreTask.summary || false,
      type: (coreTask.type as TaskType) ?? TaskType.FIXED_DURATION,
      children: coreTask.children || [],
      predecessors: coreTask.predecessors || [],
      resourceAssignments,
      resourceIds: coreTask.resourceIds || [],
      critical: coreTask.critical || false,
      milestone: coreTask.milestone || false,
      notes: coreTask.notes || '',
      totalSlack: coreTask.totalSlack,
    } as Task
  }

  /** Core-задача с опциональным полем resourceAssignments (расширение бэкенда) */
  private static coreTaskWithAssignments(
    t: CoreTaskData,
  ): t is CoreTaskData & { resourceAssignments: Array<{ resourceId: string; units?: number }> } {
    const withAssignments = t as CoreTaskData & { resourceAssignments?: Array<{ resourceId: string; units?: number }> }
    return Array.isArray(withAssignments.resourceAssignments) && withAssignments.resourceAssignments.length > 0
  }

  /**
   * Мигрирует resourceIds в resourceAssignments.
   * Приоритет: resourceAssignments > resourceIds.
   */
  private static migrateResourceAssignments(coreTask: CoreTaskData): ResourceAssignment[] {
    // Приоритет 1: Если есть resourceAssignments, используем их
    if (TaskDataConverter.coreTaskWithAssignments(coreTask)) {
      return coreTask.resourceAssignments.map((a) => ({
        resourceId: a.resourceId,
        units: a.units ?? 1.0,
      }))
    }

    // Приоритет 2: Конвертируем resourceIds в resourceAssignments
    if (coreTask.resourceIds && coreTask.resourceIds.length > 0) {
      return coreTask.resourceIds.map(resourceId => ({
        resourceId,
        units: 1.0,
      }))
    }

    return []
  }

  /**
   * Конвертирует CoreResourceData из бэкенда в формат frontend Resource.
   */
  static coreToFrontendResource(coreResource: CoreResourceData): Resource {
    return {
      id: coreResource.id,
      name: coreResource.name || 'Unnamed Resource',
      type: (coreResource.type as 'Work' | 'Material' | 'Cost') || 'Work',
      maxUnits: coreResource.maxUnits || 1,
      standardRate: coreResource.standardRate || 0,
      overtimeRate: coreResource.overtimeRate || 0,
      costPerUse: coreResource.costPerUse || 0,
      email: coreResource.email || undefined,
      group: coreResource.group || undefined,
      calendarId: coreResource.calendarId || 'standard',
      available: coreResource.available ?? true,
    }
  }

  /**
   * Конвертирует frontend Task в формат для синхронизации с Core.
   *
   * V2.0: startDate/endDate теперь передаются как ISO-8601 строки
   * для корректной обработки DateTimeMapper.toMillis() на бэкенде.
   *
   * V3.0: Добавлена поддержка resourceAssignments с units.
   *
   * ВАЖНО: critical исключен, так как вычисляется ядром CPM.
   */
  static frontendTaskToSync(task: Task): FrontendTaskData {
    return {
      id: task.id,
      name: task.name || 'Unnamed Task',
      startDate: TaskDataConverter.dateToIsoString(task.startDate),
      endDate: TaskDataConverter.dateToIsoString(task.endDate),
      progress: task.progress || 0,
      level: Math.max(0, task.level - 1),
      summary: task.isSummary || false,
      milestone: task.isMilestone || false,
      type: task.type ?? TaskType.FIXED_DURATION,
      predecessors: task.predecessors || [],
      children: task.children || [],
      resourceAssignments: task.resourceAssignments || [],
      notes: task.notes || '',
      color: (task as Task & { color?: string }).color ?? '#4A90D9',
      // critical НЕ отправляется - вычисляется ядром
    }
  }

  /**
   * Конвертирует массив frontend tasks в формат для синхронизации.
   */
  static frontendTasksToSync(tasks: Task[]): FrontendTaskData[] {
    return tasks.map(task => TaskDataConverter.frontendTaskToSync(task))
  }
}

