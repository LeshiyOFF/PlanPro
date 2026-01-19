/**
 * Конкретные типы для ответов API ProjectLibre
 * Заменяют использование `any` для строгой типизации
 */

// Базовые типы ответов
export interface BaseResponse {
  success: boolean
  message?: string
  timestamp?: Date
  requestId?: string
}

export interface DataResponse<T> extends BaseResponse {
  data: T
}

export interface ErrorResponse extends BaseResponse {
  success: false
  error: string
  errorCode?: string
  details?: Record<string, unknown>
}

// Ответы проекта
export interface ProjectResponse {
  id: string
  name: string
  description?: string
  status?: string
  priority?: string
  progress?: number
  startDate: Date
  endDate: Date
  taskIds?: string[]
  resourceIds?: string[]
  manager?: string
  department?: string
  createdAt: Date
  updatedAt: Date
}

export interface ProjectsListResponse {
  projects: ProjectResponse[]
  total: number
  page?: number
  pageSize?: number
}

// Ответы задач
export interface TaskResponse {
  id: string
  name: string
  description?: string
  status?: string
  priority?: string
  type?: string
  progress?: number
  projectId?: string
  parentId?: string
  resourceId?: string
  assignee?: string
  assigneeId?: string
  startDate?: Date
  endDate?: Date
  dueDate?: Date
  estimatedHours?: number
  actualHours?: number
  tags?: string
  notes?: string
  lastAssignedDate?: Date
  reportingTo?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface TasksListResponse {
  tasks: TaskResponse[]
  total: number
  projectId: string
}

// Ответы ресурсов
export interface ResourceResponse {
  id: string
  name: string
  type: string
  description?: string
  status?: string
  email?: string
  department?: string
  phone?: string
  location?: string
  costPerHour?: number
  available?: boolean
  skillIds?: string[]
  projectIds?: string[]
  totalHoursAssigned?: number
  notes?: string
  lastAssignedDate?: Date
  reportingTo?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface ResourcesListResponse {
  resources: ResourceResponse[]
  total: number
  projectId: string
}

// Ответы назначений
export interface AssignmentResponse {
  id: string
  taskId: string
  resourceId: string
  units: number
  work: number
  cost: number
  startDate?: Date
  endDate?: Date
  taskName?: string
  resourceName?: string
}

export interface AssignmentsListResponse {
  assignments: AssignmentResponse[]
  total: number
  taskId?: string
  resourceId?: string
}

// Ответы календаря
export interface CalendarResponse {
  id: string
  name: string
  workingDays: number[]
  workingHours: {
    start: string
    end: string
  }
  exceptions: CalendarException[]
  isDefault: boolean
  projectId?: string
  resourceId?: string
}

export interface CalendarException {
  date: Date
  isWorking: boolean
  hours?: number
  name?: string
  recurring?: boolean
}

// Ответы операций
export interface OperationResponse extends BaseResponse {
  operationId: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  progress?: number
  result?: unknown
}

// Ответы экспорта/импорта
export interface ExportResponse extends BaseResponse {
  filePath: string
  format: 'pod' | 'mpp' | 'xml' | 'pdf'
  size: number
}

export interface ImportResponse extends BaseResponse {
  projectId: string
  importedTasks: number
  importedResources: number
  importedAssignments: number
  conflicts?: {
    type: 'duplicate' | 'invalid' | 'missing-dependency'
    message: string
    item: string
  }[]
}

// Ответы конфигурации
export interface ConfigurationResponse extends BaseResponse {
  config: {
    general?: {
      dateFormat: string
      timeFormat: string
      currency: string
      language: string
    }
    calculation?: {
      autoRecalculate: boolean
      taskMode: 'auto' | 'manual'
      calendarType: 'standard' | 'custom'
    }
    display?: {
      showCriticalPath: boolean
      showSlack: boolean
      theme: 'light' | 'dark' | 'system'
    }
    editing?: {
      autoSave: boolean
      autoSaveInterval: number
      undoLevels: number
    }
  }
}

// Ответы статуса API
export interface ApiStatusResponse extends BaseResponse {
  status: 'healthy' | 'degraded' | 'offline'
  uptime: number
  version: string
  javaVersion?: string
  memoryUsage?: {
    used: number
    max: number
    percentage: number
  }
  activeProjects?: number
  activeTasks?: number
}

// Ответы отчётов
export interface ReportResponse extends BaseResponse {
  reportId: string
  reportType: 'gantt' | 'resource-usage' | 'cost-summary' | 'timeline' | 'custom'
  format: 'pdf' | 'html' | 'excel' | 'xml'
  filePath?: string
  data?: unknown
  generatedAt: Date
}

// Ответы RPC команд
export interface RpcCommandResponse extends BaseResponse {
  success: boolean
  data?: unknown
  error?: string
}

// Ответы конфигурации (статус)
export interface ConfigStatusResponse extends BaseResponse {
  status: string
  timestamp: number
}

// Ответы Undo/Redo операций
export interface UndoRedoOperationResponse extends BaseResponse {
  success: boolean
  canUndo: boolean
  canRedo: boolean
}

// Ответы очистки Undo/Redo
export interface UndoRedoClearResponse extends BaseResponse {
  status: string
}

// Ответы состояния Undo/Redo
export interface UndoRedoState {
  canUndo: boolean
  canRedo: boolean
  undoName?: string
  redoName?: string
  editHistory?: string[]
  historySize?: number
}

// Ответы файловых диалогов
export interface FileDialogResponse extends BaseResponse {
  filePath?: string
  filePaths?: string[]
  canceled: boolean
}

// Ответы нативного .pod хранилища
export interface FileSaveResponse extends BaseResponse {
  success: boolean
  filePath?: string
  backupPath?: string
  format?: string
  projectId?: number
  error?: string
}

export interface FileLoadResponse extends BaseResponse {
  success: boolean
  filePath?: string
  projectName?: string
  projectId?: number
  format?: string
  error?: string
}

export interface FileListResponse extends BaseResponse {
  success: boolean
  files?: string[]
  basePath?: string
  count?: number
  error?: string
}

/**
 * Задача из Core модели ProjectLibre.
 * Формат соответствует структуре CoreTaskDto на бэкенде.
 */
export interface CoreTaskData {
  id: string
  name: string
  startDate: string  // ISO 8601
  endDate: string    // ISO 8601
  progress: number   // 0-100
  color: string
  level: number
  summary: boolean
  type: string
  children?: string[]
  predecessors?: string[]
  resourceIds?: string[]
  critical: boolean
  milestone: boolean
  notes?: string
  wbs?: string
}

/**
 * Ресурс из Core модели ProjectLibre.
 * Формат соответствует структуре CoreResourceDto на бэкенде.
 */
export interface CoreResourceData {
  id: string
  name: string
  type: string  // 'Work' | 'Material' | 'Cost'
  maxUnits: number
  standardRate: number
  overtimeRate: number
  costPerUse: number
  email?: string
  group?: string
  calendarId?: string
  available: boolean
}

/**
 * Полные данные проекта (tasks + resources) из Core модели.
 * Ответ от GET /api/files/project/{id}/data
 */
export interface ProjectDataResponse extends BaseResponse {
  success: boolean
  projectId?: number
  projectName?: string
  tasks?: CoreTaskData[]
  resources?: CoreResourceData[]
  startDate?: string
  endDate?: string
  taskCount?: number
  resourceCount?: number
  error?: string
}

// Ответ синхронизации задач
export interface TaskSyncResponse {
  success: boolean
  syncedCount: number
  skippedCount: number
  message: string
}
