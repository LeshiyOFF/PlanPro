import { Task } from '@/store/project/interfaces';

/**
 * Калькулятор статистики задач для отчётов.
 * Clean Architecture: Domain Service.
 * SOLID: Single Responsibility - расчёт статистики задач.
 */
export class TaskStatsCalculator {
  
  /**
   * Вычисляет полную статистику по задачам проекта.
   */
  public calculate(tasks: Task[]): TaskStats {
    const total = tasks.length;
    const completed = tasks.filter(t => this.normalizeProgress(t.progress) >= 100).length;
    const inProgress = tasks.filter(t => {
      const p = this.normalizeProgress(t.progress);
      return p > 0 && p < 100;
    }).length;
    const notStarted = tasks.filter(t => this.normalizeProgress(t.progress) === 0).length;
    const critical = tasks.filter(t => t.isCritical).length;
    const milestones = tasks.filter(t => t.isMilestone).length;
    
    return {
      total,
      completed,
      inProgress,
      notStarted,
      critical,
      milestones,
      completedPercent: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  /**
   * Нормализует значение прогресса к шкале 0-100.
   * Поддерживает оба формата: 0-1 (дробный) и 0-100 (целый).
   */
  public normalizeProgress(progress: number | undefined): number {
    if (progress === undefined) return 0;
    return progress <= 1 ? Math.round(progress * 100) : Math.round(progress);
  }
}

/**
 * Статистика задач проекта.
 */
export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  critical: number;
  milestones: number;
  completedPercent: number;
}
