/**
 * Интерфейсы для системы пользовательских настроек
 * Следует SOLID принципам и Clean Architecture
 */

import { ViewType } from '@/types/ViewTypes';
import { Duration } from '@/types/project-types';

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
  defaultOvertimeRate: number;
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
 * Настройки календаря (CalendarOptions в Java)
 */
export interface ICalendarPreferences {
  hoursPerDay: number;
  hoursPerWeek: number;
  daysPerMonth: number;
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
 * Настройки редактирования
 */
export interface IEditingPreferences {
  autoCalculate: boolean;
  showDependencies: boolean;
  allowTaskDeletion: boolean;
  confirmDeletions: boolean;
  autoLinkTasks: boolean;
  splitTasksEnabled: boolean;
  effortDriven: boolean;
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
  AUTO = 'auto'
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
  CALENDAR = 'calendar'
}

/**
 * События изменения настроек
 */
export interface IPreferencesChangeEvent {
  category: PreferencesCategory;
  key: string;
  oldValue: any;
  newValue: any;
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
}

