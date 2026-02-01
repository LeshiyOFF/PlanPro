import { useMemo } from 'react'
import { Task } from '@/store/project/interfaces'

/**
 * Интерфейс статистики использования задач
 */
export interface TaskUsageStats {
  /** Общее количество задач */
  total: number;
  /** Количество завершённых задач (progress >= 1.0, т.е. 100%) */
  completed: number;
  /** Количество задач в процессе (0 < progress < 1.0) */
  inProgress: number;
  /** Количество не начатых задач (progress === 0) */
  notStarted: number;
}

/**
 * Хук для вычисления статистики использования задач
 *
 * ВАЖНО: progress в store хранится как число от 0 до 1 (0-100%):
 * - 0 = 0% (не начата)
 * - 0.5 = 50% (в процессе)
 * - 1.0 = 100% (завершена)
 *
 * @param tasks Массив задач из store
 * @returns Объект со статистикой
 */
export const useTaskUsageStats = (tasks: Task[]): TaskUsageStats => {
  return useMemo(() => {
    const total = tasks.length

    // progress хранится как 0-1, где 1.0 = 100%
    const completed = tasks.filter(t => t.progress >= 1).length
    const inProgress = tasks.filter(t => t.progress > 0 && t.progress < 1).length
    const notStarted = tasks.filter(t => t.progress === 0).length

    return { total, completed, inProgress, notStarted }
  }, [tasks])
}
