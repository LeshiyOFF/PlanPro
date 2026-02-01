import { 
  CalendarDialogData, 
  TaskInformationData, 
  ProjectDialogData, 
  WorkingTimeDialogData, 
  HolidayDialogData,
  ResourceInformationData,
  FindDialogData,
  SettingsDialogData,
  LoginDialogData,
  SplitTaskData,
  NewBaseCalendarDialogData
} from '../calendar-types';

import type { JsonValue } from '@/types/json-types';
import type { 
  DialogResult as TypedDialogResult,
  TypedDialogActions,
  TypedDialogProps,
  DialogState as TypedDialogState,
  DialogContextType as TypedDialogContextType
} from './DialogStateTypes';

export { DialogStatus as TypedDialogStatus } from './LegacyDialogTypes';
export type { 
  TypedDialogResult, 
  TypedDialogActions, 
  TypedDialogProps, 
  TypedDialogState, 
  TypedDialogContextType 
};

/**
 * Legacy типы для обратной совместимости
 */
export { DialogStatus } from './LegacyDialogTypes';
export type {
  IDialogData,
  IDialogActions,
  IDialogConfig,
  DialogResult,
  DialogEvent,
  ValidationRule,
  DialogDataValue
} from './LegacyDialogTypes';
export type {
  FindDialogData,
  SettingsDialogData,
  CalendarDialogData,
  LoginDialogData,
  SplitTaskData
} from '../calendar-types';

export type { LoginDialogData as ILoginDialogData } from '../calendar-types';

/**
 * Конкретные типы для каждого диалога
 */
export type CalendarDialogState = TypedDialogState<CalendarDialogData, TypedDialogResult<CalendarDialogData>>;
export type TaskInfoDialogState = TypedDialogState<TaskInformationData, TypedDialogResult<TaskInformationData>>;
export type ProjectDialogState = TypedDialogState<ProjectDialogData, TypedDialogResult<ProjectDialogData>>;
export type ResourceDialogState = TypedDialogState<ResourceInformationData, TypedDialogResult<ResourceInformationData>>;
export type WorkingTimeDialogState = TypedDialogState<WorkingTimeDialogData, TypedDialogResult<WorkingTimeDialogData>>;
export type HolidayDialogState = TypedDialogState<HolidayDialogData, TypedDialogResult<HolidayDialogData>>;
export type FindDialogState = TypedDialogState<FindDialogData, TypedDialogResult<FindDialogData>>;
export type SettingsDialogState = TypedDialogState<SettingsDialogData, TypedDialogResult<SettingsDialogData>>;
export type LoginDialogState = TypedDialogState<LoginDialogData, TypedDialogResult<LoginDialogData>>;
export type SplitTaskDialogState = TypedDialogState<SplitTaskData, TypedDialogResult<SplitTaskData>>;
export type NewBaseCalendarDialogState = TypedDialogState<NewBaseCalendarDialogData, TypedDialogResult<NewBaseCalendarDialogData>>;

/**
 * Конкретные действия для каждого диалога
 */
export interface CalendarDialogActions extends TypedDialogActions<CalendarDialogData, TypedDialogResult<CalendarDialogData>> {}
export interface TaskInfoDialogActions extends TypedDialogActions<TaskInformationData, TypedDialogResult<TaskInformationData>> {}
export interface ProjectDialogActions extends TypedDialogActions<ProjectDialogData, TypedDialogResult<ProjectDialogData>> {}
export interface ResourceDialogActions extends TypedDialogActions<ResourceInformationData, TypedDialogResult<ResourceInformationData>> {}
export interface WorkingTimeActions extends TypedDialogActions<WorkingTimeDialogData, TypedDialogResult<WorkingTimeDialogData>> {}
export interface HolidayActions extends TypedDialogActions<HolidayDialogData, TypedDialogResult<HolidayDialogData>> {}
export interface FindDialogActions extends TypedDialogActions<FindDialogData, TypedDialogResult<FindDialogData>> {}
export interface SettingsActions extends TypedDialogActions<SettingsDialogData, TypedDialogResult<SettingsDialogData>> {}
export interface LoginActions extends TypedDialogActions<LoginDialogData, TypedDialogResult<LoginDialogData>> {}
export interface SplitTaskActions extends TypedDialogActions<SplitTaskData, TypedDialogResult<SplitTaskData>> {}

/**
 * Типизированные props для каждого диалога
 */
export interface CalendarDialogProps extends TypedDialogProps<CalendarDialogData, CalendarDialogActions> {}
export interface TaskInfoDialogProps extends TypedDialogProps<TaskInformationData, TaskInfoDialogActions> {}
export interface ProjectDialogProps extends TypedDialogProps<ProjectDialogData, ProjectDialogActions> {}
export interface ResourceDialogProps extends TypedDialogProps<ResourceInformationData, ResourceDialogActions> {}
export interface WorkingTimeDialogProps extends TypedDialogProps<WorkingTimeDialogData, WorkingTimeActions> {}
export interface HolidayDialogProps extends TypedDialogProps<HolidayDialogData, HolidayActions> {}
export interface FindDialogProps extends TypedDialogProps<FindDialogData, FindDialogActions> {}
export interface SettingsDialogProps extends TypedDialogProps<SettingsDialogData, SettingsActions> {}
export interface LoginDialogProps extends TypedDialogProps<LoginDialogData, LoginActions> {}

/**
 * Результаты диалогов
 */
export type CalendarDialogResult = TypedDialogResult<CalendarDialogData>;
export type TaskInfoDialogResult = TypedDialogResult<TaskInformationData>;
export type ProjectDialogResult = TypedDialogResult<ProjectDialogData>;
export type ResourceDialogResult = TypedDialogResult<ResourceInformationData>;
export type WorkingTimeResult = TypedDialogResult<WorkingTimeDialogData>;
export type HolidayDialogResult = TypedDialogResult<HolidayDialogData>;
export type FindDialogResult = TypedDialogResult<FindDialogData>;
export type SettingsDialogResult = TypedDialogResult<SettingsDialogData>;
export type LoginDialogResult = TypedDialogResult<LoginDialogData>;

/**
 * Интерфейсы для специфичных данных
 */
export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'holiday' | 'working';
  startTime?: string;
  endTime?: string;
}

/**
 * Исключения календаря
 */
export type WorkingTimeExceptions = Holiday[];

/**
 * Полные данные календаря
 */
export interface FullCalendarData {
  workingTime: Record<'day0' | 'day1' | 'day2' | 'day3' | 'day4' | 'day5' | 'day6', { startTime: string; endTime: string; isWorkingDay: boolean }>;
  exceptions: WorkingTimeExceptions;
}

/**
 * Конкретные типы для диалогов замены
 * Устаревается совместимость с существующим кодом
 */
export type LegacyDialogData = Record<string, JsonValue>;
