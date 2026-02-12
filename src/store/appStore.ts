import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import {
  ExtendedAppState,
  ProjectState as CatalogProjectState,
  TaskState,
  ResourceState,
  UIState,
  ValidationErrors,
  UserPreferences,
  ID,
  View,
  AppNotification as Notification,
  TimeUnit,
  TaskType,
  ViewType,
  Theme,
} from '../types/Master_Functionality_Catalog'
import type { Project } from '@/types/project-types'

/** Состояние проектов в сторе: current — project-types.Project (источник правды UI). */
export type StoreProjectState = Omit<CatalogProjectState, 'current'> & { current: Project | null };

export type StoreExtendedAppState = Omit<ExtendedAppState, 'projects'> & { projects: StoreProjectState };

/** Флаг прохождения полноэкранного стартового экрана (Фаза 2 ROADMAP). */
export type StartupScreenState = { startupScreenCompleted: boolean };

interface AppStore extends StoreExtendedAppState, StartupScreenState {
  // Startup screen (Phase 2)
  setStartupScreenCompleted: (completed: boolean) => void;

  // Project actions
  setProjectState: (state: Partial<StoreProjectState>) => void;
  setCurrentProject: (project: Project | null) => void;
  setProjectLoading: (loading: boolean) => void;
  setProjectError: (error: string | null) => void;
  updateProjectValidation: (errors: ValidationErrors | null) => void;

  // User Preferences actions
  setUserPreferences: (preferences: Partial<UserPreferences>) => void;

  // Task actions
  setTaskState: (taskState: Partial<TaskState>) => void;
  setCurrentTask: (taskId: ID | null) => void;
  setSelectedTasks: (taskIds: ID[]) => void;
  setTaskLoading: (loading: boolean) => void;
  setTaskError: (error: string | null) => void;

  // Resource actions
  setResourceState: (resourceState: Partial<ResourceState>) => void;
  setCurrentResource: (resourceId: ID | null) => void;
  setSelectedResources: (resourceIds: ID[]) => void;
  setResourceLoading: (loading: boolean) => void;
  setResourceError: (error: string | null) => void;

  // UI actions
  setUIState: (uiState: Partial<UIState>) => void;
  setCurrentView: (view: View | null) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setLoading: (loading: boolean) => void;
  setNotification: (notification: Notification | null) => void;
  clearNotification: () => void;

  // Global actions
  resetStore: () => void;
  initializeStore: (initialState?: Partial<StoreExtendedAppState>) => void;
}

const initialState: StoreExtendedAppState & StartupScreenState = {
  projects: {
    current: null,
    loading: false,
    error: null,
    lastModified: null,
    unsavedChanges: false,
  },
  tasks: {
    currentTask: null,
    selectedTasks: [],
    isLoading: false,
    error: null,
  },
  resources: {
    currentResource: null,
    selectedResources: [],
    isLoading: false,
    error: null,
  },
  ui: {
    currentView: null,
    selectedTasks: [],
    selectedResources: [],
    filters: [],
    groups: [],
    sorts: [],
    timeScale: {
      unit: TimeUnit.DAYS,
      count: 1,
      zoomLevel: 1,
      showNonWorkingTime: true,
      showWeekNumbers: true,
      fiscalYearStart: 1,
    },
    sidebarVisible: true,
    toolbarVisible: true,
    statusbarVisible: true,
    isPulseActive: false,
    isLoading: false,
    dialogs: [],
    notifications: [],
  },
  preferences: {
    general: {
      userName: '',
      companyName: '',
      defaultView: ViewType.GANTT,
      autoSave: false,
      autoSaveInterval: 5,
      defaultCalendar: { value: 0, type: 'calendar' },
      dateFormat: 'yyyy-MM-dd',
      timeFormat: 'HH:mm',
      currency: 'USD',
      language: 'en',
      defaultStandardRate: 60.0,
      defaultOvertimeRate: 90.0,
    },
    display: {
      showTips: true,
      showWelcomeScreen: true,
      animationEnabled: true,
      highContrast: false,
      fontSize: 14,
      fontFamily: 'Inter',
      theme: Theme.LIGHT,
    },
    editing: {
      autoCalculate: true,
      showDependencies: true,
      allowTaskDeletion: true,
      confirmDeletions: true,
      splitTasksEnabled: true,
    },
    calculations: {
      criticalSlack: { value: 0, unit: TimeUnit.DAYS },
      calculateMultipleCriticalPaths: false,
      tasksAreCriticalIfSlackIsLessThan: { value: 0, unit: TimeUnit.DAYS },
      showEstimatedDurations: true,
      showActualWork: true,
      showBaselineWork: true,
    },
    security: {
      passwordProtection: false,
      readOnlyRecommended: false,
      encryptDocument: false,
      allowMacros: false,
      trustCenter: {
        enableAllMacros: false,
        disableAllMacros: true,
        trustVbaProjects: false,
        trustedLocations: [],
      },
    },
    schedule: {
      schedulingRule: TaskType.FIXED_UNITS,
      effortDriven: false,
      durationEnteredIn: TimeUnit.DAYS,
      workUnit: TimeUnit.HOURS,
      newTasksStartToday: true,
      honorRequiredDates: true,
    },
    calendar: {
      hoursPerDay: 8,
      hoursPerWeek: 40,
      daysPerMonth: 20,
    },
  },
  startupScreenCompleted: false,
}

