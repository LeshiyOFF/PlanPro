import { Resource } from '@/types/resource-types';
import { IWorkCalendar } from '@/domain/calendar/interfaces/IWorkCalendar';

export interface TaskSegment {
  startDate: Date;
  endDate: Date;
}

/**
 * Назначение ресурса на задачу с указанием процента загрузки.
 * units = 1.0 означает 100% загрузки ресурса на эту задачу.
 */
export interface ResourceAssignment {
  resourceId: string;
  units: number;
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
  /** @deprecated Используйте resourceAssignments */
  resourceIds?: string[];
  /** Назначения ресурсов с указанием процента загрузки */
  resourceAssignments?: ResourceAssignment[];
  critical?: boolean;
  criticalPath?: boolean;
  milestone?: boolean;
  estimated?: boolean;
  baselineStartDate?: Date;
  baselineEndDate?: Date;
  slack?: number;
  totalSlack?: number;
  segments?: TaskSegment[];
  notes?: string;
}

export interface ProjectBaseline {
  id: string;
  name: string;
  createdAt: Date;
  taskDates: Record<string, { startDate: Date; endDate: Date }>;
}

export interface ProjectStore {
  tasks: Task[];
  resources: Resource[];
  calendars: IWorkCalendar[];
  baselines: ProjectBaseline[];
  activeBaselineId?: string;
  initialized: boolean;
  currentProjectId?: number;
  currentFilePath?: string;
  /** Имя менеджера проекта (ручное назначение) */
  projectManager?: string;
  isDirty: boolean;
  setTasks: (tasks: Task[]) => void;
  setProjectInfo: (id?: number, filePath?: string) => void;
  /** Установить менеджера проекта */
  setProjectManager: (manager: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, direction: 'up' | 'down') => void;
  setResources: (resources: Resource[]) => void;
  updateResource: (resourceId: string, updates: Partial<Resource>) => void;
  addResource: (resource: Resource) => void;
  deleteResource: (resourceId: string) => void;
  // Календари
  setCalendars: (calendars: IWorkCalendar[]) => void;
  addCalendar: (calendar: IWorkCalendar) => void;
  updateCalendar: (calendarId: string, updates: Partial<IWorkCalendar>) => void;
  deleteCalendar: (calendarId: string) => void;
  getCalendar: (calendarId: string) => IWorkCalendar | undefined;
  // Задачи
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
  recalculateCriticalPath: () => Promise<void>;
  saveBaseline: (name?: string) => void;
  deleteBaseline: (id: string) => void;
  setActiveBaseline: (id?: string) => void;
  setDirty: (dirty: boolean) => void;
  markClean: () => void;
}

