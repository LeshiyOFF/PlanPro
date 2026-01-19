// Master Functionality Catalog типы
import type {
  TaskAPI,
  Task,
  ID,
  Dependency,
  DependencyType,
  Percentage,
  ValidationResult,
  ValidationError
} from '@/types'

import { BaseAPIClient, type APIResponse, type APIClientConfig } from './BaseAPIClient'

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

    if (task.completion !== undefined) {
      if (task.completion.value < 0 || task.completion.value > 100) {
        errors.push({
          field: 'completion',
          message: 'Процент выполнения должен быть от 0 до 100',
          code: 'INVALID_COMPLETION'
        })
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
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
      ...config
    });
  }

  /**
   * Получение всех задач проекта
   */
  async getTasks(projectId: ID): Promise<Task[]> {
    try {
      const response = await this.get<Task[]>(`/projects/${projectId.value}/tasks`);
      return response.data;
    } catch (error) {
      throw this.handleTaskError(error, 'Failed to fetch tasks');
    }
  }

  /**
   * Получение задачи по ID
   */
  async getTask(id: ID): Promise<Task> {
    try {
      const response = await this.get<Task>(`/tasks/${id.value}`);
      return response.data;
    } catch (error) {
      throw this.handleTaskError(error, `Failed to fetch task ${id.value}`);
    }
  }

  /**
   * Создание новой задачи
   */
  async createTask(task: Partial<Task>): Promise<Task> {
    // Валидация перед созданием
    const validation = TaskValidator.validateTask(task);
    if (!validation.valid) {
      const error = new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      (error as any).validationErrors = validation.errors;
      throw error;
    }

    try {
      const response = await this.post<Task>('/tasks', task);
      return response.data;
    } catch (error) {
      throw this.handleTaskError(error, 'Failed to create task');
    }
  }

  /**
   * Обновление задачи
   */
  async updateTask(id: ID, task: Partial<Task>): Promise<Task> {
    // Валидация перед обновлением
    const validation = TaskValidator.validateTask(task);
    if (!validation.valid) {
      const error = new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      (error as any).validationErrors = validation.errors;
      throw error;
    }

    try {
      const response = await this.put<Task>(`/tasks/${id.value}`, task);
      return response.data;
    } catch (error) {
      throw this.handleTaskError(error, `Failed to update task ${id.value}`);
    }
  }

  /**
   * Удаление задачи
   */
  async deleteTask(id: ID): Promise<void> {
    try {
      await this.delete<void>(`/tasks/${id.value}`);
    } catch (error) {
      throw this.handleTaskError(error, `Failed to delete task ${id.value}`);
    }
  }

  /**
   * Перемещение задачи
   */
  async moveTask(taskId: ID, newParentId?: ID, position?: number): Promise<void> {
    try {
      await this.post<void>(`/tasks/${taskId.value}/move`, {
        newParentId,
        position
      });
    } catch (error) {
      throw this.handleTaskError(error, `Failed to move task ${taskId.value}`);
    }
  }

  /**
   * Создание связи между задачами
   */
  async linkTasks(predecessorId: ID, successorId: ID, type: DependencyType): Promise<Dependency> {
    try {
      const response = await this.post<Dependency>('/tasks/link', {
        predecessorId,
        successorId,
        type
      });
      return response.data;
    } catch (error) {
      throw this.handleTaskError(error, 'Failed to link tasks');
    }
  }

  /**
   * Удаление связи между задачами
   */
  async unlinkTasks(predecessorId: ID, successorId: ID): Promise<void> {
    try {
      await this.post<void>('/tasks/unlink', {
        predecessorId,
        successorId
      });
    } catch (error) {
      throw this.handleTaskError(error, 'Failed to unlink tasks');
    }
  }

  /**
   * Обновление прогресса задачи
   */
  async updateTaskProgress(taskId: ID, completion: Percentage): Promise<Task> {
    try {
      const response = await this.put<Task>(`/tasks/${taskId.value}/progress`, {
        completion
      });
      return response.data;
    } catch (error) {
      throw this.handleTaskError(error, `Failed to update task progress ${taskId.value}`);
    }
  }

  /**
   * Назначение ресурсов на задачу
   */
  async assignResources(taskId: ID, resourceIds: ID[], units: Percentage): Promise<void> {
    try {
      await this.post<void>(`/tasks/${taskId.value}/assignments`, {
        resourceIds,
        units
      });
    } catch (error) {
      throw this.handleTaskError(error, `Failed to assign resources to task ${taskId.value}`);
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
      const response = await this.get<Task[]>(`/projects/${projectId.value}/tasks/search`, params);
      return response.data;
    } catch (error) {
      throw this.handleTaskError(error, 'Failed to search tasks');
    }
  }

  /**
   * Получение подзадач
   */
  async getSubtasks(parentId: ID): Promise<Task[]> {
    try {
      const response = await this.get<Task[]>(`/tasks/${parentId.value}/subtasks`);
      return response.data;
    } catch (error) {
      throw this.handleTaskError(error, `Failed to fetch subtasks ${parentId.value}`);
    }
  }

  /**
   * Обработка ошибок специфичных для задач
   * Следует Single Responsibility Principle
   */
  private handleTaskError(error: unknown, context: string): Error {
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
