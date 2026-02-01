/**
 * Ядро сервиса управления диалогами
 * Реализует базовую логику хранения и управления состоянием
 */

import { DialogType } from '@/types/dialog/IDialogRegistry'
import {
  IDialogState,
  IDialogRegistration,
  IDialogConfig,
} from '../interfaces/IDialogService'

/**
 * Хранилище состояний диалогов
 */
export class DialogStateStorage {
  private states: Map<string, IDialogState<DialogType>> = new Map()
  private listeners: Set<() => void> = new Set()

  public setState<T extends DialogType>(state: IDialogState<T>): void {
    this.states.set(state.type, state)
    this.notifyListeners()
  }

  public getState<T extends DialogType>(type: T): IDialogState<T> | null {
    const state = this.states.get(type)
    return state ? (state as IDialogState<T>) : null
  }

  public deleteState(type: DialogType): void {
    this.states.delete(type)
    this.notifyListeners()
  }

  public clearAll(): void {
    this.states.clear()
    this.notifyListeners()
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener()
      } catch (error) {
        console.error('Dialog listener error:', error)
      }
    })
  }
}

/**
 * Реестр зарегистрированных диалогов
 */
export class DialogRegistry {
  private registrations: Map<string, IDialogRegistration<DialogType>> = new Map()

  public register<T extends DialogType>(
    registration: IDialogRegistration<T>,
  ): void {
    if (this.registrations.has(registration.type)) {
      console.warn(`Dialog ${registration.type} already registered`)
      return
    }
    this.registrations.set(registration.type, registration as IDialogRegistration<DialogType>)
  }

  public getRegistration<T extends DialogType>(
    type: T,
  ): IDialogRegistration<T> | null {
    const registration = this.registrations.get(type)
    return registration ? (registration as IDialogRegistration<T>) : null
  }

  public isRegistered(type: DialogType): boolean {
    return this.registrations.has(type)
  }

  public clear(): void {
    this.registrations.clear()
  }
}

/**
 * Менеджер конфигураций диалогов
 */
export class DialogConfigManager {
  private defaultConfig: IDialogConfig = {
    modal: true,
    resizable: false,
    width: 600,
    height: 400,
  }

  public mergeConfig(
    baseConfig: IDialogConfig,
    overrides?: Partial<IDialogConfig>,
  ): IDialogConfig {
    return {
      ...this.defaultConfig,
      ...baseConfig,
      ...overrides,
    }
  }

  public getDefaultConfig(): IDialogConfig {
    return { ...this.defaultConfig }
  }
}
