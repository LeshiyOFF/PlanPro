import { create } from 'zustand';
import { UserPreferencesService } from '@/components/userpreferences/services/UserPreferencesService';
import { CalendarPreferences } from '@/types/Master_Functionality_Catalog';
import { Task, ProjectStore } from './project/interfaces';
import { emptyProjectState } from './project/initialState';
import { TaskSplitService } from '@/domain/services/TaskSplitService';
import { TaskHierarchyService } from '@/domain/services/TaskHierarchyService';
import { TaskLinkService } from '@/domain/services/TaskLinkService';
import { TaskSchedulingService } from '@/domain/services/TaskSchedulingService';

export const useProjectStore = create<ProjectStore>((set, get) => ({
  ...emptyProjectState,

  setTasks: (tasks) => set({ tasks, isDirty: false }),
  
  setProjectInfo: (id, filePath) => set({ currentProjectId: id, currentFilePath: filePath }),

  updateTask: (taskId, updates) => set((state) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return state;

    let finalUpdates = { ...updates };

    if (updates.startDate && updates.startDate.getTime() !== task.startDate.getTime() && task.segments && task.segments.length > 0) {
      const delta = updates.startDate.getTime() - task.startDate.getTime();
      const segmentUpdates = TaskSplitService.shift(task, delta);
      finalUpdates = { ...finalUpdates, ...segmentUpdates };
    }

    return {
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...finalUpdates } : t),
      isDirty: true
    };
  }),

  addTask: (task) => set((state) => {
    const prefs = UserPreferencesService.getInstance().getPreferences() as any;
    const calendarPrefs: CalendarPreferences = prefs.calendar || { hoursPerDay: 8, hoursPerWeek: 40, daysPerMonth: 20 };
    const lastTask = state.tasks[state.tasks.length - 1];
    
    const newTask = TaskSchedulingService.prepareNewTask(task, lastTask, prefs.schedule, calendarPrefs);
    return { tasks: [...state.tasks, newTask], isDirty: true };
  }),

  deleteTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter(task => task.id !== taskId),
    isDirty: true
  })),

  moveTask: (taskId, direction) => set((state) => {
    const index = state.tasks.findIndex(t => t.id === taskId);
    if (index === -1) return state;
    const newTasks = [...state.tasks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newTasks.length) {
      [newTasks[index], newTasks[targetIndex]] = [newTasks[targetIndex], newTasks[index]];
    }
    return { tasks: newTasks, isDirty: true };
  }),

  setResources: (resources) => set({ resources, isDirty: false }),
  updateResource: (id, u) => set((s) => ({ resources: s.resources.map(r => r.id === id ? { ...r, ...u } : r), isDirty: true })),
  addResource: (r) => set((s) => ({ resources: [...s.resources, r], isDirty: true })),
  deleteResource: (id) => set((s) => ({ resources: s.resources.filter(r => r.id !== id), isDirty: true })),

  indentTask: (id) => set((s) => ({ tasks: TaskHierarchyService.indent(s.tasks, id), isDirty: true })),
  outdentTask: (id) => set((s) => ({ tasks: TaskHierarchyService.outdent(s.tasks, id), isDirty: true })),

  linkTasks: (src, tgt) => set((s) => {
    if (src === tgt || !TaskLinkService.isValidPredecessor(s.tasks, src, tgt)) return s;
    const prefs = UserPreferencesService.getInstance().getPreferences() as any;
    const calPrefs = prefs.calendar || { hoursPerDay: 8, hoursPerWeek: 40, daysPerMonth: 20 };
    return { tasks: TaskLinkService.link(s.tasks, src, tgt, calPrefs), isDirty: true };
  }),

  unlinkTasks: (id) => set((s) => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, predecessors: [] } : t), isDirty: true })),

  toggleMilestone: (id) => set((s) => ({
    tasks: s.tasks.map(t => t.id === id ? { ...t, milestone: !t.milestone, endDate: !t.milestone ? new Date(t.startDate) : t.endDate, progress: !t.milestone ? 0 : t.progress } : t),
    isDirty: true
  })),

  isValidPredecessor: (id, pid) => TaskLinkService.isValidPredecessor(get().tasks, id, pid),

  recalculateAllTasks: () => set((s) => {
    const prefs = UserPreferencesService.getInstance().getPreferences() as any;
    const calPrefs = prefs.calendar || { hoursPerDay: 8, hoursPerWeek: 40, daysPerMonth: 20 };
    return { tasks: TaskSchedulingService.recalculateAll(s.tasks, calPrefs) };
  }),

  setInitialized: (initialized) => set({ initialized }),
  
  /**
   * Полная очистка состояния для нового/загруженного проекта
   * НЕ возвращает демо-данные!
   */
  reset: () => {
    console.log('[ProjectStore] Resetting store to empty state');
    return set(emptyProjectState);
  },
  
  getHoursPerDay: () => (UserPreferencesService.getInstance().getPreferences() as any).calendar?.hoursPerDay || 8,

  splitTask: (id, date, days) => set((s) => {
    const prefs = UserPreferencesService.getInstance().getPreferences();
    if (!prefs.editing?.splitTasksEnabled) return s;
    const task = s.tasks.find(t => t.id === id);
    if (!task) return s;
    const updates = TaskSplitService.split(task, date, days * 24 * 60 * 60 * 1000);
    return { tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t) };
  }),

  mergeTask: (id) => set((s) => {
    const task = s.tasks.find(t => t.id === id);
    if (!task) return s;
    const updates = TaskSplitService.merge(task);
    return { tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t), isDirty: true };
  }),

  setDirty: (dirty) => set({ isDirty: dirty }),
  
  markClean: () => set({ isDirty: false })
}));
