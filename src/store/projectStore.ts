import { create } from 'zustand'
import { UserPreferencesService } from '@/components/userpreferences/services/UserPreferencesService'
import { CalendarPreferences } from '@/types/Master_Functionality_Catalog'
import { Task, ProjectStore, Resource } from './project/interfaces'

export type { Task, TaskSegment, TaskCreatePayload } from './project/interfaces'
export { getTaskResourceIds, createTaskFromView } from './project/interfaces'
import { emptyProjectState } from './project/initialState'
import { TaskSplitService } from '@/domain/services/TaskSplitService'
import { TaskHierarchyService } from '@/domain/services/TaskHierarchyService'
import { TaskLinkService } from '@/domain/services/TaskLinkService'
import { TaskSchedulingService } from '@/domain/services/TaskSchedulingService'

import { ProjectJavaService } from '@/services/ProjectJavaService'
import { TaskDataConverter } from '@/services/TaskDataConverter'
import { ResourceDataConverter } from '@/services/ResourceDataConverter'
import type { IWorkCalendar } from '@/domain/calendar/interfaces/IWorkCalendar'
import { getErrorMessage } from '@/utils/errorUtils'

/**
 * Нормализует прогресс задачи в зависимости от её типа.
 */
const normalizeProgress = (progress: number, isMilestone: boolean): number => {
  const clampedProgress = Math.max(0, Math.min(1, progress))
  return isMilestone ? (clampedProgress >= 0.5 ? 1.0 : 0.0) : Math.round(clampedProgress * 100) / 100
}

/**
 * Синхронизирует проект (задачи + ресурсы + календари) с Java-ядром.
 */
