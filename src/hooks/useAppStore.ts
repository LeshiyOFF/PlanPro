import { useAppStore } from '../store/appStore';
import type { 
  ExtendedAppState,
  ProjectState, 
  TaskState, 
  ResourceState, 
  UIState,
  ValidationErrors,
  ResourceAllocation,
  TaskDependencies,
  TaskResourceAssignments
} from '../types/Master_Functionality_Catalog';
import * as selectors from '../store/selectors';

// Main store hook
export const useAppStoreState = (): ExtendedAppState => useAppStore();

// Project hooks
export const useProjectState = (): ProjectState => useAppStore(selectors.selectProjectState);
export const useCurrentProject = () => useAppStore(selectors.selectCurrentProject);
export const useProjectLoading = (): boolean => useAppStore(selectors.selectProjectLoading);
export const useProjectError = (): string | null => useAppStore(selectors.selectProjectError);

// Task hooks
export const useTaskState = (): TaskState => useAppStore(selectors.selectTaskState);
export const useCurrentTask = () => useAppStore(selectors.selectCurrentTask);
export const useSelectedTasks = (): string[] => useAppStore(selectors.selectSelectedTasks);
export const useTaskLoading = (): boolean => useAppStore(selectors.selectTaskLoading);
export const useTaskError = (): string | null => useAppStore(selectors.selectTaskError);

// Resource hooks
export const useResourceState = (): ResourceState => useAppStore(selectors.selectResourceState);
export const useCurrentResource = () => useAppStore(selectors.selectCurrentResource);
export const useSelectedResources = (): string[] => useAppStore(selectors.selectSelectedResources);
export const useResourceLoading = (): boolean => useAppStore(selectors.selectResourceLoading);
export const useResourceError = (): string | null => useAppStore(selectors.selectResourceError);

// UI hooks
export const useUIState = (): UIState => useAppStore(selectors.selectUIState);
export const useCurrentView = () => useAppStore(selectors.selectCurrentView);
export const useSidebarVisible = (): boolean => useAppStore(selectors.selectSidebarVisible);
export const useNotifications = () => useAppStore(selectors.selectNotifications);
export const useUILoading = (): boolean => useAppStore(selectors.selectUILoading);

// Composite hooks
export const useIsAnyLoading = (): boolean => useAppStore(selectors.selectIsAnyLoading);
export const useHasAnyErrors = (): boolean => useAppStore(selectors.selectHasAnyErrors);
export const useCanEditCurrentProject = (): boolean => useAppStore(selectors.canEditCurrentProject);
export const useCanEditCurrentTask = (): boolean => useAppStore(selectors.canEditCurrentTask);
export const useCanEditCurrentResource = (): boolean => useAppStore(selectors.canEditCurrentResource);
export const useSelectedTasksCount = (): number => useAppStore(selectors.selectSelectedTasksCount);
export const useSelectedResourcesCount = (): number => useAppStore(selectors.selectSelectedResourcesCount);
export const useHasActiveNotifications = (): boolean => useAppStore(selectors.selectHasActiveNotifications);

// Action hooks
export const useProjectActions = () => {
  const setProjectState = useAppStore((state) => state.setProjectState);
  const setCurrentProject = useAppStore((state) => state.setCurrentProject);
  const setProjectLoading = useAppStore((state) => state.setProjectLoading);
  const setProjectError = useAppStore((state) => state.setProjectError);

  return {
    setProjectState,
    setCurrentProject,
    setProjectLoading,
    setProjectError
  };
};

export const useTaskActions = () => {
  const setTaskState = useAppStore((state) => state.setTaskState);
  const setCurrentTask = useAppStore((state) => state.setCurrentTask);
  const setSelectedTasks = useAppStore((state) => state.setSelectedTasks);
  const setTaskLoading = useAppStore((state) => state.setTaskLoading);
  const setTaskError = useAppStore((state) => state.setTaskError);

  return {
    setTaskState,
    setCurrentTask,
    setSelectedTasks,
    setTaskLoading,
    setTaskError
  };
};

export const useResourceActions = () => {
  const setResourceState = useAppStore((state) => state.setResourceState);
  const setCurrentResource = useAppStore((state) => state.setCurrentResource);
  const setSelectedResources = useAppStore((state) => state.setSelectedResources);
  const setResourceLoading = useAppStore((state) => state.setResourceLoading);
  const setResourceError = useAppStore((state) => state.setResourceError);

  return {
    setResourceState,
    setCurrentResource,
    setSelectedResources,
    setResourceLoading,
    setResourceError
  };
};

export const useUIActions = () => {
  const setUIState = useAppStore((state) => state.setUIState);
  const setCurrentView = useAppStore((state) => state.setCurrentView);
  const setSidebarCollapsed = useAppStore((state) => state.setSidebarCollapsed);
  const setNotification = useAppStore((state) => state.setNotification);
  const clearNotification = useAppStore((state) => state.clearNotification);

  return {
    setUIState,
    setCurrentView,
    setSidebarCollapsed,
    setNotification,
    clearNotification
  };
};

export const useGlobalActions = () => {
  const resetStore = useAppStore((state) => state.resetStore);
  const initializeStore = useAppStore((state) => state.initializeStore);

  return {
    resetStore,
    initializeStore
  };
};
