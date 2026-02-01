// Master Functionality Catalog типы
import type {
  TaskAPI,
  Task,
  ID,
  Dependency,
  DependencyType,
  Percentage,
  ValidationResult,
  ValidationError,
  StrictData,
} from '../types/Master_Functionality_Catalog'

import { BaseAPIClient, type APIClientConfig, APIError } from './BaseAPIClient'
import { ValidationException } from '@/errors/ValidationError'
import { getErrorMessage, type CaughtError, toCaughtError } from '@/errors/CaughtError'

/**
 * Валидация задачи перед отправкой
 * Следует Single Responsibility Principle
 */
class TaskValidator {
  /**
   * Валидация задачи
   */
  static validateTask(task: Partial<Task>): ValidationResult {
    const errors: ValidationError[] = []

    if (!task.name || task.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Название задачи обязательно',
        code: 'REQUIRED_FIELD',
      })
    }

    if (task.duration) {
      const durationValue = typeof task.duration === 'number' ? task.duration : task.duration.value
      if (durationValue <= 0) {
        errors.push({
          field: 'duration',
          message: 'Длительность должна быть положительной',
          code: 'INVALID_DURATION',
        })
      }
    }

    if (task.completion !== undefined) {
      const completionValue = typeof task.completion === 'number' ? task.completion : task.completion.value
      if (completionValue < 0 || completionValue > 100) {
        errors.push({
          field: 'completion',
          message: 'Процент выполнения должен быть от 0 до 100',
          code: 'INVALID_COMPLETION',
        })
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
    }
  }
}

/**
 * Типизированный TaskAPI клиент
 * Реализует интерфейс TaskAPI из Master Functionality Catalog
 * Следует SOLID принципам и Clean Architecture
 */
export class TaskAPIClient extends BaseAPIClient implements TaskAPI {
  constructor(config?: APIClientConfig) {
    super({
      timeout: config?.timeout || 5000,
      ...config,
    })
  }

  /**
   * Получение всех задач проекта
   */
  async getTasks(projectId: ID): Promise<Task[]> {
    try {
      const response = await this.get<Task[]>(`/projects/${projectId.value}/tasks`)
      return response.data
    } catch (error) {
      throw this.handleTaskError(toCaughtError(error), 'Failed to fetch tasks')
    }
  }

  /**
   * Получение задачи по ID
   */
  async getTask(id: ID): Promise<Task> {
    try {
      const response = await this.get<Task>(`/tasks/${id.value}`)
      return response.data
    } catch (error) {
      throw this.handleTaskError(toCaughtError(error), `Failed to fetch task ${id.value}`)
    }
  }

  /**
   * Создание новой задачи
   */
  async createTask(task: Partial<Task>): Promise<Task> {
    // Валидация перед созданием
    const validation = TaskValidator.validateTask(task)
    if (!validation.valid) {
      throw new ValidationException(
        `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
        validation.errors,
      )
    }

    try {
      const response = await this.post<Task>('/tasks', task as StrictData)
      return response.data
    } catch (error) {
      throw this.handleTaskError(toCaughtError(error), 'Failed to create task')
    }
  }

  /**
   * Обновление задачи
   */
  async updateTask(id: ID, task: Partial<Task>): Promise<Task> {
    // Валидация перед обновлением
    const validation = TaskValidator.validateTask(task)
    if (!validation.valid) {
      throw new ValidationException(
        `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
        validation.errors,
      )
    }

    try {
      const response = await this.put<Task>(`/tasks/${id.value}`, task as StrictData)
      return response.data
    } catch (error) {
      throw this.handleTaskError(toCaughtError(error), `Failed to update task ${id.value}`)
    }
  }

  /**
   * Удаление задачи
   */
  async deleteTask(id: ID): Promise<void> {
    try {
      await this.delete<void>(`/tasks/${id.value}`)
    } catch (error) {
      throw this.handleTaskError(toCaughtError(error), `Failed to delete task ${id.value}`)
    }
  }

  /**
   * Перемещение задачи
   */
  async moveTask(taskId: ID, newParentId?: ID, position?: number): Promise<void> {
    try {
      await this.post<void>(`/tasks/${taskId.value}/move`, {
        newParentId: newParentId?.value,
        position,
      } as StrictData)
    } catch (error) {
      throw this.handleTaskError(toCaughtError(error), `Failed to move task ${taskId.value}`)
    }
  }

