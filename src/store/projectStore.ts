import { create } from 'zustand'
import { UserPreferencesService } from '@/components/userpreferences/services/UserPreferencesService'
import { CalendarPreferences } from '@/types/Master_Functionality_Catalog'
import { Task, ProjectStore } from './project/interfaces'

export type { Task, TaskSegment, TaskCreatePayload } from './project/interfaces'
export { getTaskResourceIds, createTaskFromView } from './project/interfaces'
import { emptyProjectState } from './project/initialState'
import { TaskSplitService } from '@/domain/services/TaskSplitService'
import { TaskHierarchyService } from '@/domain/services/TaskHierarchyService'
import { TaskLinkService } from '@/domain/services/TaskLinkService'
import { TaskSchedulingService } from '@/domain/services/TaskSchedulingService'
import { DurationSyncService } from '@/domain/services/DurationSyncService'
import { CalendarMathService } from '@/domain/services/CalendarMathService'
import { EffortDrivenService } from '@/domain/services/EffortDrivenService'
import { BaselineIdGenerator } from '@/domain/baseline/services/BaselineIdGenerator'

import { ProjectJavaService } from '@/services/ProjectJavaService'
import { getErrorMessage } from '@/utils/errorUtils'
import { isTaskCritical } from '@/utils/task-utils'
import { syncWithJava, computeCalendarDeletionState, applyCpmResults } from '@/store/syncProjectToJava'
import { scheduleCriticalPathRecalcIfPulseActive } from '@/store/criticalPathAutoRecalcScheduler'
import { toast } from '@/hooks/use-toast'
import { logger } from '@/utils/logger'

/** Счётчик вызовов пересчёта критического пути для трассировки (A.1: runId в логах). */
let criticalPathRecalcRunId = 0

/**
 * Нормализует прогресс задачи в зависимости от её типа.
 */
