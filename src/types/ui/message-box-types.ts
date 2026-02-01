/**
 * Типы для диалоговых окон и сообщений в UI
 * Заменяют использование `any` для строгой типизации
 */

import type { JsonObject } from '../json-types';

// Базовые типы диалогов
export interface BaseDialogOptions {
  title: string
  message?: string
  modal?: boolean
  closable?: boolean
  resizable?: boolean
}

// Типы кнопок в диалогах
export interface DialogButton {
  label: string
  value?: string | number
  primary?: boolean
  danger?: boolean
  disabled?: boolean
}

// Message Box опции
export interface MessageBoxOptions extends BaseDialogOptions {
  type: 'info' | 'warning' | 'error' | 'question'
  buttons: DialogButton[]
  defaultButton?: number
  cancelButton?: number
  icon?: string
}

// Confirm Dialog опции
export interface ConfirmOptions extends BaseDialogOptions {
  type: 'confirm' | 'warning' | 'danger'
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void | Promise<void>
}

// Input Dialog опции
export interface InputOptions extends BaseDialogOptions {
  type: 'text' | 'password' | 'number' | 'email'
  placeholder?: string
  defaultValue?: string
  required?: boolean
  validation?: {
    pattern?: RegExp
    minLength?: number
    maxLength?: number
    custom?: (value: string) => string | null
  }
  onSubmit?: (value: string) => void | Promise<void>
  onCancel?: () => void | Promise<void>
}

// File Dialog опции
export interface FileDialogOptions {
  title: string
  mode: 'open' | 'save'
  filters?: {
    name: string
    extensions: string[]
  }[]
  defaultPath?: string
  allowMulti?: boolean
}

// Progress Dialog опции
export interface ProgressDialogOptions extends BaseDialogOptions {
  progress?: number
  indeterminate?: boolean
  canCancel?: boolean
  status?: string
  onCancel?: () => void
}

// Toast уведомления
export interface ToastOptions {
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  duration?: number
  action?: {
    label: string
    callback: () => void
  }
  persistent?: boolean
}

// Результаты диалогов
export interface DialogResult {
  button: DialogButton
  value?: string | number
  cancelled: boolean
}

export interface InputResult extends DialogResult {
  value: string
}

export interface FileResult extends DialogResult {
  filePath?: string
  filePaths?: string[]
}

// Системные события UI
export interface UIEvent {
  type: string
  timestamp: Date
  source: string
  data?: JsonObject
}

export interface WindowEvent extends UIEvent {
  type: 'minimize' | 'maximize' | 'restore' | 'close' | 'focus' | 'blur'
  windowId?: string
}

export interface MenuEvent extends UIEvent {
  type: 'click' | 'hover' | 'context'
  menuItemId: string
  menuType: 'main' | 'context' | 'ribbon'
}

// Типы ошибок UI
export interface UIError {
  code: string
  message: string
  details?: JsonObject
  stack?: string
  timestamp: Date
  recoverable?: boolean
  userAction?: string
}
