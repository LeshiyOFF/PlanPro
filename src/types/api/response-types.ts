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
  startDate: Date
  endDate: Date
  tasks: TaskResponse[]
  resources: ResourceResponse[]
  assignments: AssignmentResponse[]
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
  projectId: string
  parentId?: string
  duration: number
  startDate: Date
  endDate: Date
  priority: 'low' | 'medium' | 'high'
  percentComplete: number
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed'
  dependencies: string[]
  assignments: string[]
  createdAt: Date
  updatedAt: Date
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
  type: 'work' | 'material' | 'cost'
  maxUnits: number
  standardRate: number
  overtimeRate: number
  currentAssignments?: number
  availability?: {
    from: Date
    to: Date
    available: boolean
  }
  createdAt: Date
  updatedAt: Date
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
