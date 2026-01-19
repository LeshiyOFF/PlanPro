// Master Functionality Catalog типы
import type {
  Task,
  ID,
  TaskStatus,
  TaskType,
  ValidationResult,
  ValidationError,
  DependencyType
} from '@/types'

import { EnvironmentConfig } from '@/config/EnvironmentConfig'

/**
 * Сервис для работы с задачами
 */
export class MasterCatalogTaskService {
  private readonly baseUrl: string
  private readonly headers: Record<string, string>

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || `${EnvironmentConfig.getApiBaseUrl()}/api`
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  /**
   * Валидация задачи
   */
  validateTask(task: Partial<Task>): ValidationResult {
    const errors: ValidationError[] = []

    if (!task.name || task.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Название задачи обязательно',
        code: 'REQUIRED_FIELD'
      })
    }

    if (!task.duration || task.duration.value <= 0) {
      errors.push({
        field: 'duration',
        message: 'Длительность должна быть положительной',
        code: 'INVALID_DURATION'
      })
    }

    if (task.status && !Object.values(TaskStatus).includes(task.status)) {
      errors.push({
        field: 'status',
        message: 'Недопустимый статус задачи',
        code: 'INVALID_STATUS'
      })
    }

    if (task.type && !Object.values(TaskType).includes(task.type)) {
      errors.push({
        field: 'type',
        message: 'Недопустимый тип задачи',
        code: 'INVALID_TYPE'
      })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    }
  }

  /**
   * Создание задачи
   */
  async createTask(task: Partial<Task>): Promise<Task> {
    const validation = this.validateTask(task)
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
    }
    
    const response = await fetch(`${this.baseUrl}/tasks`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(task)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Получение задачи по ID
   */
  async getTask(id: ID): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/tasks/${id.value}`, {
      headers: this.headers
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Обновление задачи
   */
  async updateTask(id: ID, task: Partial<Task>): Promise<Task> {
    const validation = this.validateTask(task)
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
    }
    
    const response = await fetch(`${this.baseUrl}/tasks/${id.value}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(task)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Удаление задачи
   */
  async deleteTask(id: ID): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tasks/${id.value}`, {
      method: 'DELETE',
      headers: this.headers
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  }
}

