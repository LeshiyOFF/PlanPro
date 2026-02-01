/**
 * Конкретные типы для запросов API ProjectLibre
 * Заменяют использование `any` для строгой типизации
 */

import type { JsonObject, JsonValue } from '../json-types';

// Базовые типы запросов
export interface BaseRequest {
  id?: string
  timestamp?: Date
}

// Запросы проекта
export interface ProjectCreateRequest extends BaseRequest {
  name: string
  description?: string
  status?: string
  priority?: string
  progress?: number
  startDate?: Date
  endDate?: Date
  manager?: string
  department?: string
}

export interface ProjectUpdateRequest extends BaseRequest {
  name?: string
  description?: string
  status?: string
  priority?: string
  progress?: number
  startDate?: Date
  endDate?: Date
  manager?: string
  department?: string
  tasks?: FrontendTaskData[]
  resources?: FrontendResourceData[]
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
  description?: string
  status?: string
  priority?: string
  type?: string
  duration?: number
  startDate?: Date
  endDate?: Date
  dueDate?: Date
  percentComplete?: number
  estimatedHours?: number
  actualHours?: number
  assignee?: string
  assigneeId?: string
  tags?: string
  notes?: string
}

export interface TaskUpdateRequest extends BaseRequest {
  id: string
  name?: string
  description?: string
  status?: string
  priority?: string
  type?: string
  duration?: number
  startDate?: Date
  endDate?: Date
  dueDate?: Date
  percentComplete?: number
  estimatedHours?: number
  actualHours?: number
  parentId?: string
  assignee?: string
  assigneeId?: string
  tags?: string
  notes?: string
}

export interface TaskDeleteRequest extends BaseRequest {
  id: string
  projectId: string
}

// Запросы ресурсов
export interface ResourceCreateRequest extends BaseRequest {
  name: string
  type: string
  description?: string
  email?: string
  department?: string
  phone?: string
  location?: string
  maxUnits?: number
  standardRate?: number
  overtimeRate?: number
  costPerHour?: number
  available?: boolean
  notes?: string
}

export interface ResourceUpdateRequest extends BaseRequest {
  id: string
  name?: string
  description?: string
  email?: string
  department?: string
  phone?: string
  location?: string
  maxUnits?: number
  standardRate?: number
  overtimeRate?: number
  costPerHour?: number
  available?: boolean
  notes?: string
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

// Запросы конфигурации
export interface ConfigurationUpdateRequest extends BaseRequest {
  general?: {
    dateFormat?: string
    timeFormat?: string
    currency?: string
    language?: string
  }
  calculation?: {
    autoRecalculate?: boolean
    taskMode?: 'auto' | 'manual'
    calendarType?: 'standard' | 'custom'
  }
  display?: {
    showCriticalPath?: boolean
    showSlack?: boolean
    theme?: 'light' | 'dark' | 'system'
  }
  editing?: {
    autoSave?: boolean
    autoSaveInterval?: number
    undoLevels?: number
  }
}

// Запросы отчётов
export interface ReportGenerateRequest extends BaseRequest {
  projectId: string
  reportType: 'gantt' | 'resource-usage' | 'cost-summary' | 'timeline' | 'custom'
  format?: 'pdf' | 'html' | 'excel' | 'xml'
  filters?: JsonObject
  parameters?: JsonObject
}

// Запросы RPC команд (для Electron bridge)
export interface RpcCommandRequest extends BaseRequest {
  command: string
  args?: JsonValue[]
}

// Запросы файловых операций
export interface FileDialogRequest extends BaseRequest {
  mode: 'open' | 'save'
  title?: string
  defaultPath?: string
  filters?: {
    name: string
    extensions: string[]
  }[]
  multiSelect?: boolean
}

// Запросы Undo/Redo
export interface UndoRedoOperationRequest extends BaseRequest {
  projectId?: string
}

// Запросы для нативного .pod хранилища
export interface FileSaveRequest extends BaseRequest {
  projectId: number
  filePath?: string
  format?: 'pod' | 'mpp' | 'xml'
  createBackup?: boolean
}

export interface FileLoadRequest extends BaseRequest {
  filePath: string
  readOnly?: boolean
}

// Запрос синхронизации задач с Core
export interface TaskSyncRequest extends BaseRequest {
  projectId: number
  tasks: FrontendTaskData[]
}

/**
 * Назначение ресурса с указанием процента загрузки для синхронизации.
 */
export interface FrontendResourceAssignment {
  resourceId: string
  units: number  // 0.0-1.0 (0-100%)
}

/**
 * Данные задачи для синхронизации
 * V2.0: startDate/endDate изменены с number на string (ISO-8601)
 * V3.0: Добавлен resourceAssignments вместо resourceIds
 */
export interface FrontendTaskData {
  id: string
  name: string
  startDate: string    // ISO-8601 (например: "2026-01-28T18:37:19.575Z")
  endDate: string      // ISO-8601
  progress: number     // 0-100
  level: number
  summary: boolean
  milestone: boolean
  type: string
  predecessors: string[]
  children: string[]
  /** Назначения ресурсов с указанием процента загрузки */
  resourceAssignments: FrontendResourceAssignment[]
  notes: string
  color: string
  // critical исключен - вычисляется ядром CPM
}

/**
 * Данные календаря для синхронизации с бэкендом.
 * Соответствует CalendarSyncDto.java на бэкенде.
 * 
 * КРИТИЧЕСКОЕ: Передача полных настроек WorkWeek (рабочие дни, часы)
 * необходима для корректного сохранения кастомных календарей.
 */
export interface CalendarSyncData {
  id: string
  name: string
  description?: string
  workingDays: boolean[]
  workingHours: { from: number; to: number }[]
  hoursPerDay: number
  templateType?: string
}

// Данные ресурса для синхронизации
export interface FrontendResourceData {
  id: string
  name: string
  type: string
  maxUnits: number
  standardRate: number
  overtimeRate: number
  costPerUse: number
  calendarId?: string
  /**
   * Полные данные календаря для синхронизации.
   * КРИТИЧЕСКОЕ: Если указан calendarData, бэкенд применит настройки WorkWeek.
   * Это исправляет баг с потерей настроек кастомных календарей.
   */
  calendarData?: CalendarSyncData
  materialLabel?: string
  email?: string
  group?: string
  available?: boolean
}

// Unified запрос синхронизации проекта (задачи + ресурсы)
export interface ProjectSyncRequest extends BaseRequest {
  projectId: number
  tasks: FrontendTaskData[]
  resources: FrontendResourceData[]
}
