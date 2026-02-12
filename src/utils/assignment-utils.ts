import type { Assignment } from '@/types'
import { AssignmentIdGenerator } from '@/domain/assignment/services/AssignmentIdGenerator'

/**
 * Утилиты для работы с назначениями
 */
export class AssignmentUtils {
  /**
   * Фильтрация назначений для задачи
   */
  static getTaskAssignments(assignments: Assignment[], taskId: string): Assignment[] {
    return assignments.filter(assignment => assignment.taskId === taskId)
  }

  /**
   * Фильтрация назначений для ресурса
   */
  static getResourceAssignments(assignments: Assignment[], resourceId: string): Assignment[] {
    return assignments.filter(assignment => assignment.resourceId === resourceId)
  }

  /**
   * Поиск назначения по ID
   */
  static findAssignment(assignments: Assignment[], id: string): Assignment | undefined {
    return assignments.find(assignment => assignment.id === id)
  }

  /**
   * Валидация назначения
   */
  static validateAssignment(assignment: Partial<Assignment>): string | null {
    if (!assignment.taskId) {
      return 'Task ID обязателен'
    }
    if (!assignment.resourceId) {
      return 'Resource ID обязателен'
    }
    if (assignment.units !== undefined && (assignment.units < 0 || assignment.units > 100)) {
      return 'Units должны быть в диапазоне 0-100'
    }
    return null
  }

  /**
   * Создание назначения для тестов и разработки.
   * В production-потоке не использовать.
   *
   * @param data Данные назначения без ID
   * @returns Назначение с детерминированным ID
   */
  static createMockAssignment(data: Omit<Assignment, 'id'>): Assignment {
    return {
      id: AssignmentIdGenerator.generate(data.taskId, data.resourceId),
      ...data,
    }
  }
}

