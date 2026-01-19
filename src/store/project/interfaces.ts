import { Resource } from '@/types/resource-types';

export interface TaskSegment {
  startDate: Date;
  endDate: Date;
}

export interface Task {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  color: string;
  level: number;
  summary?: boolean;
  type?: string;
  children?: string[];
  predecessors?: string[];
  resourceIds?: string[];
  critical?: boolean;
  criticalPath?: boolean;
  milestone?: boolean;
  estimated?: boolean;
  baselineStartDate?: Date;
  baselineEndDate?: Date;
  segments?: TaskSegment[];
  notes?: string;
}

export interface ProjectStore {
  tasks: Task[];
  resources: Resource[];
  initialized: boolean;
  currentProjectId?: number;
  currentFilePath?: string;
  isDirty: boolean;
  setTasks: (tasks: Task[]) => void;
  setProjectInfo: (id?: number, filePath?: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, direction: 'up' | 'down') => void;
  setResources: (resources: Resource[]) => void;
  updateResource: (resourceId: string, updates: Partial<Resource>) => void;
  addResource: (resource: Resource) => void;
  deleteResource: (resourceId: string) => void;
  indentTask: (taskId: string) => void;
  outdentTask: (taskId: string) => void;
  linkTasks: (sourceId: string, targetId: string) => void;
  unlinkTasks: (taskId: string) => void;
  toggleMilestone: (taskId: string) => void;
  isValidPredecessor: (taskId: string, potentialPredId: string) => boolean;
  recalculateAllTasks: () => void;
  setInitialized: (initialized: boolean) => void;
  reset: () => void;
  getHoursPerDay: () => number;
  splitTask: (taskId: string, splitDate: Date, gapDays: number) => void;
  mergeTask: (taskId: string) => void;
  setDirty: (dirty: boolean) => void;
  markClean: () => void;
}
