/**
 * Реестр типизированных диалогов
 * Определяет контракты между типами диалогов и их данными
 */

import * as ProjectContracts from './contracts/ProjectDialogContracts';
import * as TaskContracts from './contracts/TaskDialogContracts';
import * as ResourceContracts from './contracts/ResourceDialogContracts';
import * as CalendarContracts from './contracts/CalendarDialogContracts';
import * as UtilityContracts from './contracts/UtilityDialogContracts';

/**
 * Маппинг типов диалогов к их Data и Result типам
 */
export interface DialogDataMap {
  // Основные диалоги
  welcome: { data: WelcomeDialogData; result: void };
  about: { data: AboutDialogData; result: void };
  
  // Проектные диалоги
  'project-information': { data: ProjectInformationDialogData; result: ProjectInformationResult };
  'projects': { data: ProjectContracts.ProjectsDialogData; result: ProjectContracts.ProjectsDialogResult };
  'update-project': { data: ProjectContracts.UpdateProjectDialogData; result: ProjectContracts.UpdateProjectDialogResult };
  'rename-project': { data: ProjectContracts.RenameProjectDialogData; result: ProjectContracts.RenameProjectDialogResult };
  'open-project': { data: ProjectContracts.OpenProjectDialogData; result: ProjectContracts.OpenProjectDialogResult };
  
  // Задачные диалоги
  'task-details': { data: TaskDetailsDialogData; result: TaskDetailsResult };
  'update-task': { data: TaskContracts.UpdateTaskDialogData; result: TaskContracts.UpdateTaskDialogResult };
  'delegate-task': { data: TaskContracts.DelegateTaskDialogData; result: TaskContracts.DelegateTaskDialogResult };
  'split-task': { data: TaskContracts.SplitTaskDialogData; result: TaskContracts.SplitTaskDialogResult };
  'summary-task': { data: TaskContracts.SummaryTaskDialogData; result: TaskContracts.SummaryTaskDialogResult };
  'task-links': { data: TaskContracts.TaskLinksDialogData; result: TaskContracts.TaskLinksDialogResult };
  'task-notes': { data: TaskContracts.TaskNotesDialogData; result: TaskContracts.TaskNotesDialogResult };
  'xbs-dependency': { data: TaskContracts.XbsDependencyDialogData; result: TaskContracts.XbsDependencyDialogResult };
  
  // Ресурсные диалоги
  'resource-information': { data: ResourceInformationDialogData; result: ResourceInformationResult };
  'assignment': { data: AssignmentDialogData; result: AssignmentResult };
  'resource-mapping': { data: ResourceContracts.ResourceMappingDialogData; result: ResourceContracts.ResourceMappingDialogResult };
  'resource-addition': { data: ResourceContracts.ResourceAdditionDialogData; result: ResourceContracts.ResourceAdditionDialogResult };
  'replace-assignment': { data: ResourceContracts.ReplaceAssignmentDialogData; result: ResourceContracts.ReplaceAssignmentDialogResult };
  
  // Календарные диалоги
  'new-base-calendar': { data: NewBaseCalendarDialogData; result: NewBaseCalendarResult };
  'holiday': { data: HolidayDialogData; result: HolidayResult };
  'working-time': { data: WorkingTimeDialogData; result: WorkingTimeResult };
  'calendar-editor': { data: CalendarContracts.CalendarEditorDialogData; result: CalendarContracts.CalendarEditorDialogResult };
  'change-working-time': { data: CalendarContracts.ChangeWorkingTimeDialogData; result: CalendarContracts.ChangeWorkingTimeDialogResult };
  
  // Информационные диалоги
  'earned-value': { data: ProjectContracts.EarnedValueDialogData; result: ProjectContracts.EarnedValueDialogResult };
  'project-statistics': { data: ProjectContracts.ProjectStatisticsDialogData; result: ProjectContracts.ProjectStatisticsDialogResult };
  
  // Поисковые диалоги
  'find': { data: FindDialogData; result: FindResult };
  'filter': { data: UtilityContracts.FilterDialogData; result: UtilityContracts.FilterDialogResult };
  'advanced-search': { data: UtilityContracts.AdvancedSearchDialogData; result: UtilityContracts.AdvancedSearchDialogResult };
  'find-and-replace': { data: UtilityContracts.FindAndReplaceDialogData; result: UtilityContracts.FindAndReplaceDialogResult };
  'go-to': { data: UtilityContracts.GoToDialogData; result: UtilityContracts.GoToDialogResult };
  
