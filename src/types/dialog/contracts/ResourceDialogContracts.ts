/**
 * Контракты для ресурсных диалогов
 */

import { BaseDialogData, BaseDialogResult } from '../IDialogRegistry'

export interface ResourceMappingDialogData extends BaseDialogData {
  readonly sourceResources: ReadonlyArray<string>;
}

export interface ResourceMappingDialogResult extends BaseDialogResult {
  readonly mapping: Record<string, string>;
}

export interface ResourceAdditionDialogData extends BaseDialogData {
  readonly taskId: string;
}

export interface ResourceAdditionDialogResult extends BaseDialogResult {
  readonly resourceId?: string;
}

export interface ReplaceAssignmentDialogData extends BaseDialogData {
  readonly assignmentId: string;
  readonly currentResourceId: string;
}

export interface ReplaceAssignmentDialogResult extends BaseDialogResult {
  readonly newResourceId?: string;
}
