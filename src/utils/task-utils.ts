import type { Task } from '@/types'
import { TaskIdGenerator } from '@/domain/tasks/services/TaskIdGenerator'

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
   * Создание задачи для тестов и разработки.
   * В production-потоке не использовать.
   *
   * @param data Данные задачи без ID
   * @param existingTasks Массив существующих задач для генерации уникального ID
   * @returns Задача с уникальным ID
   */
  static createMockTask(data: Omit<Task, 'id'>, existingTasks: Task[] = []): Task {
    return {
      id: TaskIdGenerator.generate(existingTasks),
      ...data,
    }
  }

  /**
   * Расчет процента выполнения задач
   */
  static calculateProgress(tasks: Task[]): number {
    if (tasks.length === 0) return 0
    return Math.round(tasks.reduce((sum, t) => sum + (t.progress ?? 0), 0) / tasks.length)
  }
}

/** Объект с полями критичности (задача из стора или API). */
export type CriticalPathFlags = { critical?: boolean; isCritical?: boolean; criticalPath?: boolean }

/** Единая проверка: задача на критическом пути. Устраняет расхождение critical / isCritical / criticalPath. */
export function isTaskCritical(task: CriticalPathFlags): boolean {
  return task.isCritical === true || task.critical === true || task.criticalPath === true
}

/**
 * Возвращает все варианты ключа для поиска задачи при мерже критического пути.
 * API может возвращать id в формате "TASK1", "TASK2"; фронт использует "TASK-1", "TASK-2" или "TASK-001".
 * Регистрируем и ищем по всем вариантам, чтобы мерж не зависел от формата.
 */
export function getCriticalPathLookupKeys(id: string): string[] {
  if (!id || typeof id !== 'string') return [id]
  const trimmed = id.trim()
  const withHyphen = /^TASK-?(\d+)$/i.exec(trimmed)
  const onlyDigits = /^(\d+)$/.exec(trimmed)
  const keys = new Set<string>([trimmed])
  if (withHyphen) {
    const num = withHyphen[1]
    keys.add(`TASK${num}`)
    keys.add(`TASK-${num}`)
    keys.add(num)
  }
  if (onlyDigits) {
    const n = onlyDigits[1]
    keys.add(`TASK-${n}`)
    keys.add(`TASK${n}`)
  }
  return Array.from(keys)
}