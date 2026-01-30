import { create } from 'zustand';
import { UserPreferencesService } from '@/components/userpreferences/services/UserPreferencesService';
import { CalendarPreferences } from '@/types/Master_Functionality_Catalog';
import { Task, ProjectStore } from './project/interfaces';
import { emptyProjectState } from './project/initialState';
import { TaskSplitService } from '@/domain/services/TaskSplitService';
import { TaskHierarchyService } from '@/domain/services/TaskHierarchyService';
import { TaskLinkService } from '@/domain/services/TaskLinkService';
import { TaskSchedulingService } from '@/domain/services/TaskSchedulingService';

import { ProjectJavaService } from '@/services/ProjectJavaService';
import { TaskDataConverter } from '@/services/TaskDataConverter';
import { ResourceDataConverter } from '@/services/ResourceDataConverter';
import type { Resource } from '@/types/resource-types';
import type { IWorkCalendar } from '@/domain/calendar/interfaces/IWorkCalendar';

/**
 * Нормализует прогресс задачи в зависимости от её типа.
 * 
 * <p><b>Бизнес-правила:</b></p>
 * <ul>
 *   <li>Вехи (milestones): прогресс только 0 или 1 (0% или 100%)</li>
 *   <li>Обычные задачи: прогресс округляется до 2 знаков после запятой</li>
 * </ul>
 * 
 * @param progress исходное значение прогресса (0-1)
 * @param isMilestone true если задача является вехой
 * @returns нормализованное значение прогресса
 */
const normalizeProgress = (progress: number, isMilestone: boolean): number => {
  // Валидация диапазона
  const clampedProgress = Math.max(0, Math.min(1, progress));
  
  if (isMilestone) {
    // Вехи: порог 0.5 для округления до 1.0
    return clampedProgress >= 0.5 ? 1.0 : 0.0;
  }
  
  // Обычные задачи: округление до 2 знаков
  return Math.round(clampedProgress * 100) / 100;
};

/**
 * Синхронизирует проект (задачи + ресурсы + календари) с Java-ядром.
 * Гарантирует завершение операции перед возвратом (Promise-based).
 * 
 * CRITICAL FIX: Передаёт calendars для корректной синхронизации кастомных календарей.
 * Без передачи calendars теряются настройки WorkWeek (hoursPerDay, workingHours).
 * 
 * Clean Architecture: Infrastructure Service.
 * SOLID: Open/Closed - расширен для календарей без изменения интерфейса.
 * 
 * @param projectId ID проекта
 * @param tasks Массив задач для синхронизации
 * @param resources Массив ресурсов для синхронизации
 * @param calendars Массив календарей для включения calendarData в ресурсы
 * @throws Error если синхронизация не удалась
 */
const syncWithJava = async (
  projectId: number | undefined, 
  tasks: Task[], 
  resources: Resource[],
  calendars: IWorkCalendar[]
): Promise<void> => {
  if (!projectId) return;
  
  try {
    const service = new ProjectJavaService();
    const startTime = performance.now();
    
    console.log('[syncWithJava] 🔄 Starting unified sync:', 
      tasks.length, 'tasks,', resources.length, 'resources,', calendars.length, 'calendars');
    
    await service.updateProject(projectId.toString(), {
      tasks: TaskDataConverter.frontendTasksToSync(tasks),
      resources: ResourceDataConverter.frontendResourcesToSync(resources, calendars)
    });
    
    const duration = (performance.now() - startTime).toFixed(2);
    console.log('[syncWithJava] ✅ Sync completed in', duration, 'ms');
  } catch (err) {
    console.error('[syncWithJava] ❌ Sync failed:', err);
    throw err;
  }
};

