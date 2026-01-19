import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Простые интерфейсы для демонстрации
interface ProjectState {
  currentProject: string | null;
  recentProjects: string[];
  isLoading: boolean;
  error: string | null;
}

interface TaskState {
  currentTask: string | null;
  selectedTasks: string[];
  isLoading: boolean;
  error: string | null;
}

interface ResourceState {
  currentResource: string | null;
  selectedResources: string[];
  isLoading: boolean;
  error: string | null;
}

interface UIState {
  currentView: string;
  sidebarCollapsed: boolean;
  theme: string;
  isLoading: boolean;
  notification: { type: string; message: string; timestamp: string } | null;
}

interface SimpleAppState {
  projects: ProjectState;
  tasks: TaskState;
  resources: ResourceState;
  ui: UIState;
}

interface SimpleAppStore extends SimpleAppState {
  // Project actions
  setCurrentProject: (projectId: string | null) => void;
  setRecentProjects: (projects: string[]) => void;
  setProjectLoading: (loading: boolean) => void;
  setProjectError: (error: string | null) => void;

  // Task actions
  setCurrentTask: (taskId: string | null) => void;
  setSelectedTasks: (tasks: string[]) => void;
  setTaskLoading: (loading: boolean) => void;
  setTaskError: (error: string | null) => void;

  // Resource actions
  setCurrentResource: (resourceId: string | null) => void;
  setSelectedResources: (resources: string[]) => void;
  setResourceLoading: (loading: boolean) => void;
  setResourceError: (error: string | null) => void;

  // UI actions
  setCurrentView: (view: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: string) => void;
  setUILoading: (loading: boolean) => void;
  setNotification: (notification: { type: string; message: string; timestamp: string } | null) => void;
  clearNotification: () => void;

  // Global actions
  resetStore: () => void;
}

const initialState: SimpleAppState = {
  projects: {
    currentProject: null,
    recentProjects: [],
    isLoading: false,
    error: null
  },
  tasks: {
    currentTask: null,
    selectedTasks: [],
    isLoading: false,
    error: null
  },
  resources: {
    currentResource: null,
    selectedResources: [],
    isLoading: false,
    error: null
  },
  ui: {
    currentView: 'dashboard',
    sidebarCollapsed: false,
    theme: 'light',
    isLoading: false,
    notification: null
  }
};

export const useSimpleAppStore = create<SimpleAppStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Project actions
      setCurrentProject: (projectId) => set((state) => ({
        projects: { ...state.projects, currentProject: projectId }
      }), false, 'setCurrentProject'),

      setRecentProjects: (projects) => set((state) => ({
        projects: { ...state.projects, recentProjects: projects }
      }), false, 'setRecentProjects'),

      setProjectLoading: (loading) => set((state) => ({
        projects: { ...state.projects, isLoading: loading }
      }), false, 'setProjectLoading'),

      setProjectError: (error) => set((state) => ({
        projects: { ...state.projects, error }
      }), false, 'setProjectError'),

      // Task actions
      setCurrentTask: (taskId) => set((state) => ({
        tasks: { ...state.tasks, currentTask: taskId }
      }), false, 'setCurrentTask'),

      setSelectedTasks: (tasks) => set((state) => ({
        tasks: { ...state.tasks, selectedTasks: tasks }
      }), false, 'setSelectedTasks'),

      setTaskLoading: (loading) => set((state) => ({
        tasks: { ...state.tasks, isLoading: loading }
      }), false, 'setTaskLoading'),

      setTaskError: (error) => set((state) => ({
        tasks: { ...state.tasks, error }
      }), false, 'setTaskError'),

      // Resource actions
      setCurrentResource: (resourceId) => set((state) => ({
        resources: { ...state.resources, currentResource: resourceId }
      }), false, 'setCurrentResource'),

      setSelectedResources: (resources) => set((state) => ({
        resources: { ...state.resources, selectedResources: resources }
      }), false, 'setSelectedResources'),

      setResourceLoading: (loading) => set((state) => ({
        resources: { ...state.resources, isLoading: loading }
      }), false, 'setResourceLoading'),

      setResourceError: (error) => set((state) => ({
        resources: { ...state.resources, error }
      }), false, 'setResourceError'),

      // UI actions
      setCurrentView: (view) => set((state) => ({
        ui: { ...state.ui, currentView: view }
      }), false, 'setCurrentView'),

      setSidebarCollapsed: (collapsed) => set((state) => ({
        ui: { ...state.ui, sidebarCollapsed: collapsed }
      }), false, 'setSidebarCollapsed'),

      setTheme: (theme) => set((state) => ({
        ui: { ...state.ui, theme }
      }), false, 'setTheme'),

      setUILoading: (loading) => set((state) => ({
        ui: { ...state.ui, isLoading: loading }
      }), false, 'setUILoading'),

      setNotification: (notification) => set((state) => ({
        ui: { ...state.ui, notification }
      }), false, 'setNotification'),

      clearNotification: () => set((state) => ({
        ui: { ...state.ui, notification: null }
      }), false, 'clearNotification'),

      // Global actions
      resetStore: () => set(initialState, false, 'resetStore')
    }),
    { name: 'simple-app-store' }
  )
);

