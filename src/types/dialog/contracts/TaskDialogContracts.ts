/**
 * Контракты для задачных диалогов
 */

import { BaseDialogData, BaseDialogResult } from '../IDialogRegistry';

export interface UpdateTaskDialogData extends BaseDialogData {
  readonly taskId: string;
  readonly currentProgress: number;
}

export interface UpdateTaskDialogResult extends BaseDialogResult {
  readonly updated: boolean;
}

export interface DelegateTaskDialogData extends BaseDialogData {
  readonly taskId: string;
  readonly currentAssignee: string;
}

export interface DelegateTaskDialogResult extends BaseDialogResult {
  readonly newAssignee?: string;
}

export interface SplitTaskDialogData extends BaseDialogData {
  readonly taskId: string;
  readonly duration: number;
}

export interface SplitTaskDialogResult extends BaseDialogResult {
  readonly splitDate?: Date;
}

export interface SummaryTaskDialogData extends BaseDialogData {
  readonly taskId: string;
  readonly children: ReadonlyArray<string>;
}

export interface SummaryTaskDialogResult extends BaseDialogResult {
  readonly confirmed: boolean;
}

export interface TaskLinksDialogData extends BaseDialogData {
  readonly taskId: string;
  readonly predecessors: ReadonlyArray<string>;
  readonly successors: ReadonlyArray<string>;
}

export interface TaskLinksDialogResult extends BaseDialogResult {
  readonly modified: boolean;
}

export interface TaskNotesDialogData extends BaseDialogData {
  readonly taskId: string;
  readonly notes: string;
}

export interface TaskNotesDialogResult extends BaseDialogResult {
  readonly notes?: string;
}

export interface XbsDependencyDialogData extends BaseDialogData {
  readonly taskId: string;
}

export interface XbsDependencyDialogResult extends BaseDialogResult {
  readonly created: boolean;
}
