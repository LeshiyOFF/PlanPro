import {
  Task as CatalogTask,
  ProjectPriority,
  TaskStatus,
  TaskType
} from '@/types/Master_Functionality_Catalog';
import { Resource } from '@/types/resource-types';
import type { TaskSegment } from '@/types/task-types';
import { IWorkCalendar } from '@/domain/calendar/interfaces/IWorkCalendar';

export type { Resource, TaskSegment };

/**
 * Назначение ресурса на задачу с указанием процента загрузки.
 * units = 1.0 означает 100% загрузки ресурса на эту задачу.
 */
export interface ResourceAssignment {
  resourceId: string;
  units: number;
}

/** Задача с полем resourceAssignments (сторевая или каталоговая). */
export interface TaskWithResourceAssignments {
  resourceAssignments?: Array<{ resourceId: string }>;
}

/**
 * Возвращает массив id ресурсов задачи из resourceAssignments.
 * Унифицированный доступ для стора и каталога.
 */
export function getTaskResourceIds(task: TaskWithResourceAssignments): string[] {
  const assignments = task.resourceAssignments;
  if (!assignments || !Array.isArray(assignments)) return [];
  return assignments.map((a) => (typeof a.resourceId === 'string' ? a.resourceId : String(a.resourceId)));
}

/**
 * Расширенный интерфейс задачи для стора (Frontend Task)
 * Наследует базовые поля, но упрощает связи для плоского списка
 */
export interface Task extends Omit<CatalogTask, 'id' | 'parent' | 'children' | 'resources' | 'predecessors' | 'successors' | 'dates' | 'duration' | 'completion' | 'cost'> {
  id: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  duration: number; // в миллисекундах или днях (зависит от контекста)
  parentId?: string | null;
  children?: string[];
  predecessors?: string[];
  resourceAssignments?: ResourceAssignment[];
  baselineStartDate?: Date;
  baselineEndDate?: Date;
  slack?: number;
  totalSlack?: number;
  segments?: TaskSegment[];
  /** Цвет отображения (Gantt, WBS, Calendar). */
  color?: string;
  /** Признак критического пути (алиас для isCritical). */
  criticalPath?: boolean;
  /** ID ресурсов, назначенных на задачу (удобный доступ, дублирует resourceAssignments). */
  resourceIds?: string[];
  /** Начало (алиас для startDate). */
  start?: Date;
  /** Окончание (алиас для endDate). */
  finish?: Date;
  /** Позиция на сетевой диаграмме (NetworkView). */
  x?: number;
  y?: number;
  isPinned?: boolean;
}

/** Минимальный набор полей для создания задачи из UI (вид, форма). */
export type TaskCreatePayload = Pick<Task, 'id' | 'name' | 'startDate' | 'endDate' | 'progress'> & Partial<Pick<Task, 'color' | 'level' | 'predecessors' | 'resourceAssignments' | 'parentId'>>;

/**
 * Создаёт полный Task из минимального набора полей (для addTask из views).
 * Подставляет значения по умолчанию для обязательных полей каталога.
 */
export function createTaskFromView(payload: TaskCreatePayload): Task {
  const start = payload.startDate;
  const end = payload.endDate;
  const durationMs = end.getTime() - start.getTime();
  const durationDays = Math.max(1, Math.round(durationMs / (24 * 60 * 60 * 1000)));
  return {
    ...payload,
    type: TaskType.FIXED_DURATION,
    status: TaskStatus.NOT_STARTED,
    priority: ProjectPriority.MEDIUM,
    wbs: '1',
    level: payload.level ?? 1,
    position: 0,
    duration: durationDays,
    notes: '',
    milestones: [],
    customFields: [],
    constraints: [],
    isCritical: false,
    isMilestone: false,
    isSummary: false,
    isExternal: false,
    predecessors: payload.predecessors ?? [],
    resourceAssignments: payload.resourceAssignments ?? [],
    startDate: start,
    endDate: end,
    progress: payload.progress ?? 0
  };
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

