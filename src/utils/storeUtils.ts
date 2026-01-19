import type { 
  AppState, 
  ProjectState, 
  TaskState, 
  ResourceState, 
  UIState,
  ValidationError,
  ResourceAllocation,
  TaskDependencies,
  TaskResourceAssignments
} from '../types/Master_Functionality_Catalog';

type ValidationErrors = Record<string, string[]>;

// Type guards for store state validation
export const isValidProjectState = (state: any): state is ProjectState => {
  return (
    state &&
    typeof state.currentProject === 'string' && 
    Array.isArray(state.recentProjects) &&
    Array.isArray(state.projectTemplates) &&
    typeof state.isLoading === 'boolean' &&
    (state.error === null || typeof state.error === 'string') &&
    (state.validationErrors === null || typeof state.validationErrors === 'object')
  );
};

export const isValidTaskState = (state: any): state is TaskState => {
  return (
    state &&
    typeof state.currentTask === 'string' &&
    Array.isArray(state.selectedTasks) &&
    typeof state.taskDependencies === 'object' &&
    typeof state.taskResourceAssignments === 'object' &&
    typeof state.isLoading === 'boolean' &&
    (state.error === null || typeof state.error === 'string') &&
    (state.validationErrors === null || typeof state.validationErrors === 'object')
  );
};

export const isValidResourceState = (state: any): state is ResourceState => {
  return (
    state &&
    typeof state.currentResource === 'string' &&
    Array.isArray(state.selectedResources) &&
    Array.isArray(state.resourceAllocation) &&
    typeof state.isLoading === 'boolean' &&
    (state.error === null || typeof state.error === 'string') &&
    (state.validationErrors === null || typeof state.validationErrors === 'object')
  );
};

export const isValidUIState = (state: any): state is UIState => {
  return (
    state &&
    typeof state.currentView === 'string' &&
    typeof state.sidebarCollapsed === 'boolean' &&
    typeof state.theme === 'string' &&
    typeof state.language === 'string' &&
    typeof state.isLoading === 'boolean' &&
    (state.notification === null || typeof state.notification === 'object')
  );
};

export const isValidAppState = (state: any): state is AppState => {
  return (
    state &&
    isValidProjectState(state.projects) &&
    isValidTaskState(state.tasks) &&
    isValidResourceState(state.resources) &&
    isValidUIState(state.ui)
  );
};

// Utility functions for state operations
export const createValidationError = (
  field: string,
  message: string
): ValidationErrors => ({
  [field]: [message]
});

export const addValidationError = (
  errors: ValidationErrors | null,
  field: string,
  message: string
): ValidationErrors => {
  if (!errors) return createValidationError(field, message);
  
  return {
    ...errors,
    [field]: [...(errors[field] || []), message]
  };
};

export const removeValidationError = (
  errors: ValidationErrors | null,
  field: string
): ValidationErrors | null => {
  if (!errors) return null;
  
  const { [field]: removed, ...rest } = errors;
  return Object.keys(rest).length === 0 ? null : rest;
};

export const hasValidationErrors = (errors: ValidationErrors | null): boolean => {
  return errors !== null && Object.keys(errors).length > 0;
};

export const getValidationErrorsForField = (
  errors: ValidationErrors | null,
  field: string
): string[] => {
  return errors?.[field] || [];
};

// Resource allocation utilities
export const createResourceAllocation = (
  resourceId: string,
  taskId: string,
  percentage: number
): ResourceAllocation => ({
  resourceId,
  taskId,
  percentage,
  startDate: new Date().toISOString(),
  endDate: new Date().toISOString()
});

export const validateResourceAllocation = (
  allocation: ResourceAllocation
): string[] => {
  const errors: string[] = [];
  
  if (!allocation.resourceId) {
    errors.push('Resource ID is required');
  }
  
  if (!allocation.taskId) {
    errors.push('Task ID is required');
  }
  
  if (allocation.percentage < 0 || allocation.percentage > 100) {
    errors.push('Percentage must be between 0 and 100');
  }
  
  if (!allocation.startDate) {
    errors.push('Start date is required');
  }
  
  if (!allocation.endDate) {
    errors.push('End date is required');
  }
  
  return errors;
};

// Task dependencies utilities
export const addTaskDependency = (
  dependencies: TaskDependencies,
  taskId: string,
  dependsOnTaskId: string
): TaskDependencies => ({
  ...dependencies,
  [taskId]: [...(dependencies[taskId] || []), dependsOnTaskId]
});

export const removeTaskDependency = (
  dependencies: TaskDependencies,
  taskId: string,
  dependsOnTaskId: string
): TaskDependencies => {
  if (!dependencies[taskId]) return dependencies;
  
  const updated = dependencies[taskId]!.filter((id: string) => id !== dependsOnTaskId);
  
  return updated.length === 0
    ? { ...dependencies, [taskId]: undefined }
    : { ...dependencies, [taskId]: updated };
};

// Task resource assignments utilities
export const addTaskResourceAssignment = (
  assignments: TaskResourceAssignments,
  taskId: string,
  resourceId: string
): TaskResourceAssignments => ({
  ...assignments,
  [taskId]: [...(assignments[taskId] || []), resourceId]
});

export const removeTaskResourceAssignment = (
  assignments: TaskResourceAssignments,
  taskId: string,
  resourceId: string
): TaskResourceAssignments => {
  if (!assignments[taskId]) return assignments;
  
  const updated = assignments[taskId]!.filter((id: string) => id !== resourceId);
  
  return updated.length === 0
    ? { ...assignments, [taskId]: undefined }
    : { ...assignments, [taskId]: updated };
};

// Store state helpers
export const getStoreSize = (state: AppState): number => {
  return JSON.stringify(state).length;
};

export const getStoreSnapshot = (state: AppState): string => {
  return JSON.stringify(state, null, 2);
};

export const createStoreSummary = (state: AppState): {
  totalProjects: number;
  totalTasks: number;
  totalResources: number;
  totalAllocations: number;
  hasErrors: boolean;
  isLoading: boolean;
} => ({
  totalProjects: state.projects.recentProjects.length + state.projects.projectTemplates.length,
  totalTasks: state.tasks.selectedTasks.length + Object.keys(state.tasks.taskDependencies).length,
  totalResources: state.resources.selectedResources.length + state.resources.resourceAllocation.length,
  totalAllocations: state.resources.resourceAllocation.length,
  hasErrors: !!(state.projects.error || state.tasks.error || state.resources.error),
  isLoading: state.projects.isLoading || state.tasks.isLoading || state.resources.isLoading || state.ui.isLoading
});

// Performance monitoring
export const createStorePerformanceMonitor = () => {
  const timings = new Map<string, number[]>();
  
  const startTiming = (operation: string): void => {
    const start = performance.now();
    
    const endTiming = () => {
      const end = performance.now();
      const duration = end - start;
      
      if (!timings.has(operation)) {
        timings.set(operation, []);
      }
      
      timings.get(operation)!.push(duration);
    };
    
    return endTiming;
  };
  
  const getAverageTime = (operation: string): number => {
    const times = timings.get(operation) || [];
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  };
  
  const getStats = () => {
    const stats: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    for (const [operation, times] of timings.entries()) {
      stats[operation] = {
        avg: getAverageTime(operation),
        min: Math.min(...times),
        max: Math.max(...times),
        count: times.length
      };
    }
    
    return stats;
  };
  
  return { startTiming, getAverageTime, getStats };
};