  // Диалоги настроек
  'settings': { data: SettingsDialogData; result: SettingsResult };
  'baseline': { data: BaselineDialogData; result: BaselineResult };
  'dependency': { data: DependencyDialogData; result: DependencyResult };
  'gantt-settings': { data: UtilityContracts.GanttSettingsDialogData; result: UtilityContracts.GanttSettingsDialogResult };
  'notification-settings': { data: UtilityContracts.NotificationSettingsDialogData; result: UtilityContracts.NotificationSettingsDialogResult };
  'security-settings': { data: UtilityContracts.SecuritySettingsDialogData; result: UtilityContracts.SecuritySettingsDialogResult };
  'gantt-chart-options': { data: UtilityContracts.GanttChartOptionsDialogData; result: UtilityContracts.GanttChartOptionsDialogResult };
  'calculation-options': { data: UtilityContracts.CalculationOptionsDialogData; result: UtilityContracts.CalculationOptionsDialogResult };
  'options': { data: UtilityContracts.OptionsDialogData; result: UtilityContracts.OptionsDialogResult };
}

/**
 * Типы диалогов (строго типизированные ключи)
 */
export type DialogType = keyof DialogDataMap;

/**
 * Извлечение типа данных для конкретного диалога
 */
export type DialogData<T extends DialogType> = DialogDataMap[T]['data'];

/**
 * Извлечение типа результата для конкретного диалога
 */
export type DialogResult<T extends DialogType> = DialogDataMap[T]['result'];

/**
 * Базовый интерфейс для данных диалога
 */
export interface BaseDialogData {
  readonly title?: string;
  readonly projectId?: string;
}

/**
 * Базовый интерфейс для результата диалога
 */
export interface BaseDialogResult {
  readonly success: boolean;
  readonly error?: string;
}

/**
 * Конкретные типы данных для каждого диалога
 */
export interface WelcomeDialogData extends BaseDialogData {
  readonly showOnStartup: boolean;
}

export interface ProjectInformationDialogData extends BaseDialogData {
  readonly projectId: string;
  readonly name: string;
  readonly startDate: Date;
  readonly manager?: string;
}

export interface ProjectInformationResult extends BaseDialogResult {
  readonly name?: string;
  readonly startDate?: Date;
  readonly manager?: string;
}

export interface TaskDetailsDialogData extends BaseDialogData {
  readonly taskId: string;
  readonly name: string;
  readonly duration: number;
  readonly startDate: Date;
}

export interface TaskDetailsResult extends BaseDialogResult {
  readonly name?: string;
  readonly duration?: number;
  readonly startDate?: Date;
}

export interface ResourceInformationDialogData extends BaseDialogData {
  readonly resourceId: string;
  readonly name: string;
  readonly type: 'work' | 'material' | 'cost';
}

export interface ResourceInformationResult extends BaseDialogResult {
  readonly name?: string;
  readonly type?: 'work' | 'material' | 'cost';
}

export interface NewBaseCalendarDialogData extends BaseDialogData {
  readonly baseCalendarId?: string;
  readonly name: string;
}

export interface NewBaseCalendarResult extends BaseDialogResult {
  readonly calendarId?: string;
  readonly name?: string;
}

export interface HolidayDialogData extends BaseDialogData {
  readonly holidayId?: string;
  readonly name: string;
  readonly date: Date;
}

export interface HolidayResult extends BaseDialogResult {
  readonly holidayId?: string;
  readonly name?: string;
  readonly date?: Date;
}

export interface WorkingTimeDialogData extends BaseDialogData {
  readonly workingTime: Record<string, { 
    startTime: string; 
    endTime: string; 
    isWorkingDay: boolean;
  }>;
}

export interface WorkingTimeResult extends BaseDialogResult {
  readonly workingTime?: Record<string, {
    startTime: string;
    endTime: string;
    isWorkingDay: boolean;
  }>;
}

export interface BaselineDialogData extends BaseDialogData {
  readonly baselineNumber: number;
}

export interface BaselineResult extends BaseDialogResult {
  readonly saved: boolean;
}

export interface DependencyDialogData extends BaseDialogData {
  readonly predecessorId: string;
  readonly successorId: string;
  readonly type: 'FS' | 'SS' | 'FF' | 'SF';
}

export interface DependencyResult extends BaseDialogResult {
  readonly created: boolean;
}

export interface AssignmentDialogData extends BaseDialogData {
  readonly taskId: string;
  readonly resourceId: string;
  readonly units: number;
}

export interface AssignmentResult extends BaseDialogResult {
  readonly assigned: boolean;
}

export interface FindDialogData extends BaseDialogData {
  readonly query: string;
}

export interface FindResult extends BaseDialogResult {
  readonly found: boolean;
  readonly matches?: number;
}

export interface SettingsDialogData extends BaseDialogData {
  readonly section: string;
}

export interface SettingsResult extends BaseDialogResult {
  readonly saved: boolean;
}

export interface AboutDialogData extends BaseDialogData {
  readonly version: string;
}