const normalizeProgress = (progress: number, isMilestone: boolean): number => {
  const clampedProgress = Math.max(0, Math.min(1, progress))
  return isMilestone ? (clampedProgress >= 0.5 ? 1.0 : 0.0) : Math.round(clampedProgress * 100) / 100
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  ...emptyProjectState,

  setTasks: (tasks) => {
    const tasksWithFlags = TaskHierarchyService.refreshSummaryFlags(tasks)
    set({ tasks: tasksWithFlags, isDirty: false })
  },

  setProjectInfo: (id, filePath) => set({ currentProjectId: id, currentFilePath: filePath }),

  setProjectManager: (manager) => set({ projectManager: manager, isDirty: true }),

  setImposedFinishDate: (date) => set({ imposedFinishDate: date, isDirty: true }),

  updateTask: (taskId, updates) => set((state) => {
    const task = state.tasks.find(t => t.id === taskId)
    if (!task) return state

    let finalUpdates = { ...updates }

    if ('progress' in finalUpdates && finalUpdates.progress !== undefined) {
      const isMilestone = (finalUpdates as Partial<Task>).isMilestone ?? task.isMilestone ?? false
      finalUpdates.progress = normalizeProgress(finalUpdates.progress, isMilestone)
    }

    if (updates.startDate && updates.startDate.getTime() !== task.startDate.getTime() && task.segments && task.segments.length > 0) {
      const delta = updates.startDate.getTime() - task.startDate.getTime()
      const segmentUpdates = TaskSplitService.shift(task, delta)
      finalUpdates = { ...finalUpdates, ...segmentUpdates }
    }

    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Синхронизация duration и дат
    const hasDateChange = 'startDate' in updates || 'endDate' in updates
    const hasDurationChange = 'duration' in updates && updates.duration != null && updates.duration > 0
    
    if (hasDurationChange && !hasDateChange) {
      // Сценарий 1: Пользователь изменил duration напрямую → пересчитываем endDate
      const prefs = UserPreferencesService.getInstance().getPreferences().calendar
      const startDate = task.startDate
      const newDuration = updates.duration as number
      
      // Вычисляем новую дату окончания
      const newEndDate = CalendarMathService.calculateFinishDate(
        startDate,
        { value: newDuration, unit: 'days' },
        prefs,
      )
      
      finalUpdates = { ...finalUpdates, endDate: newEndDate }
      console.debug(`[projectStore.updateTask] Duration changed to ${newDuration} days, endDate recalculated for task ${taskId}`)
    } else if (hasDateChange && !hasDurationChange) {
      // Сценарий 2: Пользователь изменил даты → пересчитываем duration
      const finalStartDate = (finalUpdates.startDate ?? task.startDate) as Date
      const finalEndDate = (finalUpdates.endDate ?? task.endDate) as Date
      
      const calculatedDuration = DurationSyncService.calculateDurationInDays(finalStartDate, finalEndDate)
      finalUpdates = { ...finalUpdates, duration: calculatedDuration }
      
      console.debug(`[projectStore.updateTask] Dates changed, duration recalculated to ${calculatedDuration} days for task ${taskId}`)
    }
    // Сценарий 3: И duration и даты переданы явно (например, с Ганта) - используем как есть

    // Effort-driven логика: пересчёт длительности при изменении назначений (09.02.2026)
    const prefs = UserPreferencesService.getInstance().getPreferences()
    const hasAssignmentChange = 'resourceAssignments' in updates
    if (hasAssignmentChange && EffortDrivenService.shouldApply(prefs.schedule?.effortDriven ?? false, task)) {
      const originalUnits = EffortDrivenService.getTotalUnits(task)
      const taskWithNewAssignments: Task = { ...task, ...finalUpdates }
      const effortResult = EffortDrivenService.recalculateDuration(
        taskWithNewAssignments, originalUnits, prefs.calendar,
      )
      if (effortResult.endDate !== task.endDate || effortResult.duration !== task.duration) {
        finalUpdates = { ...finalUpdates, endDate: effortResult.endDate, duration: effortResult.duration }
        console.debug(`[projectStore.updateTask] EffortDriven: duration recalculated for task ${taskId}`)
      }
    }

    const updatedTasks = state.tasks.map(t => t.id === taskId ? { ...t, ...finalUpdates } : t)
    syncWithJava(state.currentProjectId, updatedTasks, state.resources, state.calendars, state.imposedFinishDate)
    scheduleCriticalPathRecalcIfPulseActive()
    return {
      tasks: TaskSchedulingService.recalculateSummaryTasks(updatedTasks),
      isDirty: true,
    }
  }),

  addTask: (task) => set((state) => {
    const prefs = UserPreferencesService.getInstance().getPreferences()
    const calendarPrefs: CalendarPreferences = prefs.calendar

    const newTask = TaskSchedulingService.prepareNewTask(task, prefs.schedule, calendarPrefs)
    const updatedTasks = [...state.tasks, newTask]
    syncWithJava(state.currentProjectId, updatedTasks, state.resources, state.calendars, state.imposedFinishDate)
    scheduleCriticalPathRecalcIfPulseActive()
    return { tasks: updatedTasks, isDirty: true }
  }),

  deleteTask: (taskId) => set((state) => {
    // Каскадное удаление:
    // 1. Удаляем саму задачу
    const filteredTasks = state.tasks.filter(task => task.id !== taskId)
    
    // 2. Очищаем ссылки на удалённую задачу в predecessors других задач
    // Это предотвращает "оживание" связей при переиспользовании ID
    const cleanedTasks = filteredTasks.map(task => {
      const hasPredecessorLink = task.predecessors?.includes(taskId)
      if (hasPredecessorLink) {
        return {
          ...task,
          predecessors: task.predecessors?.filter(predId => predId !== taskId) ?? []
        }
      }
      return task
    })
    
    // 3. Примечание: resourceAssignments удаляются вместе с задачей (хранятся внутри)
    
    syncWithJava(state.currentProjectId, cleanedTasks, state.resources, state.calendars, state.imposedFinishDate)
    scheduleCriticalPathRecalcIfPulseActive()
    return { tasks: cleanedTasks, isDirty: true }
  }),

  moveTask: (taskId, direction) => set((state) => {
    const index = state.tasks.findIndex(t => t.id === taskId)
    if (index === -1) return state
    const newTasks = [...state.tasks]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex >= 0 && targetIndex < newTasks.length) {
      [newTasks[index], newTasks[targetIndex]] = [newTasks[targetIndex], newTasks[index]]
    }
    syncWithJava(state.currentProjectId, newTasks, state.resources, state.calendars, state.imposedFinishDate)
    scheduleCriticalPathRecalcIfPulseActive()
    return { tasks: newTasks, isDirty: true }
  }),

  setResources: (resources) => set({ resources, isDirty: false }),
  updateResource: (id, u) => set((s) => ({ resources: s.resources.map(r => r.id === id ? { ...r, ...u } : r), isDirty: true })),
  addResource: (r) => set((s) => ({ resources: [...s.resources, r], isDirty: true })),
  deleteResource: (resourceId) => set((state) => {
    // Каскадное удаление:
    // 1. Удаляем сам ресурс
    const filteredResources = state.resources.filter(r => r.id !== resourceId)
    
    // 2. Очищаем назначения удалённого ресурса во всех задачах
    // Это предотвращает "оживание" назначений при переиспользовании ID
    const cleanedTasks = state.tasks.map(task => {
      const hasResourceAssignment = task.resourceAssignments?.some(a => a.resourceId === resourceId)
      if (hasResourceAssignment) {
        return {
          ...task,
          resourceAssignments: task.resourceAssignments?.filter(a => a.resourceId !== resourceId) ?? []
        }
      }
      return task
    })
    
    // Синхронизируем с Java API (обновлённые задачи и ресурсы)
    syncWithJava(state.currentProjectId, cleanedTasks, filteredResources, state.calendars, state.imposedFinishDate)
    
    return { 
      resources: filteredResources, 
      tasks: cleanedTasks,
      isDirty: true 
    }
  }),

  setCalendars: (calendars) => set({ calendars, isDirty: false }),
  addCalendar: (calendar) => {
    set((s) => ({ calendars: [...s.calendars, calendar], isDirty: true }))
    const state = get()
    void (async () => {
      try {
        await syncWithJava(state.currentProjectId, state.tasks, state.resources, state.calendars, state.imposedFinishDate)
      } catch (err) {
        console.error('[addCalendar] Sync failed:', getErrorMessage(err as Error))
        toast({ title: 'Ошибка синхронизации', description: getErrorMessage(err as Error), variant: 'destructive' })
      }
    })()
  },
  updateCalendar: (id, updates) => set((s) => ({
    calendars: s.calendars.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c),
    isDirty: true,
  })),
  deleteCalendar: (id) => {
    const s = get()
    const calendar = s.calendars.find(c => c.id === id)
    if (calendar?.isBase) return
    const { newCalendars, newResources } = computeCalendarDeletionState(s.calendars, s.resources, id)
    set({ calendars: newCalendars, resources: newResources, isDirty: true })
    void (async () => {
      try {
        await syncWithJava(s.currentProjectId, s.tasks, newResources, newCalendars, s.imposedFinishDate)
      } catch (err) {
        console.error('[deleteCalendar] Sync failed:', getErrorMessage(err as Error))
        toast({ title: 'Ошибка синхронизации', description: getErrorMessage(err as Error), variant: 'destructive' })
      }
    })()
  },
  getCalendar: (id) => get().calendars.find(c => c.id === id),

  indentTask: (id) => set((s) => {
    const recalculatedTasks = TaskSchedulingService.recalculateSummaryTasks(TaskHierarchyService.indent(s.tasks, id))
    syncWithJava(s.currentProjectId, recalculatedTasks, s.resources, s.calendars, s.imposedFinishDate)
    scheduleCriticalPathRecalcIfPulseActive()
    return { tasks: recalculatedTasks, isDirty: true }
  }),
  outdentTask: (id) => set((s) => {
    const recalculatedTasks = TaskSchedulingService.recalculateSummaryTasks(TaskHierarchyService.outdent(s.tasks, id))
    syncWithJava(s.currentProjectId, recalculatedTasks, s.resources, s.calendars, s.imposedFinishDate)
    scheduleCriticalPathRecalcIfPulseActive()
    return { tasks: recalculatedTasks, isDirty: true }
  }),

  linkTasks: (src, tgt, options) => set((s) => {
    if (src === tgt || !TaskLinkService.isValidPredecessor(s.tasks, src, tgt)) return s
    const updatedTasks = TaskLinkService.link(
      s.tasks, src, tgt,
      UserPreferencesService.getInstance().getPreferences().calendar,
      options,
    )
    syncWithJava(s.currentProjectId, updatedTasks, s.resources, s.calendars, s.imposedFinishDate)
    scheduleCriticalPathRecalcIfPulseActive()
    return { tasks: updatedTasks, isDirty: true }
  }),

  unlinkTasks: (id) => set((s) => {
    const updatedTasks = s.tasks.map(t => t.id === id ? { ...t, predecessors: [] } : t)
    syncWithJava(s.currentProjectId, updatedTasks, s.resources, s.calendars, s.imposedFinishDate)
    scheduleCriticalPathRecalcIfPulseActive()
    return { tasks: updatedTasks, isDirty: true }
  }),

  toggleMilestone: (id) => set((s) => {
    const task = s.tasks.find(t => t.id === id)
    if (!task) return s
    const willBeMilestone = !(task as { isMilestone?: boolean }).isMilestone
    
    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: При конвертации в milestone устанавливаем duration = 0
    // Это обеспечивает корректную синхронизацию с Java Core для CPM расчётов
    // Milestone - это контрольная точка с нулевой длительностью
    const updatedTasks = s.tasks.map(t => t.id === id ? {
      ...t,
      isMilestone: willBeMilestone,
      endDate: willBeMilestone ? new Date(t.startDate) : t.endDate,
      duration: willBeMilestone ? 0 : t.duration,
      progress: normalizeProgress(t.progress, willBeMilestone),
    } : t)
    syncWithJava(s.currentProjectId, updatedTasks, s.resources, s.calendars, s.imposedFinishDate)
    scheduleCriticalPathRecalcIfPulseActive()
    return { tasks: updatedTasks, isDirty: true }
  }),

  isValidPredecessor: (id, pid) => TaskLinkService.isValidPredecessor(get().tasks, id, pid),
  recalculateAllTasks: () => set((s) => {
    const prefs = UserPreferencesService.getInstance().getPreferences()
    return { tasks: TaskSchedulingService.recalculateAll(s.tasks, prefs.calendar, prefs.schedule), isDirty: true }
  }),
  setInitialized: (initialized) => set({ initialized }),
  reset: () => set(emptyProjectState),
  getHoursPerDay: () => UserPreferencesService.getInstance().getPreferences().calendar.hoursPerDay,

  splitTask: (id, date, days) => set((s) => {
    if (!UserPreferencesService.getInstance().getPreferences().editing?.splitTasksEnabled) return s
    const task = s.tasks.find(t => t.id === id)
    if (!task) return s
    const updates = TaskSplitService.split(task, date, days * 24 * 60 * 60 * 1000)
    const updatedTasks = s.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    syncWithJava(s.currentProjectId, updatedTasks, s.resources, s.calendars, s.imposedFinishDate)
    scheduleCriticalPathRecalcIfPulseActive()
    return { tasks: updatedTasks, isDirty: true }
  }),

  mergeTask: (id) => set((s) => {
    const task = s.tasks.find(t => t.id === id)
    if (!task) return s
    const updates = TaskSplitService.merge(task)
    scheduleCriticalPathRecalcIfPulseActive()
    return { tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t), isDirty: true }
  }),

  recalculateCriticalPath: async () => {
    const { currentProjectId, tasks, isDirty, resources, calendars, imposedFinishDate } = get()
    if (!currentProjectId) return
    const thisRunId = ++criticalPathRecalcRunId
    logger.info('[CriticalPathTrace] layer=frontend request', {
      runId: thisRunId,
      projectId: String(currentProjectId),
    }, 'CriticalPathTrace')
    try {
      const service = new ProjectJavaService()
      if (isDirty) await syncWithJava(currentProjectId, tasks, resources, calendars, imposedFinishDate)
      const payload = await service.recalculateProject(currentProjectId.toString())
      if (!payload?.tasks) throw new Error('Invalid recalculation response')
      const currentTaskCount = get().tasks.length
      if (payload.tasks.length === 0 && currentTaskCount > 0) {
        const msg = 'Пересчёт критического пути вернул пустой список задач. Текущие задачи сохранены.'
        logger.error('[CriticalPathTrace] layer=frontend empty_tasks_guard', { runId: thisRunId, projectId: String(currentProjectId) }, 'CriticalPathTrace')
        toast({ title: 'Ошибка пересчёта', description: msg, variant: 'destructive' })
        return
      }
      const payloadCriticalCount = payload.tasks.filter(t => t.critical === true).length
      const criticalTaskIds = payload.tasks.filter(t => t.critical === true).map(t => t.id)
      logger.info('[CriticalPathTrace] layer=frontend api_response', {
        runId: thisRunId,
        projectId: String(currentProjectId),
        taskCount: payload.tasks.length,
        criticalCount: payloadCriticalCount,
        criticalTaskIds,
      }, 'CriticalPathTrace')
      // CORE-AUTH.3.2: Применяем CPM результаты через applyCpmResults (Core-authoritative)
      const currentTasks = get().tasks
      const mergedTasks = applyCpmResults(currentTasks, payload.tasks)
      const frontendCriticalCount = mergedTasks.filter(t => isTaskCritical(t)).length
      // CORE-AUTH.3.4: set() с новым объектом tasks (immutability → re-render)
      set({ tasks: TaskHierarchyService.refreshSummaryFlags(mergedTasks), isDirty: false })
      logger.info('[CriticalPathTrace] layer=frontend store_updated', {
        runId: thisRunId,
        projectId: String(currentProjectId),
        taskCount: mergedTasks.length,
        criticalCount: frontendCriticalCount,
      }, 'CriticalPathTrace')
    } catch (error) {
      logger.error('[CriticalPathTrace] layer=frontend failed', { error: getErrorMessage(error) }, 'CriticalPathTrace')
      console.error('[ProjectStore] Critical path calculation failed:', getErrorMessage(error))
      throw error
    }
  },

  saveBaseline: (name) => set((s) => {
    const newBaseline = {
      id: BaselineIdGenerator.generate(s.baselines),
      name: name || BaselineIdGenerator.generateDefaultName(s.baselines, 'Baseline'),
      createdAt: new Date(),
      taskDates: s.tasks.reduce((acc, t) => {
        acc[t.id] = { startDate: t.startDate, endDate: t.endDate }
        return acc
      }, {} as Record<string, { startDate: Date; endDate: Date }>),
    }
    return { baselines: [...s.baselines, newBaseline], activeBaselineId: newBaseline.id, isDirty: true }
  }),

  deleteBaseline: (id) => set((s) => ({
    baselines: s.baselines.filter(b => b.id !== id),
    activeBaselineId: s.activeBaselineId === id ? undefined : s.activeBaselineId,
    isDirty: true,
  })),

  setActiveBaseline: (id) => set({ activeBaselineId: id }),
  setDirty: (dirty) => set({ isDirty: dirty }),
  markClean: () => set({ isDirty: false }),
}))

