import { 
  IGeneralPreferences,
  IDisplayPreferences, 
  IEditingPreferences, 
  ICalculationPreferences, 
  ISecurityPreferences,
  ISchedulePreferences,
  ICalendarPreferences,
  IGanttPreferences,
  ITrustCenterSettings 
} from '../interfaces/UserPreferencesInterfaces';

/**
 * Валидаторы настроек
 */
export class PreferencesValidator {
  
  /**
   * Валидация общих настроек
   */
  public static validateGeneral(preferences: IGeneralPreferences): boolean {
    // userName может быть пустым при наборе, но defaultView обязателен
    return !!preferences.defaultView;
  }

  /**
   * Валидация настроек отображения
   */
  public static validateDisplay(preferences: IDisplayPreferences): boolean {
    return !!(preferences.fontSize > 0 && preferences.theme);
  }

  /**
   * Валидация настроек редактирования
   */
  public static validateEditing(_preferences: IEditingPreferences): boolean {
    return true;
  }

  /**
   * Валидация настроек расчетов
   */
  public static validateCalculations(_preferences: ICalculationPreferences): boolean {
    return true;
  }

  /**
   * Валидация настроек безопасности
   */
  public static validateSecurity(preferences: ISecurityPreferences): boolean {
    return !!(preferences.trustCenter !== undefined);
  }

  /**
   * Валидация настроек планирования
   */
  public static validateSchedule(preferences: ISchedulePreferences): boolean {
    return preferences.schedulingRule >= 0 && preferences.schedulingRule <= 2;
  }

  /**
   * Валидация настроек календаря
   */
  public static validateCalendar(preferences: ICalendarPreferences): boolean {
    return preferences.hoursPerDay > 0 && preferences.hoursPerDay <= 24 &&
           preferences.hoursPerWeek > 0 && preferences.hoursPerWeek <= 168;
  }

  /**
   * Валидация настроек Ганта
   */
  public static validateGantt(preferences: IGanttPreferences): boolean {
    return preferences.barHeight > 0 && preferences.rowHeight > 0;
  }

  /**
   * Валидация настроек центра доверия
   */
  public static validateTrustCenter(settings: ITrustCenterSettings): boolean {
    return !!(settings.trustedLocations !== undefined);
  }
}

