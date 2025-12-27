/**
 * Конкретные типы для запросов API ProjectLibre
 * Заменяют использование `any` для строгой типизации
 */

// Базовые типы запросов
export interface BaseRequest {
  id?: string
  timestamp?: Date
}

// Запросы проекта
export interface ProjectCreateRequest extends BaseRequest {
  name: string
  description?: string
  startDate?: Date
  endDate?: Date
}

export interface ProjectUpdateRequest extends BaseRequest {
  name?: string
  description?: string
  startDate?: Date
  endDate?: Date
}

export interface ProjectOpenRequest extends BaseRequest {
  filePath: string
  readOnly?: boolean
}

export interface ProjectSaveRequest extends BaseRequest {
  filePath?: string
  format?: 'pod' | 'mpp' | 'xml'
}

// Запросы задач
export interface TaskCreateRequest extends BaseRequest {
  name: string
  projectId: string
  parentId?: string
  duration?: number
  startDate?: Date
  endDate?: Date
  priority?: 'low' | 'medium' | 'high'
  percentComplete?: number
}

export interface TaskUpdateRequest extends BaseRequest {
  id: string
  name?: string
  duration?: number
  startDate?: Date
  endDate?: Date
  priority?: 'low' | 'medium' | 'high'
  percentComplete?: number
  parentId?: string
}

export interface TaskDeleteRequest extends BaseRequest {
  id: string
  projectId: string
}

// Запросы ресурсов
export interface ResourceCreateRequest extends BaseRequest {
  name: string
  type: 'work' | 'material' | 'cost'
  maxUnits?: number
  standardRate?: number
  overtimeRate?: number
}

export interface ResourceUpdateRequest extends BaseRequest {
  id: string
  name?: string
  maxUnits?: number
  standardRate?: number
  overtimeRate?: number
}

export interface ResourceDeleteRequest extends BaseRequest {
  id: string
  projectId: string
}

// Запросы назначений
export interface AssignmentCreateRequest extends BaseRequest {
  taskId: string
  resourceId: string
  units?: number
  work?: number
  cost?: number
}

export interface AssignmentUpdateRequest extends BaseRequest {
  id: string
  units?: number
  work?: number
  cost?: number
}

export interface AssignmentDeleteRequest extends BaseRequest {
  id: string
  taskId: string
  resourceId: string
}

// Запросы календаря
export interface CalendarGetRequest extends BaseRequest {
  projectId?: string
  resourceId?: string
}

export interface CalendarUpdateRequest extends BaseRequest {
  id: string
  name?: string
  workingDays?: number[]
  workingHours?: {
    start: string
    end: string
  }
  exceptions?: {
    date: Date
    isWorking: boolean
    hours?: number
  }[]
}
