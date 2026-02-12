import { ProjectJavaService } from '@/services/ProjectJavaService'
import { TaskDataConverter } from '@/services/TaskDataConverter'
import { ResourceDataConverter } from '@/services/ResourceDataConverter'
import type { ProjectDataResponse, CoreTaskData } from '@/types/api/response-types'
import type { IWorkCalendar } from '@/domain/calendar/interfaces/IWorkCalendar'
import { getErrorMessage } from '@/utils/errorUtils'
import { isTaskCritical, getCriticalPathLookupKeys } from '@/utils/task-utils'
import type { Task, Resource } from './project/interfaces'
import { TaskHierarchyService } from '@/domain/services/TaskHierarchyService'
import { logger } from '@/utils/logger'

/** ID календаря по умолчанию при удалении кастомного (Стандартный). */
export const DEFAULT_CALENDAR_ID = 'standard'

/** Нормализует прогресс задачи в зависимости от типа. */
export const normalizeProgress = (progress: number, isMilestone: boolean): number => {
  const clamped = Math.max(0, Math.min(1, progress))
  return isMilestone ? (clamped >= 0.5 ? 1.0 : 0.0) : Math.round(clamped * 100) / 100
}

/** Семафор: только одна синхронизация с Java одновременно (устраняет гонку). */
let syncMutex: Promise<void> = Promise.resolve()

/**
 * Синхронизирует проект (задачи + ресурсы + календари + imposed deadline) с Java-ядром.
 * Вызовы выполняются последовательно; при нажатии «Пульс» пересчёт дожидается завершения текущей синхронизации.
 * VB.5: Добавлена передача imposed finish date.
 */
export const syncWithJava = async (
  projectId: number | undefined,
  tasks: Task[],
  resources: Resource[],
  calendars: IWorkCalendar[],
  imposedFinishDate?: Date | null,
): Promise<void> => {
  if (!projectId) return
  const previous = syncMutex
  let resolveNext: () => void
  syncMutex = new Promise<void>((resolve) => {
    resolveNext = resolve
  })
  await previous
  try {
    const service = new ProjectJavaService()
    const startTime = performance.now()
    console.log('[syncWithJava] 🔄 Starting unified sync:',
      tasks.length, 'tasks,', resources.length, 'resources,', calendars.length, 'calendars',
      imposedFinishDate ? `, imposed deadline: ${imposedFinishDate.toISOString()}` : '')
    await service.updateProject(projectId.toString(), {
      tasks: TaskDataConverter.frontendTasksToSync(tasks),
      resources: ResourceDataConverter.frontendResourcesToSync(resources, calendars),
      projectCalendars: ResourceDataConverter.calendarsToSyncData(calendars),
      imposedFinishDate: imposedFinishDate ?? null,
    })
    const duration = (performance.now() - startTime).toFixed(2)
    console.log('[syncWithJava] ✅ Sync completed in', duration, 'ms')
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err))
    console.error('[syncWithJava] ❌ Sync failed:', getErrorMessage(e))
    throw e
  } finally {
    resolveNext!()
  }
}

/**
 * Вычисляет новое состояние календарей и ресурсов после удаления календаря.
 * Ресурсы, привязанные к удалённому календарю, перепривязываются на DEFAULT_CALENDAR_ID.
 */
export function computeCalendarDeletionState(
  calendars: IWorkCalendar[],
  resources: Resource[],
  deletedCalendarId: string,
): { newCalendars: IWorkCalendar[]; newResources: Resource[] } {
  const newCalendars = calendars.filter(c => c.id !== deletedCalendarId)
  const newResources = resources.map(r =>
    r.calendarId === deletedCalendarId ? { ...r, calendarId: DEFAULT_CALENDAR_ID } : r,
  )
  return { newCalendars, newResources }
}

/** Минимальный снимок стора для пересчёта критического пути. */
export type StoreSnapshotForCriticalPath = {
  currentProjectId?: number;
  tasks: Task[];
  isDirty: boolean;
  resources: Resource[];
  calendars: IWorkCalendar[];
};

/**
 * HYBRID-CPM: Применяет CPM-рассчитанные результаты из Core к задачам Frontend.
 * 
 * Гибридный подход:
 * - CPM рассчитывает earlyStart/earlyFinish/lateStart/lateFinish (информационные)
 * - Текущие даты (startDate/endDate) НЕ перезаписываются — это выбор пользователя
 * - Если currentStart < earlyStart — устанавливается dependencyViolation = true
 * - Пользователь имеет полную свободу размещения задач, система информирует о нарушениях
 * 
 * @param currentTasks - текущий массив задач из store
 * @param cpmResponse - задачи из ответа API с CPM-рассчитанными данными
 * @returns новый массив задач с применёнными CPM результатами (immutable)
 */
