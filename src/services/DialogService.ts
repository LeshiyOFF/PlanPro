/**
 * @deprecated Используйте TypedDialogService вместо этого класса
 * Этот файл сохранен для обратной совместимости
 */

import React from 'react'
import { TypedDialogService } from './dialog/TypedDialogService'
import type { JsonValue } from '@/types/json-types'
import type { JsonValue } from '@/types/json-types'

/**
 * @deprecated Legacy интерфейс, используйте IDialogService
 */
export interface DialogRegistration {
  id: string;
  category: string;
  component: React.ComponentType<Record<string, JsonValue>>;
  config?: {
    width?: number;
    height?: number;
    modal?: boolean;
  };
}

/**
 * @deprecated Legacy интерфейс, используйте IDialogState
 */
export interface DialogState {
  id: string;
  isOpen: boolean;
  data?: Record<string, JsonValue>;
  status: string;
  config?: Record<string, JsonValue>;
}

/**
 * @deprecated Используйте TypedDialogService
 * Обертка для обратной совместимости
 */
export class DialogService {
  private static instance: DialogService
  private typedService: TypedDialogService
  private readonly legacyRegistrations = new Map<string, DialogRegistration>()

  private constructor() {
    this.typedService = TypedDialogService.getInstance()
  }

  /**
   * @deprecated Используйте TypedDialogService.getInstance()
   */
  public static getInstance(): DialogService {
    if (!DialogService.instance) {
      DialogService.instance = new DialogService()
    }
    return DialogService.instance
  }

  /**
   * @deprecated Используйте typedService.register()
   */
  public registerDialog(registration: DialogRegistration): void {
    this.legacyRegistrations.set(registration.id, registration)
    console.warn('DialogService.registerDialog is deprecated. Use TypedDialogService.register()')
  }

  /**
   * @deprecated Возвращает legacy-регистрацию по id для обратной совместимости
   */
  public getDialog(id: string): DialogRegistration | null {
    return this.legacyRegistrations.get(id) ?? null
  }

  /**
   * @deprecated Используйте typedService.open()
   */
  public async openDialog(
    _dialogId: string,
    _data?: Record<string, JsonValue>,
  ): Promise<{ success: boolean; error?: string }> {
    console.warn('DialogService.openDialog is deprecated. Use TypedDialogService.open()')
    return { success: false, error: 'Use TypedDialogService' }
  }

  /**
   * @deprecated Используйте typedService.close()
   */
  public closeDialog(_dialogId: string): void {
    console.warn('DialogService.closeDialog is deprecated. Use TypedDialogService.close()')
  }

  /**
   * @deprecated Используйте typedService.isOpen()
   */
  public isDialogOpen(_dialogId: string): boolean {
    console.warn('DialogService.isDialogOpen is deprecated. Use TypedDialogService.isOpen()')
    return false
  }

  /**
   * @deprecated Используйте typedService.closeAll()
   */
  public closeAllDialogs(): void {
    console.warn('DialogService.closeAllDialogs is deprecated. Use TypedDialogService.closeAll()')
  }

  /**
   * @deprecated Используйте typedService.subscribe()
   */
  public subscribe(listener: () => void): () => void {
    return this.typedService.subscribe(listener)
  }
}

/**
 * @deprecated Используйте dialogService из './dialog/TypedDialogService'
 */
export const dialogService = DialogService.getInstance()

/**
 * @deprecated Используйте TypedDialogService.getInstance()
 */
export default DialogService.getInstance()

