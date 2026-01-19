// Master Functionality Catalog типы
import type {
  ProjectAPI,
  TaskAPI,
  ResourceAPI,
  ViewAPI,
  Project,
  Task,
  Resource,
  Assignment,
  Dependency,
  View,
  ViewType,
  ProjectStatus,
  TaskStatus,
  ResourceType,
  DependencyType,
  ID,
  ValidationResult,
  ValidationError,
  DateUtils,
  DurationUtils,
  ValidationUtils,
  ExportFormat,
  ImportFormat,
  Filter,
  SortDefinition
} from '@/types'

// Master Functionality Catalog типы
import type {
  Project,
  ID,
  ProjectStatus,
  ValidationResult,
  ValidationError,
  ExportFormat,
  ImportFormat
} from '@/types'

import { EnvironmentConfig } from '@/config/EnvironmentConfig'

/**
 * Базовый HTTP клиент для Master Functionality Catalog
 */
export class BaseHttpClient {
  protected readonly baseUrl: string
  protected readonly headers: Record<string, string>

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || `${EnvironmentConfig.getApiBaseUrl()}/api`
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  /**
   * Выполнение HTTP запроса
   */
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...this.headers, ...options.headers }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  /**
   * Валидация проекта
   */
  protected validateProject(project: Partial<Project>): ValidationResult {
    const errors: ValidationError[] = []

    if (!project.name || project.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Название проекта обязательно',
        code: 'REQUIRED_FIELD'
      })
    }

    if (!project.startDate) {
      errors.push({
        field: 'startDate',
        message: 'Дата начала проекта обязательна',
        code: 'REQUIRED_FIELD'
      })
    }

    if (project.startDate && project.finishDate && project.startDate >= project.finishDate) {
      errors.push({
        field: 'finishDate',
        message: 'Дата окончания должна быть позже даты начала',
        code: 'INVALID_DATE_RANGE'
      })
    }

    if (project.status && !Object.values(ProjectStatus).includes(project.status)) {
      errors.push({
        field: 'status',
        message: 'Недопустимый статус проекта',
        code: 'INVALID_STATUS'
      })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    }
  }
}

// Создание экземпляра клиента по умолчанию
export const baseHttpClient = new BaseHttpClient()

