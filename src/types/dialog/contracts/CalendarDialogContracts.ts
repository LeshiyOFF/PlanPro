/**
 * Контракты для календарных диалогов
 */

import { BaseDialogData, BaseDialogResult } from '../IDialogRegistry';

export interface CalendarEditorDialogData extends BaseDialogData {
  readonly calendarId: string;
  readonly name: string;
}

export interface CalendarEditorDialogResult extends BaseDialogResult {
  readonly modified: boolean;
}

export interface ChangeWorkingTimeDialogData extends BaseDialogData {
  readonly calendarId: string;
  readonly workingTime: Record<string, {
    startTime: string;
    endTime: string;
    isWorkingDay: boolean;
  }>;
}

export interface ChangeWorkingTimeDialogResult extends BaseDialogResult {
  readonly modified: boolean;
}