export const useProjectStore = create<ProjectStore>((set, get) => ({
  ...emptyProjectState,

  setTasks: (tasks) => {
    const tasksWithFlags = TaskHierarchyService.refreshSummaryFlags(tasks);
    set({ tasks: tasksWithFlags, isDirty: false });
  },
  
  setProjectInfo: (id, filePath) => set({ currentProjectId: id, currentFilePath: filePath }),
  
  setProjectManager: (manager) => set({ projectManager: manager, isDirty: true }),

  updateTask: (taskId, updates) => set((state) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return state;

    let finalUpdates = { ...updates };

    // Валидация прогресса для вех и обычных задач
    if ('progress' in finalUpdates && finalUpdates.progress !== undefined) {
      const isMilestone = 'milestone' in finalUpdates 
        ? finalUpdates.milestone! 
        : task.milestone || false;
      finalUpdates.progress = normalizeProgress(finalUpdates.progress, isMilestone);
      
      console.log('[ProjectStore] Progress normalized:', {
        taskId,
        isMilestone,
        original: updates.progress,
        normalized: finalUpdates.progress
      });
    }

    if (updates.startDate && updates.startDate.getTime() !== task.startDate.getTime() && task.segments && task.segments.length > 0) {
      const delta = updates.startDate.getTime() - task.startDate.getTime();
      const segmentUpdates = TaskSplitService.shift(task, delta);
      finalUpdates = { ...finalUpdates, ...segmentUpdates };
    }

    const updatedTasks = state.tasks.map(t => t.id === taskId ? { ...t, ...finalUpdates } : t);
    
    // Синхронизация изменений с Java-ядром (включая календари для кастомных настроек)
    syncWithJava(state.currentProjectId, updatedTasks, state.resources, state.calendars);

    // Автоматический пересчет иерархии при любом обновлении
    const prefs = UserPreferencesService.getInstance().getPreferences() as any;
    const recalculatedTasks = TaskSchedulingService.recalculateSummaryTasks(updatedTasks);

    return {
      tasks: recalculatedTasks,
      isDirty: true
    };
  }),

  addTask: (task) => set((state) => {
    const prefs = UserPreferencesService.getInstance().getPreferences() as any;
    const calendarPrefs: CalendarPreferences = prefs.calendar || { hoursPerDay: 8, hoursPerWeek: 40, daysPerMonth: 20 };
    const lastTask = state.tasks[state.tasks.length - 1];
    
    const newTask = TaskSchedulingService.prepareNewTask(task, lastTask, prefs.schedule, calendarPrefs);
    const updatedTasks = [...state.tasks, newTask];
    
    syncWithJava(state.currentProjectId, updatedTasks, state.resources, state.calendars);
    
    return { tasks: updatedTasks, isDirty: true };
  }),

  deleteTask: (taskId) => set((state) => {
    const updatedTasks = state.tasks.filter(task => task.id !== taskId);
    syncWithJava(state.currentProjectId, updatedTasks, state.resources, state.calendars);
    return { tasks: updatedTasks, isDirty: true };
  }),

  moveTask: (taskId, direction) => set((state) => {
    const index = state.tasks.findIndex(t => t.id === taskId);
    if (index === -1) return state;
    const newTasks = [...state.tasks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newTasks.length) {
      [newTasks[index], newTasks[targetIndex]] = [newTasks[targetIndex], newTasks[index]];
    }
    syncWithJava(state.currentProjectId, newTasks, state.resources, state.calendars);
    return { tasks: newTasks, isDirty: true };
  }),

  setResources: (resources) => set({ resources, isDirty: false }),
  updateResource: (id, u) => set((s) => ({ resources: s.resources.map(r => r.id === id ? { ...r, ...u } : r), isDirty: true })),
  addResource: (r) => set((s) => ({ resources: [...s.resources, r], isDirty: true })),
  deleteResource: (id) => set((s) => ({ resources: s.resources.filter(r => r.id !== id), isDirty: true })),

  // Управление календарями
  setCalendars: (calendars) => set({ calendars, isDirty: false }),
  addCalendar: (calendar) => set((s) => ({ calendars: [...s.calendars, calendar], isDirty: true })),
  updateCalendar: (id, updates) => set((s) => ({ 
    calendars: s.calendars.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c), 
    isDirty: true 
  })),
  deleteCalendar: (id) => set((s) => {
    const calendar = s.calendars.find(c => c.id === id);
    if (calendar?.isBase) {
      console.warn('[ProjectStore] Cannot delete base calendar:', id);
      return s;
    }
    return { calendars: s.calendars.filter(c => c.id !== id), isDirty: true };
  }),
  getCalendar: (id) => get().calendars.find(c => c.id === id),

  indentTask: (id) => set((s) => {
    const tasksWithNewLevels = TaskHierarchyService.indent(s.tasks, id);
    const recalculatedTasks = TaskSchedulingService.recalculateSummaryTasks(tasksWithNewLevels);
    syncWithJava(s.currentProjectId, recalculatedTasks, s.resources, s.calendars);
    return { tasks: recalculatedTasks, isDirty: true };
  }),
  outdentTask: (id) => set((s) => {
    const tasksWithNewLevels = TaskHierarchyService.outdent(s.tasks, id);
    const recalculatedTasks = TaskSchedulingService.recalculateSummaryTasks(tasksWithNewLevels);
    syncWithJava(s.currentProjectId, recalculatedTasks, s.resources, s.calendars);
    return { tasks: recalculatedTasks, isDirty: true };
  }),

  linkTasks: (src, tgt) => set((s) => {
    if (src === tgt || !TaskLinkService.isValidPredecessor(s.tasks, src, tgt)) return s;
    const prefs = UserPreferencesService.getInstance().getPreferences() as any;
    const calPrefs = prefs.calendar || { hoursPerDay: 8, hoursPerWeek: 40, daysPerMonth: 20 };
    const updatedTasks = TaskLinkService.link(s.tasks, src, tgt, calPrefs);
    syncWithJava(s.currentProjectId, updatedTasks, s.resources, s.calendars);
    return { tasks: updatedTasks, isDirty: true };
  }),

  unlinkTasks: (id) => set((s) => {
    const updatedTasks = s.tasks.map(t => t.id === id ? { ...t, predecessors: [] } : t);
    syncWithJava(s.currentProjectId, updatedTasks, s.resources, s.calendars);
    return { tasks: updatedTasks, isDirty: true };
  }),

  toggleMilestone: (id) => set((s) => {
    const task = s.tasks.find(t => t.id === id);
    if (!task) return s;
    
    const willBeMilestone = !task.milestone;
    
    const updatedTasks = s.tasks.map(t => {
      if (t.id !== id) return t;
      
      return {
        ...t,
        milestone: willBeMilestone,
        endDate: willBeMilestone ? new Date(t.startDate) : t.endDate,
        progress: normalizeProgress(t.progress, willBeMilestone)
      };
    });
    
    console.log('[ProjectStore] Milestone toggled:', {
      taskId: id,
      isMilestone: willBeMilestone,
      progress: updatedTasks.find(t => t.id === id)?.progress
    });
    
    syncWithJava(s.currentProjectId, updatedTasks, s.resources, s.calendars);
    return { tasks: updatedTasks, isDirty: true };
  }),

  isValidPredecessor: (id, pid) => TaskLinkService.isValidPredecessor(get().tasks, id, pid),

  recalculateAllTasks: () => set((s) => {
    const prefs = UserPreferencesService.getInstance().getPreferences() as any;
    const calPrefs = prefs.calendar || { hoursPerDay: 8, hoursPerWeek: 40, daysPerMonth: 20 };
    return { tasks: TaskSchedulingService.recalculateAll(s.tasks, calPrefs), isDirty: true };
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

  /**
   * Пересчитывает критический путь проекта.
   * Использует трёхэтапный процесс для гарантии актуальности данных:
   * 1. Синхронизация всех задач с Java-ядром (блокирующая операция)
   * 2. Расчёт критического пути алгоритмом CPM в Java Core
   * 3. Получение обновлённых данных с флагами critical/slack
   * 
   * @throws Error если синхронизация или расчёт не удались
   */
  recalculateCriticalPath: async () => {
    const { currentProjectId, tasks, isDirty } = get();
    if (!currentProjectId) {
      console.warn('[recalculateCriticalPath] ⚠️ No active project');
      return;
    }

    const overallStart = performance.now();
    console.log('[recalculateCriticalPath] === START ===');
    console.log('[recalculateCriticalPath] Project ID:', currentProjectId, 'isDirty:', isDirty);
    console.log('[recalculateCriticalPath] Tasks snapshot:', tasks.map(t => ({
      id: t.id,
      name: t.name,
      start: t.startDate.toISOString().split('T')[0],
      end: t.endDate.toISOString().split('T')[0],
      predecessors: t.predecessors || [],
      level: t.level
    })));

    try {
      const service = new ProjectJavaService();
      
      // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: синхронизируем только если есть несохранённые изменения
      // Если проект загружен из .pod и не был изменён, ядро уже содержит актуальные данные
      if (isDirty) {
        console.log('[recalculateCriticalPath] Step 1/3: Syncing project to Java Core (project has unsaved changes)...');
        await syncWithJava(currentProjectId, tasks, get().resources, get().calendars);
      } else {
        console.log('[recalculateCriticalPath] Step 1/3: SKIP sync (project loaded from .pod, no changes)');
      }
      
      // ✅ ШАГ 2: Запуск расчёта критического пути в Java Core
      console.log('[recalculateCriticalPath] Step 2/3: Calculating critical path...');
      const recalcStart = performance.now();
      const response = await service.recalculateProject(currentProjectId.toString());
      const recalcDuration = (performance.now() - recalcStart).toFixed(2);
      console.log('[recalculateCriticalPath] Calculation completed in', recalcDuration, 'ms');
      console.log('[recalculateCriticalPath] Response data:', response);
      
      // ✅ Проверка напрямую по данным, так как BaseJavaService возвращает чистый объект data
      if (!response || !response.tasks) {
        throw new Error('Recalculation response missing project tasks');
      }
      
      // ✅ ШАГ 3: Применение обновлённых данных с флагами critical/slack
      console.log('[recalculateCriticalPath] Step 3/3: Applying updated task data...');
      const projectData = response; // response и есть наши данные проекта
      
      const frontendTasks = projectData.tasks.map(t => TaskDataConverter.coreToFrontendTask(t));
      const updatedTasks = TaskHierarchyService.refreshSummaryFlags(frontendTasks);
      
      const criticalCount = updatedTasks.filter(t => t.critical).length;
      const totalDuration = (performance.now() - overallStart).toFixed(2);
      
      console.log('[recalculateCriticalPath] === COMPLETE ===');
      console.log('[recalculateCriticalPath] ✅ Success:', criticalCount, 'critical tasks found');
      console.log('[recalculateCriticalPath] Total duration:', totalDuration, 'ms');
      console.log('[recalculateCriticalPath] Updated tasks:', updatedTasks.map(t => ({
        id: t.id,
        name: t.name,
        critical: t.critical,
        totalSlack: t.totalSlack
      })));
      
      set({ tasks: updatedTasks });
    } catch (error) {
      const duration = (performance.now() - overallStart).toFixed(2);
      console.error('[recalculateCriticalPath] === FAILED ===');
      console.error('[recalculateCriticalPath] ❌ Error after', duration, 'ms:', error);
      throw error; // Прокидываем ошибку для UI-обработки
    }
  },

  saveBaseline: (name) => set((s) => {
    const newBaseline = {
      id: Date.now().toString(),
      name: name || `Baseline ${s.baselines.length + 1}`,
      createdAt: new Date(),
      taskDates: s.tasks.reduce((acc, t) => {
        acc[t.id] = { startDate: t.startDate, endDate: t.endDate };
        return acc;
      }, {} as Record<string, { startDate: Date; endDate: Date }>)
    };
    return { 
      baselines: [...s.baselines, newBaseline],
      activeBaselineId: newBaseline.id,
      isDirty: true 
    };
  }),

  deleteBaseline: (id) => set((s) => ({
    baselines: s.baselines.filter(b => b.id !== id),
    activeBaselineId: s.activeBaselineId === id ? undefined : s.activeBaselineId,
    isDirty: true
  })),

  setActiveBaseline: (id) => set({ activeBaselineId: id }),

  setDirty: (dirty) => set({ isDirty: dirty }),
  
  markClean: () => set({ isDirty: false })
}));

