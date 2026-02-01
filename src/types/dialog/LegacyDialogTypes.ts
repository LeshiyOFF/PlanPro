/**
 * Legacy типы для обратной совместимости
 * @deprecated Используйте типы из IDialogRegistry и IDialogService
 */

/** Примитивы и вложенные записи для полей диалога (без any) */
type DialogDataValueRecord = Record<string, string | number | boolean | Date | string[] | Record<string, string | number | boolean> | null | undefined>;

/** Допустимые значения полей данных диалога (без any), без рекурсии */
export type DialogDataValue =
  | string
  | number
  | boolean
  | Date
  | string[]
  | object[]
  | DialogDataValueRecord
  | null
  | undefined;

export interface IDialogData {
  id: string;
  title: string;
  timestamp: Date;
  description?: string;
  [key: string]: DialogDataValue;
}

/** Действия диалога, типизированные по данным (устраняет приведение типов в диалогах) */
export interface IDialogActions<TData extends IDialogData = IDialogData> {
  onOk?: (data?: TData) => void | Promise<void>;
  onCancel?: () => void;
  onHelp?: () => void;
  onValidate?: (data: TData) => boolean | string | Promise<boolean | string>;
}

export interface IDialogConfig {
  width?: number;
  height?: number;
  modal?: boolean;
  showHelp?: boolean;
  closeOnEscape?: boolean;
  closeOnEnter?: boolean;
}

export interface DialogResult<T = Record<string, DialogDataValue>> {
  success: boolean;
  data?: T;
  error?: string;
  action?: 'ok' | 'cancel' | 'close';
}

export enum DialogStatus {
  INITIAL = 'initial',
  LOADING = 'loading',
  VALIDATING = 'validating',
  READY = 'ready',
  SUCCESS = 'success',
  ERROR = 'error'
}

export interface DialogEvent {
  type: string;
  dialogId: string;
  timestamp: Date;
  data?: Record<string, DialogDataValue>;
}

export interface ValidationRule {
  field: string;
  type?: string;
  message?: string;
  parameters?: Record<string, DialogDataValue> | number | string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string | RegExp;
  custom?: (value: string) => boolean | string;
  validate?: (value: string | number | boolean) => string | null;
}
