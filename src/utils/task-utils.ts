import type { Task } from '@/types'

/**
 * Утилиты для работы с задачами
 */
export class TaskUtils {
  /**
   * Поиск задачи по ID
   */
  static findTask(tasks: Task[], id: string): Task | undefined {
    return tasks.find(task => task.id === id)
  }

  /**
   * Фильтрация задач по статусу
   */
  static filterTasksByStatus(tasks: Task[], status: Task['status']): Task[] {
    return tasks.filter(task => task.status === status)
  }

  /**
   * Фильтрация задач по приоритету
   */
  static filterTasksByPriority(tasks: Task[], priority: Task['priority']): Task[] {
    return tasks.filter(task => task.priority === priority)
  }

  /**
   * Валидация задачи
   */
  static validateTask(task: Partial<Task>): string | null {
    if (!task.name?.trim()) {
      return 'Название задачи обязательно'
    }
    if (task.duration !== undefined && task.duration <= 0) {
      return 'Длительность должна быть положительным числом'
    }
    return null
  }

  /**
   * Создание mock задачи
   */
  static createMockTask(data: Omit<Task, 'id'>): Task {
    return {
      id: Date.now().toString(),
      ...data,
    }
  }

  /**
   * Расчет процента выполнения задач
   */
  static calculateProgress(tasks: Task[]): number {
    if (tasks.length === 0) return 0
    return Math.round(Math.random() * 100) // mock: случайный прогресс
  }
}

