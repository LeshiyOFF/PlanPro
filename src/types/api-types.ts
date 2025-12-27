/**
 * Типы для API ProjectLibre
 */

// Импортируем конкретные типы
import type {
  MessageBoxOptions,
  FileDialogOptions,
  ProgressDialogOptions,
} from './ui/message-box-types'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ProjectEvent {
  type: 'task-created' | 'task-updated' | 'task-deleted' |
         'resource-created' | 'resource-updated' | 'resource-deleted' |
         'assignment-created' | 'assignment-updated' | 'assignment-deleted'
  payload: unknown
  timestamp: Date
}

export type JavaCommand =
  | 'project.create'
  | 'project.open'
  | 'project.save'
  | 'project.export'
  | 'task.create'
  | 'task.update'
  | 'task.delete'
  | 'resource.create'
  | 'resource.update'
  | 'resource.delete'
  | 'assignment.create'
  | 'assignment.update'
  | 'assignment.delete'
  | 'calendar.get'
  | 'calendar.update'

// Типы для Electron API с конкретными типами
export interface ElectronAPI {
  javaExecute: (command: JavaCommand, args?: string[]) => Promise<unknown>
  getAppVersion: () => Promise<string>
  showMessageBox: (options: MessageBoxOptions) => Promise<unknown>
  showFileDialog: (options: FileDialogOptions) => Promise<unknown>
  showProgressDialog: (options: ProgressDialogOptions) => Promise<unknown>
  openExternal: (url: string) => Promise<void>
  onJavaStarted: (callback: () => void) => void
  onJavaStopped: (callback: () => void) => void
  onJavaError: (callback: (error: Error) => void) => void
  removeAllListeners: (channel: string) => void
}
