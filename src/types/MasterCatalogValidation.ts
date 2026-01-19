// Master Functionality Catalog типы для валидации
import type {
  Project,
  Task,
  Resource,
  Dependency,
  View,
  ValidationResult,
  ValidationWarning,
  ValidationError,
  ID
} from '@/types'
import {
  ProjectStatus,
  TaskStatus,
  ResourceType,
  DependencyType
} from '@/types/Master_Functionality_Catalog'

/**
 * Класс валидации Master Functionality Catalog
 * Следует SOLID принципам (Single Responsibility)
 */
export class MasterCatalogValidator {
  /**
   * Валидация ID
   */
  static validateID(id: Partial<ID>): ValidationError[] {
    const errors: ValidationError[] = []

    if (!id.value || id.value <= 0) {
      errors.push({
        field: 'value',
        message: 'ID должен быть положительным числом',
        code: 'INVALID_ID'
      })
    }

    if (!id.type || id.type.trim().length === 0) {
      errors.push({
        field: 'type',
        message: 'Тип ID обязателен',
        code: 'REQUIRED_FIELD'
      })
    }

    return errors
  }

  /**
   * Валидация проекта
   */
  static validateProject(project: Partial<Project>): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Валидация ID
    if (project.id) {
      errors.push(...this.validateID(project.id))
    }

    // Валидация имени
    if (!project.name || project.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Название проекта обязательно',
        code: 'REQUIRED_FIELD'
      })
    } else if (project.name.length > 255) {
      errors.push({
        field: 'name',
        message: 'Название проекта не должно превышать 255 символов',
        code: 'MAX_LENGTH_EXCEEDED'
      })
    }

    // Валидация дат
    if (!project.startDate) {
      errors.push({
        field: 'startDate',
        message: 'Дата начала проекта обязательна',
        code: 'REQUIRED_FIELD'
      })
    }

    if (!project.finishDate) {
      warnings.push({
        field: 'finishDate',
        message: 'Рекомендуется указать дату окончания проекта',
        code: 'RECOMMENDED_FIELD'
      })
    }

    if (project.startDate && project.finishDate && project.startDate >= project.finishDate) {
      errors.push({
        field: 'finishDate',
        message: 'Дата окончания должна быть позже даты начала',
        code: 'INVALID_DATE_RANGE'
      })
    }

    // Валидация статуса
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
      warnings
    }
  }

  /**
   * Валидация задачи
   */
  static validateTask(task: Partial<Task>): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Валидация ID
    if (task.id) {
      errors.push(...this.validateID(task.id))
    }

    // Валидация имени
    if (!task.name || task.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Название задачи обязательно',
        code: 'REQUIRED_FIELD'
      })
    } else if (task.name.length > 255) {
      errors.push({
        field: 'name',
        message: 'Название задачи не должно превышать 255 символов',
        code: 'MAX_LENGTH_EXCEEDED'
      })
    }

    // Валидация длительности
    if (!task.duration) {
      errors.push({
        field: 'duration',
        message: 'Длительность задачи обязательна',
        code: 'REQUIRED_FIELD'
      })
    } else {
      if (task.duration.value <= 0) {
        errors.push({
          field: 'duration.value',
          message: 'Длительность должна быть положительной',
          code: 'INVALID_DURATION'
        })
      }
    }

    // Валидация статуса
    if (task.status && !Object.values(TaskStatus).includes(task.status)) {
      errors.push({
        field: 'status',
        message: 'Недопустимый статус задачи',
        code: 'INVALID_STATUS'
      })
    }

    // Валидация прогресса
    if (task.completion !== undefined) {
      if (task.completion.value < 0 || task.completion.value > 100) {
        errors.push({
          field: 'completion.value',
          message: 'Процент выполнения должен быть от 0 до 100',
          code: 'INVALID_COMPLETION'
        })
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Валидация ресурса
   */
  static validateResource(resource: Partial<Resource>): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Валидация ID
    if (resource.id) {
      errors.push(...this.validateID(resource.id))
    }

    // Валидация имени
    if (!resource.name || resource.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Название ресурса обязательно',
        code: 'REQUIRED_FIELD'
      })
    } else if (resource.name.length > 255) {
      errors.push({
        field: 'name',
        message: 'Название ресурса не должно превышать 255 символов',
        code: 'MAX_LENGTH_EXCEEDED'
      })
    }

    // Валидация типа ресурса
    if (resource.type && !Object.values(ResourceType).includes(resource.type)) {
      errors.push({
        field: 'type',
        message: 'Недопустимый тип ресурса',
        code: 'INVALID_TYPE'
      })
    }

    // Валидация стоимости
    if (resource.cost) {
      if (resource.cost.standardRate.amount < 0) {
        errors.push({
          field: 'cost.standardRate',
          message: 'Стандартная ставка не может быть отрицательной',
          code: 'INVALID_COST'
        })
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Валидация зависимости
   */
  static validateDependency(dependency: Partial<Dependency>): ValidationResult {
    const errors: ValidationError[] = []

    if (!dependency.predecessor) {
      errors.push({
        field: 'predecessor',
        message: 'Предшествующая задача обязательна',
        code: 'REQUIRED_FIELD'
      })
    }

    if (!dependency.successor) {
      errors.push({
        field: 'successor',
        message: 'Последующая задача обязательна',
        code: 'REQUIRED_FIELD'
      })
    }

    if (dependency.type && !Object.values(DependencyType).includes(dependency.type)) {
      errors.push({
        field: 'type',
        message: 'Недопустимый тип зависимости',
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
   * Валидация представления
   */
  static validateView(view: Partial<View>): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Валидация ID
    if (view.id) {
      errors.push(...this.validateID(view.id))
    }

    // Валидация имени
    if (!view.name || view.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Название представления обязательно',
        code: 'REQUIRED_FIELD'
      })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }
}
