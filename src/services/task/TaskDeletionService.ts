import { IUserPreferences } from '@/components/userpreferences/interfaces/UserPreferencesInterfaces'

/**
 * TaskDeletionService - Сервис для управления логикой удаления задач.
 * Отвечает за проверку прав на удаление и соблюдение бизнес-правил.
 */
export class TaskDeletionService {
  /**
   * Проверяет, разрешено ли удаление задачи согласно настройкам.
   *
   * @param preferences Текущие пользовательские настройки
   * @returns true, если удаление разрешено
   */
  public canDeleteTask(preferences: IUserPreferences): boolean {
    return preferences.editing?.allowTaskDeletion ?? true
  }

  /**
   * Проверяет, требуется ли подтверждение удаления.
   *
   * @param preferences Текущие пользовательские настройки
   * @returns true, если требуется подтверждение
   */
  public shouldConfirmDeletion(preferences: IUserPreferences): boolean {
    return preferences.editing?.confirmDeletions ?? true
  }
}

