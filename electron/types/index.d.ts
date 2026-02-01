import type { JavaBridgeEventPayload } from './JavaBridgeEventPayload';

/**
 * Глобальные типы для Electron части приложения.
 * Node.js модули типизируются через @types/node.
 */

declare global {
  /**
   * Информация о JRE
   */
  interface JreInfo {
    version: string;
    path: string;
    vendor: string;
    architecture: string;
    executablePath?: string;
    type?: string;
    homePath?: string;
    isValid?: boolean;
  }

  /**
   * Результат валидации
   */
  interface ValidationResult {
    isValid: boolean;
    errors?: string[];
    warnings?: string[];
    errorMessage?: string;
  }

  /**
   * Интерфейс эмиттера событий Java процесса
   */
  interface IJavaProcessEmitter {
    on(event: string, listener: (payload: JavaBridgeEventPayload) => void): IJavaProcessEmitter;
    emit(event: string, payload?: JavaBridgeEventPayload): boolean;
    once(event: string, listener: (payload: JavaBridgeEventPayload) => void): IJavaProcessEmitter;
    off(event: string, listener: (payload: JavaBridgeEventPayload) => void): IJavaProcessEmitter;
    addListener(event: string, listener: (payload: JavaBridgeEventPayload) => void): IJavaProcessEmitter;
    removeListener(event: string, listener: (payload: JavaBridgeEventPayload) => void): IJavaProcessEmitter;
    removeAllListeners(event?: string): IJavaProcessEmitter;
  }

  namespace Electron {
    interface MessageBoxOptions {
      type?: 'none' | 'info' | 'error' | 'question' | 'warning';
      title?: string;
      message: string;
      detail?: string;
      buttons?: string[];
      defaultId?: number;
      cancelId?: number;
      checkboxLabel?: string;
      checkboxChecked?: boolean;
    }

    interface MessageBoxReturnValue {
      response: number;
      checkboxChecked?: boolean;
    }

    interface OpenDialogOptions {
      title?: string;
      defaultPath?: string;
      buttonLabel?: string;
      filters?: Array<{ name: string; extensions: string[] }>;
      properties?: Array<
        | 'openFile'
        | 'openDirectory'
        | 'multiSelections'
        | 'showHiddenFiles'
        | 'createDirectory'
        | 'promptToCreate'
        | 'noResolveAliases'
        | 'treatPackageAsDirectory'
        | 'dontAddToRecent'
      >;
      message?: string;
    }

    interface OpenDialogReturnValue {
      canceled: boolean;
      filePaths: string[];
      bookmarks?: string[];
    }

    interface SaveDialogOptions {
      title?: string;
      defaultPath?: string;
      buttonLabel?: string;
      filters?: Array<{ name: string; extensions: string[] }>;
      message?: string;
      nameFieldLabel?: string;
      showsTagField?: boolean;
      properties?: Array<
        | 'showHiddenFiles'
        | 'createDirectory'
        | 'treatPackageAsDirectory'
        | 'showOverwriteConfirmation'
        | 'dontAddToRecent'
      >;
    }

    interface SaveDialogReturnValue {
      canceled: boolean;
      filePath?: string;
      bookmark?: string;
    }
  }
}

export {};
