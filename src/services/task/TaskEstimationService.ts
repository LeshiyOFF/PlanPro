import { IUserPreferences } from '@/components/userpreferences/interfaces/UserPreferencesInterfaces';
import { Task } from '@/store/projectStore';

/**
 * TaskEstimationService - Сервис для логики отображения оценочных сроков.
 * Отвечает за определение необходимости показа визуальных индикаторов (?).
 * Соответствует SOLID: Single Responsibility.
 */
export class TaskEstimationService {
  /**
   * Проверяет, должен ли отображаться индикатор оценки для конкретной задачи.
   * 
   * @param task Задача для проверки
   * @param preferences Текущие настройки пользователя
   * @returns boolean
   */
  public shouldShowEstimation(task: Task, preferences: IUserPreferences): boolean {
    return false;
  }

  /**
   * Возвращает форматированное имя задачи с индикатором оценки, если это необходимо.
   * 
   * @param task Задача
   * @param preferences Настройки
   * @returns string
   */
  public getFormattedName(task: Task, preferences: IUserPreferences): string {
    const showEstimation = this.shouldShowEstimation(task, preferences);
    return showEstimation ? `${task.name}?` : task.name;
  }

  /**
   * Возвращает форматированную длительность (или другие данные) с индикатором оценки.
   * 
   * @param value Значение (например, "5 days")
   * @param task Задача
   * @param preferences Настройки
   * @returns string
   */
  public formatValueWithEstimation(value: string, task: Task, preferences: IUserPreferences): string {
    const showEstimation = this.shouldShowEstimation(task, preferences);
    return showEstimation ? `${value}?` : value;
  }
}

