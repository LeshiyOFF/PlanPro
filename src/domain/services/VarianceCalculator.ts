import { Task } from '@/types/task-types';

/**
 * Сервис для расчета отклонений (Variance) между текущим планом и базовым (Baseline).
 * Соответствует SOLID: Single Responsibility Principle.
 */
export class VarianceCalculator {
  /**
   * Рассчитывает отклонение даты окончания в днях.
   * Положительное значение означает задержку, отрицательное — опережение графика.
   */
  public static calculateFinishVarianceDays(task: Task): number {
    if (!task.baselineFinish) {
      return 0;
    }

    const currentFinish = new Date(task.finish).getTime();
    const baselineFinish = new Date(task.baselineFinish).getTime();
    
    // Разница в миллисекундах переведенная в полные дни
    const diffMs = currentFinish - baselineFinish;
    return Math.round(diffMs / (24 * 60 * 60 * 1000));
  }

  /**
   * Проверяет, есть ли у задачи задержка относительно базового плана.
   */
  public static isDelayed(task: Task): boolean {
    return this.calculateFinishVarianceDays(task) > 0;
  }
}