const syncWithJava = async (
  projectId: number | undefined,
  tasks: Task[],
  resources: Resource[],
  calendars: IWorkCalendar[],
): Promise<void> => {
  if (!projectId) return

  try {
    const service = new ProjectJavaService()
    const startTime = performance.now()

    console.log('[syncWithJava] 🔄 Starting unified sync:',
      tasks.length, 'tasks,', resources.length, 'resources,', calendars.length, 'calendars')

    await service.updateProject(projectId.toString(), {
      tasks: TaskDataConverter.frontendTasksToSync(tasks),
      resources: ResourceDataConverter.frontendResourcesToSync(resources, calendars),
    })

    const duration = (performance.now() - startTime).toFixed(2)
    console.log('[syncWithJava] ✅ Sync completed in', duration, 'ms')
  } catch (err) {
    console.error('[syncWithJava] ❌ Sync failed:', getErrorMessage(err))
    throw err
  }
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  ...emptyProjectState,

  setTasks: (tasks) => {
    const tasksWithFlags = TaskHierarchyService.refreshSummaryFlags(tasks)
    set({ tasks: tasksWithFlags, isDirty: false })
  },

  setProjectInfo: (id, filePath) => set({ currentProjectId: id, currentFilePath: filePath }),

  setProjectManager: (manager) => set({ projectManager: manager, isDirty: true }),

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

    const updatedTasks = state.tasks.map(t => t.id === taskId ? { ...t, ...finalUpdates } : t)
    syncWithJava(state.currentProjectId, updatedTasks, state.resources, state.calendars)

    return {
      tasks: TaskSchedulingService.recalculateSummaryTasks(updatedTasks),
      isDirty: true,
    }
  }),

  addTask: (task) => set((state) => {
    const prefs = UserPreferencesService.getInstance().getPreferences()
    const calendarPrefs: CalendarPreferences = prefs.calendar
    const lastTask = state.tasks[state.tasks.length - 1]

    const newTask = TaskSchedulingService.prepareNewTask(task, lastTask, prefs.schedule, calendarPrefs)
    const updatedTasks = [...state.tasks, newTask]

    syncWithJava(state.currentProjectId, updatedTasks, state.resources, state.calendars)

    return { tasks: updatedTasks, isDirty: true }
  }),

  deleteTask: (taskId) => set((state) => {
    const updatedTasks = state.tasks.filter(task => task.id !== taskId)
    syncWithJava(state.currentProjectId, updatedTasks, state.resources, state.calendars)
    return { tasks: updatedTasks, isDirty: true }
  }),

  moveTask: (taskId, direction) => set((state) => {
    const index = state.tasks.findIndex(t => t.id === taskId)
    if (index === -1) return state
    const newTasks = [...state.tasks]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex >= 0 && targetIndex < newTasks.length) {
      [newTasks[index], newTasks[targetIndex]] = [newTasks[targetIndex], newTasks[index]]
    }
    syncWithJava(state.currentProjectId, newTasks, state.resources, state.calendars)
    return { tasks: newTasks, isDirty: true }
  }),

  setResources: (resources) => set({ resources, isDirty: false }),
  updateResource: (id, u) => set((s) => ({ resources: s.resources.map(r => r.id === id ? { ...r, ...u } : r), isDirty: true })),
  addResource: (r) => set((s) => ({ resources: [...s.resources, r], isDirty: true })),
  deleteResource: (id) => set((s) => ({ resources: s.resources.filter(r => r.id !== id), isDirty: true })),

  setCalendars: (calendars) => set({ calendars, isDirty: false }),
  addCalendar: (calendar) => set((s) => ({ calendars: [...s.calendars, calendar], isDirty: true })),
  updateCalendar: (id, updates) => set((s) => ({
    calendars: s.calendars.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c),
    isDirty: true,
  })),
  deleteCalendar: (id) => set((s) => {
    const calendar = s.calendars.find(c => c.id === id)
    if (calendar?.isBase) return s
    return { calendars: s.calendars.filter(c => c.id !== id), isDirty: true }
  }),
  getCalendar: (id) => get().calendars.find(c => c.id === id),

  indentTask: (id) => set((s) => {
    const recalculatedTasks = TaskSchedulingService.recalculateSummaryTasks(TaskHierarchyService.indent(s.tasks, id))
    syncWithJava(s.currentProjectId, recalculatedTasks, s.resources, s.calendars)
    return { tasks: recalculatedTasks, isDirty: true }
  }),
  outdentTask: (id) => set((s) => {
    const recalculatedTasks = TaskSchedulingService.recalculateSummaryTasks(TaskHierarchyService.outdent(s.tasks, id))
    syncWithJava(s.currentProjectId, recalculatedTasks, s.resources, s.calendars)
    return { tasks: recalculatedTasks, isDirty: true }
  }),

  linkTasks: (src, tgt) => set((s) => {
    if (src === tgt || !TaskLinkService.isValidPredecessor(s.tasks, src, tgt)) return s
    const updatedTasks = TaskLinkService.link(s.tasks, src, tgt, UserPreferencesService.getInstance().getPreferences().calendar)
    syncWithJava(s.currentProjectId, updatedTasks, s.resources, s.calendars)
    return { tasks: updatedTasks, isDirty: true }
  }),

  unlinkTasks: (id) => set((s) => {
    const updatedTasks = s.tasks.map(t => t.id === id ? { ...t, predecessors: [] } : t)
    syncWithJava(s.currentProjectId, updatedTasks, s.resources, s.calendars)
    return { tasks: updatedTasks, isDirty: true }
  }),

  toggleMilestone: (id) => set((s) => {
    const task = s.tasks.find(t => t.id === id)
    if (!task) return s
    const willBeMilestone = !(task as { isMilestone?: boolean }).isMilestone
    const updatedTasks = s.tasks.map(t => t.id === id ? {
      ...t,
      isMilestone: willBeMilestone,
      endDate: willBeMilestone ? new Date(t.startDate) : t.endDate,
      progress: normalizeProgress(t.progress, willBeMilestone),
    } : t)
    syncWithJava(s.currentProjectId, updatedTasks, s.resources, s.calendars)
    return { tasks: updatedTasks, isDirty: true }
  }),

  isValidPredecessor: (id, pid) => TaskLinkService.isValidPredecessor(get().tasks, id, pid),
  recalculateAllTasks: () => set((s) => ({ tasks: TaskSchedulingService.recalculateAll(s.tasks, UserPreferencesService.getInstance().getPreferences().calendar), isDirty: true })),
  setInitialized: (initialized) => set({ initialized }),
  reset: () => set(emptyProjectState),
  getHoursPerDay: () => UserPreferencesService.getInstance().getPreferences().calendar.hoursPerDay,

  splitTask: (id, date, days) => set((s) => {
    if (!UserPreferencesService.getInstance().getPreferences().editing?.splitTasksEnabled) return s
    const task = s.tasks.find(t => t.id === id)
    if (!task) return s
    const updates = TaskSplitService.split(task, date, days * 24 * 60 * 60 * 1000)
    return { tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t) }
  }),

  mergeTask: (id) => set((s) => {
    const task = s.tasks.find(t => t.id === id)
    if (!task) return s
    const updates = TaskSplitService.merge(task)
    return { tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t), isDirty: true }
  }),

  recalculateCriticalPath: async () => {
    const { currentProjectId, tasks, isDirty, resources, calendars } = get()
    if (!currentProjectId) return
    try {
      const service = new ProjectJavaService()
      if (isDirty) await syncWithJava(currentProjectId, tasks, resources, calendars)
      const response = await service.recalculateProject(currentProjectId.toString())
      const data = response?.data
      if (!data?.tasks) throw new Error('Invalid recalculation response')
      const frontendTasks = data.tasks.map(t => TaskDataConverter.coreToFrontendTask(t))
      set({ tasks: TaskHierarchyService.refreshSummaryFlags(frontendTasks) })
    } catch (error) {
      console.error('[ProjectStore] Critical path calculation failed:', getErrorMessage(error))
      throw error
    }
  },

  saveBaseline: (name) => set((s) => {
    const newBaseline = {
      id: Date.now().toString(),
      name: name || `Baseline ${s.baselines.length + 1}`,
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

