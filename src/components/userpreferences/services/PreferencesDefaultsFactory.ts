import { 
  IGeneralPreferences,
  IUserPreferences 
} from '../interfaces/UserPreferencesInterfaces';
import { ViewType } from '@/types/ViewTypes';

/**
 * Фабрика настроек по умолчанию
 */
export class PreferencesDefaultsFactory {
  
  /**
   * Создает полный объект всех настроек по умолчанию
   */
  public static createAllDefaults(): IUserPreferences {
    return {
      general: this.getGeneralPreferences(),
      display: this.getDisplayPreferences(),
      editing: this.getEditingPreferences(),
      calculations: this.getCalculationPreferences(),
      security: this.getSecurityPreferences(),
      schedule: this.getSchedulePreferences(),
      calendar: this.getCalendarPreferences(),
      gantt: this.getGanttPreferences(),
    };
  }

  /**
   * Получение общих настроек по умолчанию
   */
  public static getGeneralPreferences(): IGeneralPreferences {
    return {
      userName: '',
      companyName: '',
      defaultView: 'gantt' as ViewType,
      autoSave: true,
      autoSaveInterval: 5,
      defaultCalendar: '',
      dateFormat: 'DD.MM.YYYY',
      timeFormat: 'HH:mm',
      currency: 'USD',
      language: 'ru-RU',
      defaultStandardRate: 0,
      defaultOvertimeRate: 0
    };
  }

  /**
   * Получение настроек планирования по умолчанию
   */
  public static getSchedulePreferences() {
    return {
      schedulingRule: 0,
      effortDriven: true,
      durationEnteredIn: 5, // Days
      workUnit: 4, // Hours
      newTasksStartToday: false,
      honorRequiredDates: true
    };
  }

  /**
   * Получение настроек календаря по умолчанию
   */
  public static getCalendarPreferences() {
    return {
      hoursPerDay: 8,
      hoursPerWeek: 40,
      daysPerMonth: 20
    };
  }

  /**
   * Получение настроек отображения по умолчанию
   */
  public static getDisplayPreferences() {
    return {
      showTips: true,
      showWelcomeScreen: true,
      animationEnabled: true,
      highContrast: false,
      fontSize: 14,
      fontFamily: 'Arial',
      theme: 'light' as any,
      accentColor: '#1F1F1F'
    };
  }

  /**
   * Получение настроек редактирования по умолчанию
   */
  public static getEditingPreferences() {
    return {
      autoCalculate: true,
      showDependencies: true,
      allowTaskDeletion: true,
      confirmDeletions: true,
      autoLinkTasks: false,
      splitTasksEnabled: true,
      effortDriven: false
    };
  }

  /**
   * Получение настроек расчетов по умолчанию
   */
  public static getCalculationPreferences() {
    return {
      criticalSlack: { value: 0, unit: 'days' as any },
      calculateMultipleCriticalPaths: false,
      tasksAreCriticalIfSlackIsLessThan: { value: 0, unit: 'days' as any },
      showEstimatedDurations: true,
      showActualWork: true,
      showBaselineWork: false
    };
  }

  /**
   * Получение настроек безопасности по умолчанию
   */
  public static getSecurityPreferences() {
    return {
      passwordProtection: false,
      readOnlyRecommended: false,
      encryptDocument: false,
      allowMacros: true,
      trustCenter: {
        enableAllMacros: false,
        disableAllMacros: false,
        trustVbaProjects: false,
        trustedLocations: []
      }
    };
  }

  /**
   * Получение настроек Ганта по умолчанию
   */
  public static getGanttPreferences() {
    return {
      showArrows: true,
      showGridlines: true,
      highlightWeekends: true,
      barHeight: 20,
      rowHeight: 45,
      coloringMode: 'single' as const,
      summaryColoringMode: 'single' as const,
      labelMode: 'name' as const,
      accentColor: '#3b82f6',
      summaryColor: '#1e293b',
      showDeltasInLabels: false
    };
  }
}

