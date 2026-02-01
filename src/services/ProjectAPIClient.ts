// Master Functionality Catalog типы
import type {
  ProjectAPI,
  Project,
  ID,
  ExportFormat,
  ImportFormat,
  ValidationResult,
  ValidationError,
  ProjectStatistics,
  StrictData
} from '../types/Master_Functionality_Catalog'

import { BaseAPIClient, type APIClientConfig, APIError } from './BaseAPIClient'
import { getErrorMessage, type CaughtError, toCaughtError } from '@/errors/CaughtError'

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

    const start = project.startDate;
    if (!start) {
      errors.push({
        field: 'startDate',
        message: 'Дата начала проекта обязательна',
        code: 'REQUIRED_FIELD'
      })
    }

    const finish = project.finishDate;
    if (start && finish && start >= finish) {
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
 * Расширенная ошибка валидации проекта
 */
export class ProjectValidationError extends Error {
  constructor(message: string, public readonly validationErrors: ValidationError[]) {
    super(message);
    this.name = 'ProjectValidationError';
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
      throw this.handleProjectError(toCaughtError(error), 'Failed to fetch projects');
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
      throw this.handleProjectError(toCaughtError(error), `Failed to fetch project ${id.value}`);
    }
  }

  /**
   * Создание нового проекта
   */
  async createProject(project: Partial<Project>): Promise<Project> {
    // Валидация перед созданием
    const validation = ProjectValidator.validateProject(project);
    if (!validation.valid) {
      throw new ProjectValidationError(
        `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
        validation.errors
      );
    }

    try {
      const response = await this.post<Project>('/projects', project as StrictData);
      return response.data;
    } catch (error) {
      throw this.handleProjectError(toCaughtError(error), 'Failed to create project');
    }
  }

  /**
   * Обновление проекта
   */
  async updateProject(id: ID, project: Partial<Project>): Promise<Project> {
    // Валидация перед обновлением
    const validation = ProjectValidator.validateProject(project);
    if (!validation.valid) {
      throw new ProjectValidationError(
        `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
        validation.errors
      );
    }

    try {
      const response = await this.put<Project>(`/projects/${id.value}`, project as StrictData);
      return response.data;
    } catch (error) {
      throw this.handleProjectError(toCaughtError(error), `Failed to update project ${id.value}`);
    }
  }

  /**
   * Удаление проекта
   */
  async deleteProject(id: ID): Promise<void> {
    try {
      await this.delete<void>(`/projects/${id.value}`);
    } catch (error) {
      throw this.handleProjectError(toCaughtError(error), `Failed to delete project ${id.value}`);
    }
  }

  /**
   * Экспорт проекта
   */
  async exportProject(id: ID, format: ExportFormat): Promise<Blob> {
    try {
      return await this.download(`/projects/${id.value}/export`, { format });
    } catch (error) {
      throw this.handleProjectError(toCaughtError(error), `Failed to export project ${id.value}`);
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
      throw this.handleProjectError(toCaughtError(error), 'Failed to import project');
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
      throw this.handleProjectError(toCaughtError(error), 'Failed to search projects');
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
      throw this.handleProjectError(toCaughtError(error), `Failed to clone project ${id.value}`);
    }
  }

  /**
   * Получение статистики проекта
   */
  async getProjectStatistics(id: ID): Promise<ProjectStatistics> {
    try {
      const response = await this.get<ProjectStatistics>(`/projects/${id.value}/statistics`);
      return response.data;
    } catch (error) {
      throw this.handleProjectError(toCaughtError(error), `Failed to get project statistics ${id.value}`);
    }
  }

  /**
   * Обработка ошибок специфичных для проектов
   * Следует Single Responsibility Principle
   */
  private handleProjectError(error: CaughtError, context: string): Error {
    if (error instanceof ProjectValidationError) {
      return error;
    }

    if (error instanceof APIError && error.details && typeof error.details === 'object') {
      const details = error.details as Record<string, StrictData & { validationErrors?: Array<Record<string, string>> }>;
      if (Array.isArray(details.validationErrors)) {
        const validationErrors: ValidationError[] = details.validationErrors.map((e: StrictData) => {
          const r = e && typeof e === 'object' && !Array.isArray(e) ? (e as Record<string, string>) : {};
          return { field: r.field ?? '', message: r.message ?? '', code: r.code ?? 'VALIDATION_ERROR' };
        });
        return new ProjectValidationError(
          `${context}: ${String(details.message || 'Validation failed')}`,
          validationErrors
        );
      }
    }

    if (error instanceof Error) {
      return new Error(`${context}: ${error.message}`);
    }

    return new Error(`${context}: ${getErrorMessage(error)}`);
  }
}