export function applyCpmResults(currentTasks: Task[], cpmResponse: CoreTaskData[]): Task[] {
  // Создаём lookup map для быстрого поиска по всем вариантам ID
  const cpmDataById = new Map<string, CoreTaskData>()
  for (const apiTask of cpmResponse) {
    for (const key of getCriticalPathLookupKeys(apiTask.id)) {
      cpmDataById.set(key, apiTask)
    }
  }

  return currentTasks.map((task) => {
    const apiTask = cpmDataById.get(task.id) ??
      getCriticalPathLookupKeys(task.id).map((k) => cpmDataById.get(k)).find(Boolean)
    
    if (!apiTask) return task

    // Парсим CPM-рассчитанные даты
    const cpmStartIso = apiTask.calculatedStartDate ?? apiTask.startDate
    const cpmEndIso = apiTask.calculatedEndDate ?? apiTask.endDate
    const cpmStart = new Date(cpmStartIso)
    const cpmEnd = new Date(cpmEndIso)
    const cpmCritical = apiTask.critical ?? false

    // HYBRID-CPM: Парсим early/late даты для информирования
    const earlyStart = apiTask.earlyStart ? new Date(apiTask.earlyStart) : cpmStart
    const earlyFinish = apiTask.earlyFinish ? new Date(apiTask.earlyFinish) : cpmEnd
    const lateStart = apiTask.lateStart ? new Date(apiTask.lateStart) : cpmStart
    const lateFinish = apiTask.lateFinish ? new Date(apiTask.lateFinish) : cpmEnd

    // HYBRID-CPM: Текущие даты пользователя (НЕ перезаписываем!)
    const currentStart = task.startDate
    const currentEnd = task.endDate

    // HYBRID-CPM: Проверка нарушения зависимости
    // Если текущее начало раньше раннего начала — задача не может начаться так рано
    const startOfDayEarlyStart = new Date(earlyStart)
    startOfDayEarlyStart.setHours(0, 0, 0, 0)
    const startOfDayCurrentStart = new Date(currentStart)
    startOfDayCurrentStart.setHours(0, 0, 0, 0)
    
    const dependencyViolation = startOfDayCurrentStart.getTime() < startOfDayEarlyStart.getTime()

    // HYBRID-CPM.LOG: Логирование для диагностики
    const oldCritical = isTaskCritical(task)
    const hasCriticalChange = cpmCritical !== oldCritical
    const hasViolation = dependencyViolation && !task.dependencyViolation
    
    if (hasCriticalChange || hasViolation) {
      console.log('[HYBRID-CPM] Task analysis:', {
        taskId: task.id,
        taskName: task.name,
        currentStart: currentStart.toISOString(),
        earlyStart: earlyStart.toISOString(),
        currentEnd: currentEnd.toISOString(),
        earlyFinish: earlyFinish.toISOString(),
        cpmCritical,
        dependencyViolation,
        totalSlack: apiTask.totalSlack,
      })
    }

    // HYBRID-CPM: Возвращаем новый объект с CPM-информацией, но БЕЗ перезаписи дат пользователя
    return {
      ...task,
      // Текущие даты сохраняются (выбор пользователя)
      startDate: currentStart,
      endDate: currentEnd,
      start: currentStart,
      finish: currentEnd,
      // CPM-рассчитанные даты (информационные)
      earlyStart,
      earlyFinish,
      lateStart,
      lateFinish,
      // Критичность и slack
      critical: cpmCritical,
      isCritical: cpmCritical,
      criticalPath: cpmCritical,
      totalSlack: apiTask.totalSlack,
      containsCriticalChildren: apiTask.containsCriticalChildren,
      minChildSlack: apiTask.minChildSlack,
      // HYBRID-CPM: Флаг нарушения зависимости
      dependencyViolation,
    }
  })
}

/**
 * Пересчитывает критический путь в Java и обновляет задачи в сторе.
 * CORE-AUTH.3.2: Использует applyCpmResults для Core-authoritative синхронизации.
 * Трассировка: логи [CriticalPathTrace] для сравнения Core → API → Frontend.
 */
export async function recalculateCriticalPathAndSet(
  get: () => StoreSnapshotForCriticalPath,
  set: (partial: { tasks: Task[] }) => void,
): Promise<void> {
  const { currentProjectId, tasks, isDirty, resources, calendars } = get()
  if (!currentProjectId) return
  logger.info('[CriticalPathTrace] layer=frontend request (recalculateCriticalPathAndSet)', { projectId: String(currentProjectId) }, 'CriticalPathTrace')
  try {
    const service = new ProjectJavaService()
    if (isDirty) await syncWithJava(currentProjectId, tasks, resources, calendars)
    const payload: ProjectDataResponse | undefined = await service.recalculateProject(currentProjectId.toString())
    if (!payload?.tasks) throw new Error('Invalid recalculation response')
    const payloadCriticalCount = payload.tasks.filter(t => isTaskCritical(t)).length
    logger.info('[CriticalPathTrace] layer=frontend api_response (recalculateCriticalPathAndSet)', {
      projectId: String(currentProjectId),
      taskCount: payload.tasks.length,
      criticalCount: payloadCriticalCount,
      criticalTaskIds: payload.tasks.filter(t => isTaskCritical(t)).map(t => t.id),
    }, 'CriticalPathTrace')
    // CORE-AUTH.3.2: Применяем CPM результаты через applyCpmResults (Core-authoritative)
    const mergedTasks = applyCpmResults(tasks, payload.tasks)
    const frontendCriticalCount = mergedTasks.filter(t => isTaskCritical(t)).length
    // CORE-AUTH.3.4: set() с новым объектом tasks (immutability → re-render)
    set({ tasks: TaskHierarchyService.refreshSummaryFlags(mergedTasks) })
    logger.info('[CriticalPathTrace] layer=frontend store_updated (recalculateCriticalPathAndSet)', {
      projectId: String(currentProjectId),
      taskCount: mergedTasks.length,
      criticalCount: frontendCriticalCount,
    }, 'CriticalPathTrace')
  } catch (error) {
    const e = error instanceof Error ? error : new Error(String(error))
    logger.error('[CriticalPathTrace] layer=frontend failed (recalculateCriticalPathAndSet)', { error: getErrorMessage(e) }, 'CriticalPathTrace')
    console.error('[ProjectStore] Critical path calculation failed:', getErrorMessage(e))
    throw e
  }
}
