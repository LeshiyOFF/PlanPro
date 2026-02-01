import { IUserPreferences } from '@/components/userpreferences/interfaces/UserPreferencesInterfaces'
import { Task } from '@/store/projectStore'

/**
 * TaskWorkVisualizationService - Сервис для управления визуализацией работ на диаграмме Ганта.
 * Отвечает за логику отображения полосок фактического прогресса (Actual) и базового плана (Baseline).
 * Соответствует SOLID: Single Responsibility.
 */
export class TaskWorkVisualizationService {
  /**
   * Определяет, должен ли отображаться фактический прогресс.
   *
   * @param preferences Настройки пользователя
   * @returns boolean
   */
  public shouldShowActualWork(preferences: IUserPreferences): boolean {
    return preferences.calculations?.showActualWork ?? true
  }

  /**
   * Определяет, должен ли отображаться базовый план.
   *
   * @param mode Режим текущего вида Ганта
   * @param preferences Настройки пользователя
   * @returns boolean
   */
  public shouldShowBaselineWork(mode: 'standard' | 'tracking', preferences: IUserPreferences): boolean {
    // Отображаем, если включен специальный режим отслеживания ИЛИ если флаг включен в глобальных настройках
    return mode === 'tracking' || !!preferences.calculations?.showBaselineWork
  }

  /**
   * Возвращает значение прогресса для визуализации.
   * Если показ фактических работ отключен, возвращает 0.
   *
   * @param task Задача
   * @param preferences Настройки пользователя
   * @returns number (0-1)
   */
  public getVisualProgress(task: Task, preferences: IUserPreferences): number {
    if (!this.shouldShowActualWork(preferences)) {
      return 0
    }
    return task.progress || 0
  }

  /**
   * Генерирует CSS-инъекцию для визуализации базового плана (Baseline).
   * Использует селекторы для поиска элементов в SVG-структуре gantt-task-react.
   *
   * @param tasks Список задач с базовыми датами
   * @param isEnabled Включен ли показ базового плана
   * @returns string CSS
   */
  public getBaselineStyles(_tasks: Task[], isEnabled: boolean): string {
    if (!isEnabled) return ''

    // В данной реализации мы используем CSS для стилизации, но для реальных
    // baseline-полосок в SVG потребуется более сложная манипуляция DOM или
    // поддержка на уровне библиотеки.
    // Пока реализуем изменение прозрачности или специальные границы для Actual,
    // если они расходятся с Baseline, либо добавляем информативный класс.
    return `
      .gantt-baseline-enabled .task-has-variance {
        stroke: #f59e0b !important;
        stroke-width: 2px !important;
      }
    `
  }
}

