/**
 * Интерфейсы для системы пользовательских настроек
 * Следует SOLID принципам и Clean Architecture
 */

import { ViewType } from '@/types/ViewTypes'
import type { Duration } from '@/types/Master_Functionality_Catalog'

/**
 * Настройки диаграммы Ганта
 */
export interface IGanttPreferences {
  showArrows: boolean;
  showGridlines: boolean;
  highlightWeekends: boolean;
  barHeight: number;
  rowHeight: number;
  coloringMode: 'single' | 'rainbow' | 'status';
  summaryColoringMode: 'single' | 'auto';
  labelMode: 'none' | 'name' | 'resource' | 'dates';
  accentColor: string;
  summaryColor: string;
  showDeltasInLabels: boolean;
  /** VB.11: Подсвечивать задачи с отрицательным slack (просроченные) */
  showNegativeSlack: boolean;
}

/**
 * Основной интерфейс пользовательских настроек
 */
export interface IUserPreferences {
  general: IGeneralPreferences;
  display: IDisplayPreferences;
  editing: IEditingPreferences;
  calculations: ICalculationPreferences;
  security: ISecurityPreferences;
  schedule: ISchedulePreferences;
  calendar: ICalendarPreferences;
  gantt: IGanttPreferences;
}

/**
 * Общие настройки
 */
export interface IGeneralPreferences {
  userName: string;
  companyName: string;
  defaultView: ViewType;
  autoSave: boolean;
  autoSaveInterval: number;
  defaultCalendar: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  language: string;
  defaultStandardRate: number;
}

/**
 * Настройки планирования (ScheduleOption в Java)
 */
export interface ISchedulePreferences {
  schedulingRule: number; // 0: Fixed Units, 1: Fixed Duration, 2: Fixed Work
  effortDriven: boolean;
  durationEnteredIn: number; // TimeUnit: 3=Minutes, 4=Hours, 5=Days, etc.
  workUnit: number;
  newTasksStartToday: boolean;
  honorRequiredDates: boolean;
}

/**
 * Режим расчёта длительности
 * - 'working': Рабочие часы (по умолчанию, использует hoursPerDay)
 * - 'calendar': Календарные сутки (24 часа в сутки)
 */
export type DurationCalculationMode = 'working' | 'calendar';

/**
 * Настройки календаря (CalendarOptions в Java)
 */
export interface ICalendarPreferences {
  hoursPerDay: number;
  hoursPerWeek: number;
  daysPerMonth: number;
  /** Режим расчёта длительности: рабочие часы или календарные сутки */
  durationCalculationMode: DurationCalculationMode;
}

/**
 * Настройки отображения
 */
export interface IDisplayPreferences {
  showTips: boolean;
  showWelcomeScreen: boolean;
  animationEnabled: boolean;
  highContrast: boolean;
  fontSize: number;
  fontFamily: string;
  theme: Theme;
  accentColor: string;
}

/**
 * Настройки редактирования.
 * Примечание: effortDriven удалён (09.02.2026) - единый источник: schedule.effortDriven
 */
export interface IEditingPreferences {
  autoCalculate: boolean;
  showDependencies: boolean;
  allowTaskDeletion: boolean;
  confirmDeletions: boolean;
  splitTasksEnabled: boolean;
}

/**
 * Настройки расчетов
 */
export interface ICalculationPreferences {
  criticalSlack: Duration;
  calculateMultipleCriticalPaths: boolean;
  tasksAreCriticalIfSlackIsLessThan: Duration;
  showEstimatedDurations: boolean;
  showActualWork: boolean;
  showBaselineWork: boolean;
}

/**
 * Настройки безопасности
 */
export interface ISecurityPreferences {
  passwordProtection: boolean;
  readOnlyRecommended: boolean;
  encryptDocument: boolean;
  allowMacros: boolean;
  trustCenter: ITrustCenterSettings;
}

/**
 * Настройки центра доверия
 */
export interface ITrustCenterSettings {
  enableAllMacros: boolean;
  disableAllMacros: boolean;
  trustVbaProjects: boolean;
  trustedLocations: string[];
}

/**
 * Темы интерфейса
 */
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  HIGH_CONTRAST = 'high_contrast',
  AUTO = 'auto',
  SYSTEM = 'system'
}

/**
 * Категории настроек
 */
export enum PreferencesCategory {
  GENERAL = 'general',
  DISPLAY = 'display',
  EDITING = 'editing',
  CALCULATIONS = 'calculations',
  SECURITY = 'security',
  SCHEDULE = 'schedule',
  CALENDAR = 'calendar',
  GANTT = 'gantt'
}

/**
 * События изменения настроек
 */
export interface IPreferencesChangeEvent {
  category: PreferencesCategory;
  key: string;
  oldValue: string | number | boolean | object | null;
  newValue: string | number | boolean | object | null;
}

/**
 * Сервис для работы с пользовательскими настройками
 */
export interface IUserPreferencesService {
  getPreferences(): IUserPreferences;
  getGeneralPreferences(): IGeneralPreferences;
  getDisplayPreferences(): IDisplayPreferences;
  getEditingPreferences(): IEditingPreferences;
  getCalculationPreferences(): ICalculationPreferences;
  getSecurityPreferences(): ISecurityPreferences;
  getSchedulePreferences(): ISchedulePreferences;
  getCalendarPreferences(): ICalendarPreferences;

  updateGeneralPreferences(preferences: Partial<IGeneralPreferences>): Promise<void>;
  updateDisplayPreferences(preferences: Partial<IDisplayPreferences>): Promise<void>;
  updateEditingPreferences(preferences: Partial<IEditingPreferences>): Promise<void>;
  updateCalculationPreferences(preferences: Partial<ICalculationPreferences>): Promise<void>;
  updateSecurityPreferences(preferences: Partial<ISecurityPreferences>): Promise<void>;
  updateSchedulePreferences(preferences: Partial<ISchedulePreferences>): Promise<void>;
  updateCalendarPreferences(preferences: Partial<ICalendarPreferences>): Promise<void>;
  updateGanttPreferences(preferences: Partial<IGanttPreferences>): Promise<void>;

  resetToDefaults(category?: PreferencesCategory): Promise<void>;
  exportPreferences(): string;
  importPreferences(data: string): Promise<void>;

  subscribe(listener: (event: IPreferencesChangeEvent) => void): () => void;
}

/**
 * Конфигурация для управления настройками
 */
export interface IPreferencesConfig {
  storageKey: string;
  defaultPreferences: IUserPreferences;
  enableAutoSave: boolean;
  enableEncryption: boolean;
  autoSaveInterval: number;
}

/**
 * Валидаторы настроек
 */
export interface IPreferencesValidator {
  validateGeneral(preferences: IGeneralPreferences): boolean;
  validateDisplay(preferences: IDisplayPreferences): boolean;
  validateEditing(preferences: IEditingPreferences): boolean;
  validateCalculations(preferences: ICalculationPreferences): boolean;
  validateSecurity(preferences: ISecurityPreferences): boolean;
  validateSchedule(preferences: ISchedulePreferences): boolean;
  validateCalendar(preferences: ICalendarPreferences): boolean;
  validateGantt(preferences: IGanttPreferences): boolean;
}

