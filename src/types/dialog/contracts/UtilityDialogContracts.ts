/**
 * Контракты для утилитарных диалогов (поиск, настройки)
 */

import { BaseDialogData, BaseDialogResult } from '../IDialogRegistry';

/**
 * Поисковые диалоги
 */
export interface FilterDialogData extends BaseDialogData {
  readonly currentFilters: ReadonlyArray<{
    field: string;
    operator: string;
    value: string;
  }>;
}

export interface FilterDialogResult extends BaseDialogResult {
  readonly filters?: ReadonlyArray<{
    field: string;
    operator: string;
    value: string;
  }>;
}

export interface AdvancedSearchDialogData extends BaseDialogData {
  readonly searchFields: ReadonlyArray<string>;
}

export interface AdvancedSearchDialogResult extends BaseDialogResult {
  readonly query?: string;
  readonly fields?: ReadonlyArray<string>;
}

export interface FindAndReplaceDialogData extends BaseDialogData {
  readonly findText: string;
  readonly replaceText: string;
}

export interface FindAndReplaceDialogResult extends BaseDialogResult {
  readonly replaced: number;
}

export interface GoToDialogData extends BaseDialogData {
  readonly targetType: 'task' | 'resource' | 'date';
}

export interface GoToDialogResult extends BaseDialogResult {
  readonly target?: string;
}

/**
 * Диалоги настроек
 */
export interface GanttSettingsDialogData extends BaseDialogData {
  readonly showCriticalPath: boolean;
  readonly showBaseline: boolean;
}

export interface GanttSettingsDialogResult extends BaseDialogResult {
  readonly saved: boolean;
}

export interface NotificationSettingsDialogData extends BaseDialogData {
  readonly emailEnabled: boolean;
  readonly pushEnabled: boolean;
}

export interface NotificationSettingsDialogResult extends BaseDialogResult {
  readonly saved: boolean;
}

export interface SecuritySettingsDialogData extends BaseDialogData {
  readonly section: string;
}

export interface SecuritySettingsDialogResult extends BaseDialogResult {
  readonly saved: boolean;
}

export interface GanttChartOptionsDialogData extends BaseDialogData {
  readonly barHeight: number;
  readonly showGrid: boolean;
}

export interface GanttChartOptionsDialogResult extends BaseDialogResult {
  readonly saved: boolean;
}

export interface CalculationOptionsDialogData extends BaseDialogData {
  readonly autoCalculate: boolean;
  readonly criticalSlack: number;
}

export interface CalculationOptionsDialogResult extends BaseDialogResult {
  readonly saved: boolean;
}

export interface OptionsDialogData extends BaseDialogData {
  readonly section: string;
}

export interface OptionsDialogResult extends BaseDialogResult {
  readonly saved: boolean;
}
