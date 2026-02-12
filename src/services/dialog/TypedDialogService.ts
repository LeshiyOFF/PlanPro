/**
 * Типизированный сервис управления диалогами
 * Главная реализация IDialogService с полной типизацией
 */

import { DialogType, DialogData, DialogResult } from '@/types/dialog/IDialogRegistry'
import {
  IDialogService,
  IDialogState,
  IDialogRegistration,
  IDialogConfig,
  IDialogOperationResult,
} from '../interfaces/IDialogService'
import { DialogStateStorage, DialogRegistry, DialogConfigManager } from './DialogServiceCore'
import { DialogPromiseManager } from './DialogPromiseManager'
import { generateDialogId } from '@/utils/id-utils'

/**
 * Типизированный сервис управления диалогами
 */
export class TypedDialogService implements IDialogService {
  private static instance: TypedDialogService

  private readonly stateStorage: DialogStateStorage
  private readonly registry: DialogRegistry
  private readonly configManager: DialogConfigManager
  private readonly promiseManager: DialogPromiseManager

  private constructor() {
    this.stateStorage = new DialogStateStorage()
    this.registry = new DialogRegistry()
    this.configManager = new DialogConfigManager()
    this.promiseManager = new DialogPromiseManager()
  }

  /**
   * Получение singleton экземпляра
   */
  public static getInstance(): TypedDialogService {
    if (!TypedDialogService.instance) {
      TypedDialogService.instance = new TypedDialogService()
    }
    return TypedDialogService.instance
  }

  /**
   * Регистрация диалога
   */
  public register<T extends DialogType>(
    registration: IDialogRegistration<T>,
  ): void {
    this.registry.register(registration)
  }

  /**
   * Открытие диалога
   */
  public async open<T extends DialogType>(
    type: T,
    data: DialogData<T>,
    config?: Partial<IDialogConfig>,
  ): Promise<IDialogOperationResult<T>> {
    // Проверка регистрации
    const registration = this.registry.getRegistration(type)
    if (!registration) {
      return {
        success: false,
        error: `Dialog ${type} is not registered`,
      }
    }

    // Закрытие предыдущего диалога того же типа
    if (this.isOpen(type)) {
      this.close(type)
    }

    // Слияние конфигурации (резерв для расширения состояния диалога)
    void this.configManager.mergeConfig(registration.config, config)

    const state: IDialogState<T> = {
      id: generateDialogId(),
      type,
      isOpen: true,
      isSubmitting: false,
      data,
      error: null,
    }

    this.stateStorage.setState(state)

    // Создание промиса
    return this.promiseManager.createPromise(type)
  }

  /**
   * Закрытие диалога
   */
  public close<T extends DialogType>(
    type: T,
    result?: DialogResult<T>,
  ): void {
    const state = this.stateStorage.getState(type)
    if (!state) {
      return
    }

    if (result) {
      this.promiseManager.resolvePromise(type, result)
    } else {
      this.promiseManager.cancelPromise(type)
    }

    this.stateStorage.deleteState(type)
  }

  /**
   * Получение состояния диалога
   */
  public getState<T extends DialogType>(type: T): IDialogState<T> | null {
    return this.stateStorage.getState(type)
  }

  /**
   * Проверка открыт ли диалог
   */
  public isOpen(type: DialogType): boolean {
    const state = this.stateStorage.getState(type)
    return state?.isOpen || false
  }

  /**
   * Закрытие всех диалогов
   */
  public closeAll(): void {
    this.stateStorage.clearAll()
    this.promiseManager.clearAll()
  }

  /**
   * Подписка на изменения
   */
  public subscribe(listener: () => void): () => void {
    return this.stateStorage.subscribe(listener)
  }
}

/**
 * Экспорт singleton экземпляра
 */
export const dialogService = TypedDialogService.getInstance()
