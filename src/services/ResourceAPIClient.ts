// Master Functionality Catalog типы
import type {
  ResourceAPI,
  Resource,
  ID,
  Assignment,
  Percentage,
  ValidationResult,
  ValidationError,
  ResourceAvailability,
  StrictData,
} from '../types/Master_Functionality_Catalog'

import { BaseAPIClient, type APIClientConfig, APIError } from './BaseAPIClient'
import { getErrorMessage, type CaughtError, toCaughtError } from '@/errors/CaughtError'

/**
 * Валидация ресурса перед отправкой
 * Следует Single Responsibility Principle
 */
class ResourceValidator {
  /**
   * Валидация ресурса
   */
  static validateResource(resource: Partial<Resource>): ValidationResult {
    const errors: ValidationError[] = []

    if (!resource.name || resource.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Название ресурса обязательно',
        code: 'REQUIRED_FIELD',
      })
    }

    if (resource.cost) {
      const standardRate = typeof resource.cost.standardRate === 'number' ? resource.cost.standardRate : resource.cost.standardRate.amount
      if (standardRate < 0) {
        errors.push({
          field: 'cost.standardRate',
          message: 'Стандартная ставка не может быть отрицательной',
          code: 'INVALID_COST',
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
 * Расширенная ошибка валидации ресурса
 */
export class ResourceValidationError extends Error {
  constructor(message: string, public readonly validationErrors: ValidationError[]) {
    super(message)
    this.name = 'ResourceValidationError'
  }
}

/**
 * Типизированный ResourceAPI клиент
 * Реализует интерфейс ResourceAPI из Master Functionality Catalog
 * Следует SOLID принципам и Clean Architecture
 */
export class ResourceAPIClient extends BaseAPIClient implements ResourceAPI {
  constructor(config?: APIClientConfig) {
    super({
      timeout: config?.timeout || 5000,
      ...config,
    })
  }

  /**
   * Получение всех ресурсов проекта
   */
  async getResources(projectId: ID): Promise<Resource[]> {
    try {
      const response = await this.get<Resource[]>(`/projects/${projectId.value}/resources`)
      return response.data
    } catch (error) {
      throw this.handleResourceError(toCaughtError(error), 'Failed to fetch resources')
    }
  }

  /**
   * Получение ресурса по ID
   */
  async getResource(id: ID): Promise<Resource> {
    try {
      const response = await this.get<Resource>(`/resources/${id.value}`)
      return response.data
    } catch (error) {
      throw this.handleResourceError(toCaughtError(error), `Failed to fetch resource ${id.value}`)
    }
  }

  /**
   * Создание нового ресурса
   */
  async createResource(resource: Partial<Resource>): Promise<Resource> {
    // Валидация перед созданием
    const validation = ResourceValidator.validateResource(resource)
    if (!validation.valid) {
      throw new ResourceValidationError(
        `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
        validation.errors,
      )
    }

    try {
      const response = await this.post<Resource>('/resources', resource as StrictData)
      return response.data
    } catch (error) {
      throw this.handleResourceError(toCaughtError(error), 'Failed to create resource')
    }
  }

  /**
   * Обновление ресурса
   */
  async updateResource(id: ID, resource: Partial<Resource>): Promise<Resource> {
    // Валидация перед обновлением
    const validation = ResourceValidator.validateResource(resource)
    if (!validation.valid) {
      throw new ResourceValidationError(
        `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
        validation.errors,
      )
    }

    try {
      const response = await this.put<Resource>(`/resources/${id.value}`, resource as StrictData)
      return response.data
    } catch (error) {
      throw this.handleResourceError(toCaughtError(error), `Failed to update resource ${id.value}`)
    }
  }

  /**
   * Удаление ресурса
   */
  async deleteResource(id: ID): Promise<void> {
    try {
      await this.delete<void>(`/resources/${id.value}`)
    } catch (error) {
      throw this.handleResourceError(toCaughtError(error), `Failed to delete resource ${id.value}`)
    }
  }

  /**
   * Назначение ресурса на задачу
   */
  async assignResource(taskId: ID, resourceId: ID, units: Percentage): Promise<Assignment> {
    try {
      const body: StrictData = {
        resourceId: resourceId.value,
        units: typeof units === 'number' ? units : Number(units),
      }
      const response = await this.post<Assignment>(`/tasks/${taskId.value}/assignments`, body)
      return response.data
    } catch (error) {
      throw this.handleResourceError(toCaughtError(error), `Failed to assign resource ${resourceId.value} to task ${taskId.value}`)
    }
  }

  /**
   * Удаление назначения ресурса с задачи
   */
  async unassignResource(taskId: ID, resourceId: ID): Promise<void> {
    try {
      await this.delete<void>(`/tasks/${taskId.value}/assignments/${resourceId.value}`)
    } catch (error) {
      throw this.handleResourceError(toCaughtError(error), `Failed to unassign resource ${resourceId.value} from task ${taskId.value}`)
    }
  }

  /**
   * Обновление назначения
   */
  async updateAssignment(assignmentId: ID, assignment: Partial<Assignment>): Promise<Assignment> {
    try {
      const response = await this.put<Assignment>(`/assignments/${assignmentId.value}`, assignment as StrictData)
      return response.data
    } catch (error) {
      throw this.handleResourceError(toCaughtError(error), `Failed to update assignment ${assignmentId.value}`)
    }
  }

  /**
   * Получение назначений ресурса
   */
  async getResourceAssignments(resourceId: ID): Promise<Assignment[]> {
    try {
      const response = await this.get<Assignment[]>(`/resources/${resourceId.value}/assignments`)
      return response.data
    } catch (error) {
      throw this.handleResourceError(toCaughtError(error), `Failed to fetch assignments for resource ${resourceId.value}`)
    }
  }

  /**
   * Получение назначений задачи
   */
  async getTaskAssignments(taskId: ID): Promise<Assignment[]> {
    try {
      const response = await this.get<Assignment[]>(`/tasks/${taskId.value}/assignments`)
      return response.data
    } catch (error) {
      throw this.handleResourceError(toCaughtError(error), `Failed to fetch assignments for task ${taskId.value}`)
    }
  }

  /**
   * Поиск ресурсов по параметрам
   */
  async searchResources(params: {
    name?: string;
    type?: string;
    skills?: string;
    department?: string;
    limit?: number;
    page?: number;
  }): Promise<Resource[]> {
    try {
      const response = await this.get<Resource[]>('/resources/search', params as Record<string, string | number | boolean | undefined>)
      return response.data
    } catch (error) {
      throw this.handleResourceError(toCaughtError(error), 'Failed to search resources')
    }
  }

  /**
   * Получение доступности ресурса
   */
  async getResourceAvailability(resourceId: ID, startDate: Date, endDate: Date): Promise<ResourceAvailability> {
    try {
      const response = await this.get<ResourceAvailability>(`/resources/${resourceId.value}/availability`, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })
      return response.data
    } catch (error) {
      throw this.handleResourceError(toCaughtError(error), `Failed to get availability for resource ${resourceId.value}`)
    }
  }

  /**
   * Обработка ошибок специфичных для ресурсов
   * Следует Single Responsibility Principle
   */
  private handleResourceError(error: CaughtError, context: string): Error {
    if (error instanceof ResourceValidationError) {
      return error
    }

    if (error instanceof APIError && error.details && typeof error.details === 'object') {
      const details = error.details as Record<string, StrictData & { validationErrors?: Array<Record<string, string>> }>
      if (Array.isArray(details.validationErrors)) {
        const validationErrors: ValidationError[] = details.validationErrors.map((e: StrictData) => {
          const r = e && typeof e === 'object' && !Array.isArray(e) ? (e as Record<string, string>) : {}
          return { field: r.field ?? '', message: r.message ?? '', code: r.code ?? 'VALIDATION_ERROR' }
        })
        return new ResourceValidationError(
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

