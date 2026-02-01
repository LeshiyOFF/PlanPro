/**
 * Типизированные состояния диалогов с поддержкой Generic
 * Заменяет использование any в DialogState<TData, TResult>
 */

import type { DialogType } from './DialogType'
import type { JsonObject, JsonValue } from '../json-types'

/** Дефолтный тип данных диалога (вместо unknown) */
export type DefaultDialogData = JsonObject;

/** Дефолтный тип результата диалога (вместо unknown) */
export type DefaultDialogResult = JsonValue;

/**
 * Базовые типы данных для диалогов
 */
export type DialogData = Record<string, JsonObject> | null | undefined;

/**
 * Тип данных для логирования
 */
export type LogData = Record<string, JsonObject> | Error | string | number | null | undefined;

/**
 * Типы для результатов диалогов
 */
export interface DialogResult<T = DefaultDialogResult> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Общие действия диалога
 */
export type DialogAction<T = DefaultDialogResult> = {
  type: string;
  handler?: (data: T) => void;
};

/**
 * Типизированное состояние диалога
 */
export interface DialogState<TData = DefaultDialogData, TResult = DefaultDialogResult> {
  type?: DialogType;
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  data: TData | null | undefined;
  result: TResult | null;
}

/**
 * Типизированный DialogContext
 */
export interface DialogContextType<TData = DefaultDialogData, TResult = DefaultDialogResult> {
  currentDialog: DialogState<TData, TResult> | null;
  openDialog: <TD = DefaultDialogData, TR = DefaultDialogResult>(
    type: DialogType,
    data?: TD
  ) => DialogState<TD, TR>;
  closeDialog: () => void;
  submitDialog: <TD = DefaultDialogData, TR = DefaultDialogResult>(
    data: TD
  ) => Promise<DialogResult<TR>>;
  validateDialog?: <TD = DefaultDialogData>(data: TD) => boolean | string;
  isDialogOpen?: (type: DialogType) => boolean;
}

/**
 * Типизированные props для компонента диалога
 */
export interface TypedDialogProps<TData = DefaultDialogData, TResult = DefaultDialogResult> {
  type: string;
  title: string;
  children?: React.ReactNode;
  data?: TData;
  onResult?: (result: DialogResult<TResult>) => void;
}

/**
 * Типизированные actions для диалога
 */
export interface TypedDialogActions<TData = DefaultDialogData, TResult = DefaultDialogResult> {
  onOk?: (data: TData) => void;
  onCancel?: () => void;
  onValidate?: (data: TData) => boolean | string;
  onSubmit?: (data: TData) => Promise<DialogResult<TResult>>;
}
