import {
  IStatusBarService,
  IStatusBarMessage,
  IStatusBarSection,
  IStatusBarState,
  StatusBarMessageType,
} from '../interfaces/StatusBarInterfaces'
import { generateUniqueId } from '@/utils/id-utils'

/**
 * Базовый сервис статусбара
 * Реализует паттерн Singleton и следует SOLID принципам
 */
export class StatusBarService implements IStatusBarService {
  private static instance: StatusBarService
  private state: IStatusBarState
  private listeners: Set<(state: IStatusBarState) => void> = new Set()
  private messageTimers: Map<string, NodeJS.Timeout> = new Map()

  private constructor() {
    this.state = {
      sections: new Map(),
      message: null,
      isVisible: true,
      zoom: 100,
      selection: '',
      ready: true,
    }
  }

  /**
   * Получение singleton экземпляра
   */
  public static getInstance(): StatusBarService {
    if (!StatusBarService.instance) {
      StatusBarService.instance = new StatusBarService()
    }
    return StatusBarService.instance
  }

  /**
   * Подписка на изменения состояния
   */
  public subscribe(listener: (state: IStatusBarState) => void): () => void {
    this.listeners.add(listener)
    listener(this.state)

    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Показать сообщение в статусбаре
   */
  public showMessage(
    text: string,
    type: StatusBarMessageType = 'info',
    timeout: number = 3000,
  ): void {
    const messageId = this.generateId()
    const message: IStatusBarMessage = {
      id: messageId,
      type,
      text,
      timestamp: new Date(),
      timeout,
    }

    this.updateState({ message })

    if (timeout && timeout > 0) {
      const timer = setTimeout(() => {
        this.clearMessage()
      }, timeout)

      this.messageTimers.set(messageId, timer)
    }
  }

  /**
   * Показать предупреждение
   */
  public showWarning(text: string): void {
    this.showMessage(text, 'warning', 5000)
  }

  /**
   * Показать ошибку
   */
  public showError(text: string): void {
    this.showMessage(text, 'error', 10000)
  }

  /**
   * Показать успешное сообщение
   */
  public showSuccess(text: string): void {
    this.showMessage(text, 'success', 3000)
  }

  /**
   * Показать сообщение о прогрессе
   */
  public showProgress(text: string): void {
    this.showMessage(text, 'progress', 0)
  }

  /**
   * Очистить сообщение
   */
  public clearMessage(): void {
    if (this.state.message) {
      const messageId = this.state.message.id
      const timer = this.messageTimers.get(messageId)

      if (timer) {
        clearTimeout(timer)
        this.messageTimers.delete(messageId)
      }
    }

    this.updateState({ message: null })
  }

  /**
   * Обновить уровень масштабирования
   */
  public updateZoom(zoom: number): void {
    this.updateState({ zoom: Math.max(10, Math.min(500, zoom)) })
  }

  /**
   * Обновить информацию о выделении
   */
  public updateSelection(selection: string): void {
    this.updateState({ selection })
  }

  /**
   * Установить состояние готовности
   */
  public setReady(ready: boolean): void {
    this.updateState({ ready })
  }

  /**
   * Добавить секцию
   */
  public addSection(section: IStatusBarSection): void {
    const newSections = new Map(this.state.sections)
    newSections.set(section.id, section)
    this.updateState({ sections: newSections })
  }

  /**
   * Удалить секцию
   */
  public removeSection(sectionId: string): void {
    const newSections = new Map(this.state.sections)
    newSections.delete(sectionId)
    this.updateState({ sections: newSections })
  }

  /**
   * Переключить видимость
   */
  public toggleVisibility(): void {
    this.updateState({ isVisible: !this.state.isVisible })
  }

  /**
   * Проверить видимость
   */
  public isVisible(): boolean {
    return this.state.isVisible
  }

  /**
   * Получить текущее состояние
   */
  public getState(): IStatusBarState {
    return { ...this.state }
  }

  /**
   * Обновить состояние и уведомить подписчиков
   */
  private updateState(updates: Partial<IStatusBarState>): void {
    this.state = { ...this.state, ...updates }
    this.notifyListeners()
  }

  /**
   * Уведомить всех подписчиков
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener(this.state)
    })
  }

  /**
   * Сгенерировать уникальный ID
   */
  private generateId(): string {
    return generateUniqueId('status')
  }

  /**
   * Очистить ресурсы
   */
  public dispose(): void {
    this.messageTimers.forEach(timer => clearTimeout(timer))
    this.messageTimers.clear()
    this.listeners.clear()
  }
}

