// Master Functionality Catalog типы
import type {
  ProjectAPI,
  Project,
  ID,
  ExportFormat,
  ImportFormat,
  ValidationResult,
  ValidationError
} from '@/types'

import { BaseAPIClient, type APIResponse, type APIClientConfig } from './BaseAPIClient'

/**
 * Валидация проекта перед отправкой
 * Следует Single Responsibility Principle
 */
class ProjectValidator {
  /**
   * Валидация проекта
   */
  static validateProject(project: Partial<Project>): ValidationResult {
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

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    }
  }
}

/**
 * Типизированный ProjectAPI клиент
 * Реализует интерфейс ProjectAPI из Master Functionality Catalog
 * Следует SOLID принципам и Clean Architecture
 */
export class ProjectAPIClient extends BaseAPIClient implements ProjectAPI {
  
  constructor(config?: APIClientConfig) {
    super({
      timeout: config?.timeout || 5000,
      ...config
    });
  }

  /**
   * Получение всех проектов
   */
  async getProjects(): Promise<Project[]> {
    try {
      const response = await this.get<Project[]>('/projects');
      return response.data;
    } catch (error) {
      throw this.handleProjectError(error, 'Failed to fetch projects');
    }
  }

  /**
   * Получение проекта по ID
   */
  async getProject(id: ID): Promise<Project> {
    try {
      const response = await this.get<Project>(`/projects/${id.value}`);
      return response.data;
    } catch (error) {
      throw this.handleProjectError(error, `Failed to fetch project ${id.value}`);
    }
  }

  /**
   * Создание нового проекта
   */
  async createProject(project: Partial<Project>): Promise<Project> {
    // Валидация перед созданием
    const validation = ProjectValidator.validateProject(project);
    if (!validation.valid) {
      const error = new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      (error as any).validationErrors = validation.errors;
      throw error;
    }

    try {
      const response = await this.post<Project>('/projects', project);
      return response.data;
    } catch (error) {
      throw this.handleProjectError(error, 'Failed to create project');
    }
  }

  /**
   * Обновление проекта
   */
  async updateProject(id: ID, project: Partial<Project>): Promise<Project> {
    // Валидация перед обновлением
    const validation = ProjectValidator.validateProject(project);
    if (!validation.valid) {
      const error = new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      (error as any).validationErrors = validation.errors;
      throw error;
    }

    try {
      const response = await this.put<Project>(`/projects/${id.value}`, project);
      return response.data;
    } catch (error) {
      throw this.handleProjectError(error, `Failed to update project ${id.value}`);
    }
  }

  /**
   * Удаление проекта
   */
  async deleteProject(id: ID): Promise<void> {
    try {
      await this.delete<void>(`/projects/${id.value}`);
    } catch (error) {
      throw this.handleProjectError(error, `Failed to delete project ${id.value}`);
    }
  }

  /**
   * Экспорт проекта
   */
  async exportProject(id: ID, format: ExportFormat): Promise<Blob> {
    try {
      return await this.download(`/projects/${id.value}/export`, { format });
    } catch (error) {
      throw this.handleProjectError(error, `Failed to export project ${id.value}`);
    }
  }

  /**
   * Импорт проекта
   */
  async importProject(file: File, format: ImportFormat): Promise<Project> {
    try {
      const response = await this.upload<Project>('/projects/import', file, { format });
      return response.data;
    } catch (error) {
      throw this.handleProjectError(error, 'Failed to import project');
    }
  }

  /**
   * Поиск проектов по параметрам
   */
  async searchProjects(params: {
    name?: string;
    status?: string;
    manager?: string;
    limit?: number;
    page?: number;
  }): Promise<Project[]> {
    try {
      const response = await this.get<Project[]>('/projects/search', params);
      return response.data;
    } catch (error) {
      throw this.handleProjectError(error, 'Failed to search projects');
    }
  }

  /**
   * Клонирование проекта
   */
  async cloneProject(id: ID, newName: string): Promise<Project> {
    try {
      const response = await this.post<Project>(`/projects/${id.value}/clone`, { name: newName });
      return response.data;
    } catch (error) {
      throw this.handleProjectError(error, `Failed to clone project ${id.value}`);
    }
  }

  /**
   * Получение статистики проекта
   */
  async getProjectStatistics(id: ID): Promise<any> {
    try {
      const response = await this.get<any>(`/projects/${id.value}/statistics`);
      return response.data;
    } catch (error) {
      throw this.handleProjectError(error, `Failed to get project statistics ${id.value}`);
    }
  }

  /**
   * Обработка ошибок специфичных для проектов
   * Следует Single Responsibility Principle
   */
  private handleProjectError(error: unknown, context: string): Error {
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