export const useAppStore = create<AppStore>()(
  devtools(
    subscribeWithSelector((set) => ({
      ...initialState,
      startupScreenCompleted: false,

      setStartupScreenCompleted: (completed) =>
        set({ startupScreenCompleted: completed }, false, 'setStartupScreenCompleted'),

      // Project actions
      setProjectState: (projectState) => set((state) => ({
        projects: { ...state.projects, ...projectState },
      }), false, 'setProjectState'),

      setCurrentProject: (project) => set((state) => ({
        projects: { ...state.projects, current: project },
      }), false, 'setCurrentProject'),

      setProjectLoading: (loading) => set((state) => ({
        projects: { ...state.projects, loading },
      }), false, 'setProjectLoading'),

      setProjectError: (error) => set((state) => ({
        projects: { ...state.projects, error },
      }), false, 'setProjectError'),

      updateProjectValidation: (errors) => set((state) => ({
        projects: { ...state.projects, validationErrors: errors },
      }), false, 'updateProjectValidation'),

      // User Preferences actions
      setUserPreferences: (preferences) => set((state) => ({
        preferences: { ...state.preferences, ...preferences },
      }), false, 'setUserPreferences'),

      // Task actions
      setTaskState: (taskState) => set((state) => ({
        tasks: { ...state.tasks, ...taskState },
      }), false, 'setTaskState'),

      setCurrentTask: (taskId) => set((state) => ({
        tasks: { ...state.tasks, currentTask: taskId },
      }), false, 'setCurrentTask'),

      setSelectedTasks: (taskIds) => set((state) => ({
        tasks: { ...state.tasks, selectedTasks: taskIds },
      }), false, 'setSelectedTasks'),

      setTaskLoading: (loading) => set((state) => ({
        tasks: { ...state.tasks, isLoading: loading },
      }), false, 'setTaskLoading'),

      setTaskError: (error) => set((state) => ({
        tasks: { ...state.tasks, error },
      }), false, 'setTaskError'),

      // Resource actions
      setResourceState: (resourceState) => set((state) => ({
        resources: { ...state.resources, ...resourceState },
      }), false, 'setResourceState'),

      setCurrentResource: (resourceId) => set((state) => ({
        resources: { ...state.resources, currentResource: resourceId },
      }), false, 'setCurrentResource'),

      setSelectedResources: (resourceIds) => set((state) => ({
        resources: { ...state.resources, selectedResources: resourceIds },
      }), false, 'setSelectedResources'),

      setResourceLoading: (loading) => set((state) => ({
        resources: { ...state.resources, isLoading: loading },
      }), false, 'setResourceLoading'),

      setResourceError: (error) => set((state) => ({
        resources: { ...state.resources, error },
      }), false, 'setResourceError'),

      // UI actions
      setUIState: (uiState) => set((state) => ({
        ui: { ...state.ui, ...uiState },
      }), false, 'setUIState'),

      setCurrentView: (view) => set((state) => ({
        ui: { ...state.ui, currentView: view },
      }), false, 'setCurrentView'),

      setSidebarCollapsed: (collapsed) => set((state) => ({
        ui: { ...state.ui, sidebarVisible: !collapsed },
      }), false, 'setSidebarCollapsed'),

      setLoading: (loading) => set((state) => ({
        ui: { ...state.ui, isLoading: loading },
      }), false, 'setLoading'),

      setNotification: (notification) => set((state) => ({
        ui: { ...state.ui, notifications: notification ? [notification] : [] },
      }), false, 'setNotification'),

      clearNotification: () => set((state) => ({
        ui: { ...state.ui, notifications: [] },
      }), false, 'clearNotification'),

      // Global actions
      resetStore: () => set(initialState, false, 'resetStore'),

      initializeStore: (initialStateOverride) => set((state) => ({
        ...state,
        ...initialState,
        ...initialStateOverride,
      }), false, 'initializeStore'),
    })),
    { name: 'projectlibre-app-store' },
  ),
)

