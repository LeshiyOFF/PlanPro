import { useCallback, useMemo } from 'react'

// Master Functionality Catalog типы
import { ProjectStatus, TaskStatus, ResourceType } from '@/types'
import type {
  Project,
  Task,
  Resource,
  Assignment,
  Dependency,
  ValidationResult,
  ValidationError,
  ValidationWarning
} from '@/types'

/**
 * React хук для валидации с Master Functionality Catalog
 * Следует SOLID принципам (Single Responsibility)
 */
export const useMasterCatalogValidation = () => {
  /**
   * Валидация проекта
   */
  const validateProject = useCallback((project: Partial<Project>): ValidationResult => {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Базовая валидация обязательных полей
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

    // Валидация логики дат
    if (project.startDate && project.finishDate) {
      if (project.startDate >= project.finishDate) {
        errors.push({
          field: 'finishDate',
          message: 'Дата окончания должна быть позже даты начала',
          code: 'INVALID_DATE_RANGE'
        })
      }
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
  }, [])

  /**
   * Валидация задачи
   */
  const validateTask = useCallback((task: Partial<Task>): ValidationResult => {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Базовая валидация
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
          field: 'completion',
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
  }, [])

  /**
   * Валидация ресурса
   */
  const validateResource = useCallback((resource: Partial<Resource>): ValidationResult => {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Базовая валидация
    if (!resource.name || resource.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Название ресурса обязательно',
        code: 'REQUIRED_FIELD'
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
  }, [])

  return useMemo(() => ({
    validateProject,
    validateTask,
    validateResource
  }), [validateProject, validateTask, validateResource])
}
