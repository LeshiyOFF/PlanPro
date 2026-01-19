// Master Functionality Catalog типы
import type {
  Project,
  ID,
  ProjectStatus,
  ValidationResult,
  ValidationError
} from '@/types'

import { EnvironmentConfig } from '@/config/EnvironmentConfig'

/**
 * Сервис для работы с проектами
 */
export class MasterCatalogProjectService {
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
   * Валидация проекта
   */
  validateProject(project: Partial<Project>): ValidationResult {
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

  /**
   * Создание проекта
   */
  async createProject(project: Partial<Project>): Promise<Project> {
    const validation = this.validateProject(project)
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
    }
    
    const response = await fetch(`${this.baseUrl}/projects`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(project)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Получение проекта по ID
   */
  async getProject(id: ID): Promise<Project> {
    const response = await fetch(`${this.baseUrl}/projects/${id.value}`, {
      headers: this.headers
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Обновление проекта
   */
  async updateProject(id: ID, project: Partial<Project>): Promise<Project> {
    const validation = this.validateProject(project)
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
    }
    
    const response = await fetch(`${this.baseUrl}/projects/${id.value}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(project)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Удаление проекта
   */
  async deleteProject(id: ID): Promise<void> {
    const response = await fetch(`${this.baseUrl}/projects/${id.value}`, {
      method: 'DELETE',
      headers: this.headers
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  }
}