  /**
   * Создание связи между задачами
   */
  async linkTasks(predecessorId: ID, successorId: ID, type: DependencyType): Promise<Dependency> {
    try {
      const body: StrictData = {
        predecessorId: predecessorId.value,
        successorId: successorId.value,
        type: type as string,
      }
      const response = await this.post<Dependency>('/tasks/link', body)
      return response.data
    } catch (error) {
      throw this.handleTaskError(toCaughtError(error), 'Failed to link tasks')
    }
  }

  /**
   * Удаление связи между задачами
   */
  async unlinkTasks(predecessorId: ID, successorId: ID): Promise<void> {
    try {
      const body: StrictData = {
        predecessorId: predecessorId.value,
        successorId: successorId.value,
      }
      await this.post<void>('/tasks/unlink', body)
    } catch (error) {
      throw this.handleTaskError(toCaughtError(error), 'Failed to unlink tasks')
    }
  }

  /**
   * Обновление прогресса задачи
   */
  async updateTaskProgress(taskId: ID, completion: Percentage): Promise<Task> {
    try {
      const body: StrictData = {
        completion: typeof completion === 'number' ? completion : Number(completion),
      }
      const response = await this.put<Task>(`/tasks/${taskId.value}/progress`, body)
      return response.data
    } catch (error) {
      throw this.handleTaskError(toCaughtError(error), `Failed to update task progress ${taskId.value}`)
    }
  }

  /**
   * Назначение ресурсов на задачу
   */
  async assignResources(taskId: ID, resourceIds: ID[], units: Percentage): Promise<void> {
    try {
      const body: StrictData = {
        resourceIds: resourceIds.map((id) => id.value),
        units: typeof units === 'number' ? units : Number(units),
      }
      await this.post<void>(`/tasks/${taskId.value}/assignments`, body)
    } catch (error) {
      throw this.handleTaskError(toCaughtError(error), `Failed to assign resources to task ${taskId.value}`)
    }
  }

  /**
   * Поиск задач по параметрам
   */
  async searchTasks(projectId: ID, params: {
    name?: string;
    status?: string;
    assignee?: string;
    priority?: string;
    limit?: number;
    page?: number;
  }): Promise<Task[]> {
    try {
      const response = await this.get<Task[]>(`/projects/${projectId.value}/tasks/search`, params as Record<string, string | number | boolean | undefined>)
      return response.data
    } catch (error) {
      throw this.handleTaskError(toCaughtError(error), 'Failed to search tasks')
    }
  }

  /**
   * Получение подзадач
   */
  async getSubtasks(parentId: ID): Promise<Task[]> {
    try {
      const response = await this.get<Task[]>(`/tasks/${parentId.value}/subtasks`)
      return response.data
    } catch (error) {
      throw this.handleTaskError(toCaughtError(error), `Failed to fetch subtasks ${parentId.value}`)
    }
  }

  /**
   * Обработка ошибок специфичных для задач
   * Следует Single Responsibility Principle
   */
  private handleTaskError(error: CaughtError, context: string): Error {
    if (ValidationException.isValidationException(error)) {
      return new ValidationException(
        `${context}: ${error.formatErrors()}`,
        error.validationErrors,
      )
    }

    if (error instanceof APIError && error.details && typeof error.details === 'object') {
      const details = error.details as Record<string, StrictData & { validationErrors?: Array<Record<string, string>> }>
      if (Array.isArray(details.validationErrors)) {
        const validationErrors: ValidationError[] = details.validationErrors.map((e: StrictData) => {
          const r = e && typeof e === 'object' && !Array.isArray(e) ? (e as Record<string, string>) : {}
          return { field: r.field ?? '', message: r.message ?? '', code: r.code ?? 'VALIDATION_ERROR' }
        })
        return new ValidationException(
          `${context}: ${String(details.message || 'Validation failed')}`,
          validationErrors,
        )
      }
    }

    if (error instanceof Error) {
      return new Error(`${context}: ${error.message}`)
    }

    return new Error(`${context}: ${getErrorMessage(error)}`)
  }
}

