/**
 * Менеджер промисов для диалогов
 * Управляет асинхронными операциями открытия/закрытия диалогов
 */

import { DialogType, DialogResult } from '@/types/dialog/IDialogRegistry';
import { IDialogOperationResult } from '../interfaces/IDialogService';

/**
 * Информация о промисе диалога
 */
interface DialogPromiseInfo<T extends DialogType> {
  readonly type: T;
  readonly resolve: (result: IDialogOperationResult<T>) => void;
  readonly reject: (error: Error) => void;
  readonly timestamp: Date;
}

/**
 * Менеджер промисов диалогов
 */
export class DialogPromiseManager {
  private promises: Map<string, DialogPromiseInfo<DialogType>> = new Map();
  private readonly timeout: number = 300000; // 5 минут

  /**
   * Создание нового промиса для диалога
   */
  public createPromise<T extends DialogType>(
    type: T
  ): Promise<IDialogOperationResult<T>> {
    // Очистка старого промиса если есть
    this.cleanupPromise(type);

    return new Promise<IDialogOperationResult<T>>((resolve, reject) => {
      const promiseInfo: DialogPromiseInfo<T> = {
        type,
        resolve: resolve as (result: IDialogOperationResult<DialogType>) => void,
        reject,
        timestamp: new Date()
      };

      this.promises.set(type, promiseInfo as DialogPromiseInfo<DialogType>);

      // Автоматическая очистка по таймауту
      setTimeout(() => {
        this.timeoutPromise(type);
      }, this.timeout);
    });
  }

  /**
   * Разрешение промиса с результатом
   */
  public resolvePromise<T extends DialogType>(
    type: T,
    result: DialogResult<T>
  ): void {
    const promiseInfo = this.promises.get(type);
    if (!promiseInfo) {
      console.warn(`No promise found for dialog ${type}`);
      return;
    }

    const operationResult: IDialogOperationResult<T> = {
      success: true,
      result
    };

    promiseInfo.resolve(operationResult as IDialogOperationResult<DialogType>);
    this.cleanupPromise(type);
  }

  /**
   * Отклонение промиса с ошибкой
   */
  public rejectPromise<T extends DialogType>(
    type: T,
    error: string
  ): void {
    const promiseInfo = this.promises.get(type);
    if (!promiseInfo) {
      console.warn(`No promise found for dialog ${type}`);
      return;
    }

    const operationResult: IDialogOperationResult<T> = {
      success: false,
      error
    };

    promiseInfo.resolve(operationResult as IDialogOperationResult<DialogType>);
    this.cleanupPromise(type);
  }

  /**
   * Отмена промиса (пользователь закрыл диалог)
   */
  public cancelPromise<T extends DialogType>(type: T): void {
    this.rejectPromise(type, 'Dialog was cancelled by user');
  }

  /**
   * Проверка наличия активного промиса
   */
  public hasPromise(type: DialogType): boolean {
    return this.promises.has(type);
  }

  /**
   * Очистка промиса
   */
  private cleanupPromise(type: DialogType): void {
    this.promises.delete(type);
  }

  /**
   * Обработка таймаута промиса
   */
  private timeoutPromise(type: DialogType): void {
    if (!this.hasPromise(type)) {
      return;
    }

    const promiseInfo = this.promises.get(type);
    if (promiseInfo) {
      promiseInfo.reject(new Error(`Dialog ${type} timed out`));
      this.cleanupPromise(type);
    }
  }

  /**
   * Очистка всех промисов
   */
  public clearAll(): void {
    this.promises.forEach((_info, type) => {
      this.rejectPromise(type as DialogType, 'All dialogs were closed');
    });
    this.promises.clear();
  }
}
