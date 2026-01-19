// Master Functionality Catalog типы
import type {
  ResourceAPI,
  Resource,
  ID,
  Assignment,
  Percentage,
  ValidationResult,
  ValidationError
} from '@/types'

import { BaseAPIClient, type APIResponse, type APIClientConfig } from './BaseAPIClient'

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
        code: 'REQUIRED_FIELD'
      })
    }

    if (resource.cost && resource.cost.standardRate.amount < 0) {
      errors.push({
        field: 'cost.standardRate',
        message: 'Стандартная ставка не может быть отрицательной',
        code: 'INVALID_COST'
      })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    }
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
      ...config
    });
  }

  /**
   * Получение всех ресурсов проекта
   */
  async getResources(projectId: ID): Promise<Resource[]> {
    try {
      const response = await this.get<Resource[]>(`/projects/${projectId.value}/resources`);
      return response.data;
    } catch (error) {
      throw this.handleResourceError(error, 'Failed to fetch resources');
    }
  }

  /**
   * Получение ресурса по ID
   */
  async getResource(id: ID): Promise<Resource> {
    try {
      const response = await this.get<Resource>(`/resources/${id.value}`);
      return response.data;
    } catch (error) {
      throw this.handleResourceError(error, `Failed to fetch resource ${id.value}`);
    }
  }

  /**
   * Создание нового ресурса
   */
  async createResource(resource: Partial<Resource>): Promise<Resource> {
    // Валидация перед созданием
    const validation = ResourceValidator.validateResource(resource);
    if (!validation.valid) {
      const error = new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      (error as any).validationErrors = validation.errors;
      throw error;
    }

    try {
      const response = await this.post<Resource>('/resources', resource);
      return response.data;
    } catch (error) {
      throw this.handleResourceError(error, 'Failed to create resource');
    }
  }

  /**
   * Обновление ресурса
   */
  async updateResource(id: ID, resource: Partial<Resource>): Promise<Resource> {
    // Валидация перед обновлением
    const validation = ResourceValidator.validateResource(resource);
    if (!validation.valid) {
      const error = new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      (error as any).validationErrors = validation.errors;
      throw error;
    }

    try {
      const response = await this.put<Resource>(`/resources/${id.value}`, resource);
      return response.data;
    } catch (error) {
      throw this.handleResourceError(error, `Failed to update resource ${id.value}`);
    }
  }

  /**
   * Удаление ресурса
   */
  async deleteResource(id: ID): Promise<void> {
    try {
      await this.delete<void>(`/resources/${id.value}`);
    } catch (error) {
      throw this.handleResourceError(error, `Failed to delete resource ${id.value}`);
    }
  }

  /**
   * Назначение ресурса на задачу
   */
  async assignResource(taskId: ID, resourceId: ID, units: Percentage): Promise<Assignment> {
    try {
      const response = await this.post<Assignment>(`/tasks/${taskId.value}/assignments`, {
        resourceId,
        units
      });
      return response.data;
    } catch (error) {
      throw this.handleResourceError(error, `Failed to assign resource ${resourceId.value} to task ${taskId.value}`);
    }
  }

  /**
   * Удаление назначения ресурса с задачи
   */
  async unassignResource(taskId: ID, resourceId: ID): Promise<void> {
    try {
      await this.delete<void>(`/tasks/${taskId.value}/assignments/${resourceId.value}`);
    } catch (error) {
      throw this.handleResourceError(error, `Failed to unassign resource ${resourceId.value} from task ${taskId.value}`);
    }
  }

  /**
   * Обновление назначения
   */
  async updateAssignment(assignmentId: ID, assignment: Partial<Assignment>): Promise<Assignment> {
    try {
      const response = await this.put<Assignment>(`/assignments/${assignmentId.value}`, assignment);
      return response.data;
    } catch (error) {
      throw this.handleResourceError(error, `Failed to update assignment ${assignmentId.value}`);
    }
  }

  /**
   * Получение назначений ресурса
   */
  async getResourceAssignments(resourceId: ID): Promise<Assignment[]> {
    try {
      const response = await this.get<Assignment[]>(`/resources/${resourceId.value}/assignments`);
      return response.data;
    } catch (error) {
      throw this.handleResourceError(error, `Failed to fetch assignments for resource ${resourceId.value}`);
    }
  }

  /**
   * Получение назначений задачи
   */
  async getTaskAssignments(taskId: ID): Promise<Assignment[]> {
    try {
      const response = await this.get<Assignment[]>(`/tasks/${taskId.value}/assignments`);
      return response.data;
    } catch (error) {
      throw this.handleResourceError(error, `Failed to fetch assignments for task ${taskId.value}`);
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
      const response = await this.get<Resource[]>('/resources/search', params);
      return response.data;
    } catch (error) {
      throw this.handleResourceError(error, 'Failed to search resources');
    }
  }

  /**
   * Получение доступности ресурса
   */
  async getResourceAvailability(resourceId: ID, startDate: Date, endDate: Date): Promise<any> {
    try {
      const response = await this.get<any>(`/resources/${resourceId.value}/availability`, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      return response.data;
    } catch (error) {
      throw this.handleResourceError(error, `Failed to get availability for resource ${resourceId.value}`);
    }
  }

  /**
   * Обработка ошибок специфичных для ресурсов
   * Следует Single Responsibility Principle
   */
  private handleResourceError(error: unknown, context: string): Error {
    if (error instanceof Error && (error as any).validationErrors) {
      const validationError = new Error(`${context}: ${(error as any).validationErrors.map((e: ValidationError) => e.message).join(', ')}`);
      (validationError as any).validationErrors = (error as any).validationErrors;
      return validationError;
    }

    if (error instanceof Error) {
      return new Error(`${context}: ${error.message}`);
    }

    return new Error(`${context}: Unknown error occurred`);
  }
}

