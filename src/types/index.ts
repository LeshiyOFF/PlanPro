/**
 * Центральный файл экспорта всех типов ProjectLibre
 * Интегрирован с Master Functionality Catalog для полного покрытия функциональности
 */

// Экспорт типов задач
export * from './task-types'

// Экспорт типов ресурсов
export * from './resource-types'

// Экспорт типов проектов
export * from './project-types'

// Экспорт типов календарей
export * from './calendar-types'

// Экспорт типов диаграммы Ганта
export * from './gantt-types'

// Экспорт кнопочных типов
export * from './button-types'

// Экспорт типов контекста
export * from './context-types'

// Экспорт типов IPC
export * from './ipc'

// Экспорт типов Sheet
export * from './sheet'

// Экспорт типов Gantt
export * from './gantt'

// Специфические экспорты для избежания дубликатов
export type { ApiResponse as ApiResponseFromApi } from './api-types'
export type { ApiResponse as ApiResponseFromWrapper } from './response-wrapper-types'
export type { MessageBoxOptions as MessageBoxOptionsFromUi } from './ui/message-box-types'

// Экспорт типов запросов API
export * from './api/request-types'

// Типизированный контракт FileAPI (из api)
export type { FileAPI } from './api/file-api.types'

// Экспорт типов из Master Catalog (для обратной совместимости)
export type {
  ID,
  Duration,
  Percentage,
  Currency,
  ProjectPriority,
  ProjectStatus,
  ExportFormat,
  ImportFormat,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ProjectAPI,
  TaskAPI,
  ResourceAPI,
  DependencyType,
} from './Master_Functionality_Catalog'

// Конфигурация API-клиентов (используется хуками useProjectAPI, useTaskAPI и т.д.)
export type { APIClientConfig } from '@/services/BaseAPIClient'

// Экспорт типов справочной системы
export * from './help'
