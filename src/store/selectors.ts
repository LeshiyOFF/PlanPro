import type { ExtendedAppState, ProjectState, TaskState, ResourceState, UIState } from '../types/Master_Functionality_Catalog';

// Project selectors
export const selectProjectState = (state: ExtendedAppState): ProjectState => state.projects;
export const selectCurrentProject = (state: ExtendedAppState) => state.projects.current;
export const selectProjectLoading = (state: ExtendedAppState): boolean => state.projects.loading;
export const selectProjectError = (state: ExtendedAppState): string | null => state.projects.error;

// Task selectors
export const selectTaskState = (state: ExtendedAppState): TaskState => state.tasks;
export const selectCurrentTask = (state: ExtendedAppState) => state.tasks.currentTask;
export const selectSelectedTasks = (state: ExtendedAppState): string[] => state.tasks.selectedTasks;
export const selectTaskLoading = (state: ExtendedAppState): boolean => state.tasks.isLoading;
export const selectTaskError = (state: ExtendedAppState): string | null => state.tasks.error;

// Resource selectors
export const selectResourceState = (state: ExtendedAppState): ResourceState => state.resources;
export const selectCurrentResource = (state: ExtendedAppState) => state.resources.currentResource;
export const selectSelectedResources = (state: ExtendedAppState): string[] => state.resources.selectedResources;
export const selectResourceLoading = (state: ExtendedAppState): boolean => state.resources.isLoading;
export const selectResourceError = (state: ExtendedAppState): string | null => state.resources.error;

// UI selectors
export const selectUIState = (state: ExtendedAppState): UIState => state.ui;
export const selectCurrentView = (state: ExtendedAppState) => state.ui.currentView;
export const selectSidebarVisible = (state: ExtendedAppState): boolean => state.ui.sidebarVisible;
export const selectSelectedUITasks = (state: ExtendedAppState): string[] => state.ui.selectedTasks;
export const selectSelectedUIResources = (state: ExtendedAppState): string[] => state.ui.selectedResources;
export const selectNotifications = (state: ExtendedAppState) => state.ui.notifications;
export const selectUILoading = (state: ExtendedAppState): boolean => state.projects.loading || state.tasks.isLoading || state.resources.isLoading;

// Composite selectors
export const selectIsAnyLoading = (state: ExtendedAppState): boolean => 
  state.projects.loading || state.tasks.isLoading || state.resources.isLoading;

export const selectHasAnyErrors = (state: ExtendedAppState): boolean => 
  !!(state.projects.error || state.tasks.error || state.resources.error);

export const canEditCurrentProject = (state: ExtendedAppState): boolean => 
  !!state.projects.current && !state.projects.loading && !state.projects.error;

export const canEditCurrentTask = (state: ExtendedAppState): boolean => 
  !!state.tasks.currentTask && !state.tasks.isLoading && !state.tasks.error;

export const canEditCurrentResource = (state: ExtendedAppState): boolean => 
  !!state.resources.currentResource && !state.resources.isLoading && !state.resources.error;

export const selectSelectedTasksCount = (state: ExtendedAppState): number => 
  state.tasks.selectedTasks.length;

export const selectSelectedResourcesCount = (state: ExtendedAppState): number => 
  state.resources.selectedResources.length;

export const selectHasActiveNotifications = (state: ExtendedAppState): boolean =>
  state.ui.notifications.length > 0;

