import { logger } from '@/utils/logger'
import type {
  Hotkey,
  HotkeyAction,
  HotkeyBinding,
  HotkeyProfile,
  HotkeyState,
} from '@/types/HotkeyTypes'
import { DEFAULT_HOTKEYS, hotkeyToString, hotkeyEquals, HotkeyCategory } from '@/types/HotkeyTypes'

/**
 * Сервис для управления горячими клавишами
 * Следует принципам SOLID и Clean Architecture
 */
class HotkeyService {
  private static instance: HotkeyService
  private eventListeners: Map<string, Set<(action: string, event: KeyboardEvent) => void>> = new Map()
  private actions: Map<string, HotkeyAction> = new Map()
  private bindings: Map<string, HotkeyBinding> = new Map()
  private state: HotkeyState
  private isEnabled: boolean = true

  private constructor() {
    this.state = {
      profiles: [this.createDefaultProfile()],
      activeProfile: 'default',
      conflicts: [],
      isEnabled: true,
    }
    this.initializeDefaultActions()
  }

  private static readonly STORAGE_KEY = 'projectlibre-hotkey-bindings'

  static getInstance(): HotkeyService {
    if (!HotkeyService.instance) {
      HotkeyService.instance = new HotkeyService()
    }
    return HotkeyService.instance
  }

  /**
   * Инициализация действий по умолчанию
   */
  private initializeDefaultActions(): void {
    const defaultActions: HotkeyAction[] = [
      {
        id: 'NEW_PROJECT',
        name: 'Создать проект',
        description: 'Создание нового проекта',
        category: HotkeyCategory.FILE,
        execute: () => this.emitAction('NEW_PROJECT'),
      },
      {
        id: 'OPEN_PROJECT',
        name: 'Открыть проект',
        description: 'Открытие существующего проекта',
        category: HotkeyCategory.FILE,
        execute: () => this.emitAction('OPEN_PROJECT'),
      },
      {
        id: 'SAVE_PROJECT',
        name: 'Сохранить проект',
        description: 'Сохранение текущего проекта',
        category: HotkeyCategory.FILE,
        execute: () => this.emitAction('SAVE_PROJECT'),
      },
      {
        id: 'INSERT_TASK',
        name: 'Вставить задачу',
        description: 'Вставление новой задачи',
        category: HotkeyCategory.TASK,
        execute: () => this.emitAction('INSERT_TASK'),
      },
      {
        id: 'DELETE_TASK',
        name: 'Удалить задачу',
        description: 'Удаление выбранной задачи',
        category: HotkeyCategory.TASK,
        execute: () => this.emitAction('DELETE_TASK'),
      },
      {
        id: 'FIND_TASK',
        name: 'Найти задачу',
        description: 'Поиск задачи',
        category: HotkeyCategory.TASK,
        execute: () => this.emitAction('FIND_TASK'),
      },
      {
        id: 'UNDO',
        name: 'Отменить',
        description: 'Отмена последнего действия',
        category: HotkeyCategory.EDIT,
        execute: () => this.emitAction('UNDO'),
      },
      {
        id: 'REDO',
        name: 'Повторить',
        description: 'Повтор последней отмененной операции',
        category: HotkeyCategory.EDIT,
        execute: () => this.emitAction('REDO'),
      },
      {
        id: 'COPY',
        name: 'Копировать',
        description: 'Копирование выбранного элемента',
        category: HotkeyCategory.EDIT,
        execute: () => this.emitAction('COPY'),
      },
      {
        id: 'PASTE',
        name: 'Вставить',
        description: 'Вставка из буфера обмена',
        category: HotkeyCategory.EDIT,
        execute: () => this.emitAction('PASTE'),
      },
      {
        id: 'ZOOM_IN',
        name: 'Увеличить',
        description: 'Увеличение масштаба',
        category: HotkeyCategory.VIEW,
        execute: () => this.emitAction('ZOOM_IN'),
      },
      {
        id: 'ZOOM_OUT',
        name: 'Уменьшить',
        description: 'Уменьшение масштаба',
        category: HotkeyCategory.VIEW,
        execute: () => this.emitAction('ZOOM_OUT'),
      },
    ]

    defaultActions.forEach(action => {
      this.actions.set(action.id, action)
      const defaultHotkey = DEFAULT_HOTKEYS[action.id]
      if (defaultHotkey) {
        this.bindings.set(action.id, {
          actionId: action.id,
          keys: defaultHotkey,
          enabled: true,
        })
      }
    })
  }

  /**
   * Создание профиля по умолчанию
   */
  private createDefaultProfile(): HotkeyProfile {
    return {
      id: 'default',
      name: 'По умолчанию',
      description: 'Стандартные горячие клавиши ПланПро',
      bindings: Array.from(this.bindings.values()),
      isActive: true,
    }
  }

  /**
   * Регистрация нового действия
   */
  registerAction(action: HotkeyAction): void {
    this.actions.set(action.id, action)
    // logger.dialog('Action registered', { actionId: action.id, name: action.name }, 'Hotkey');
  }

  /**
   * Регистрация привязки клавиш
   */
  registerBinding(actionId: string, keys: Hotkey): boolean {
    if (this.hasConflict(actionId, keys)) {
      logger.dialogError('Hotkey conflict detected', { actionId, keysLabel: hotkeyToString(keys) }, 'Hotkey')
      return false
    }

    this.bindings.set(actionId, {
      actionId,
      keys,
      enabled: true,
    })

    // logger.dialog('Binding registered', { actionId, keys: hotkeyToString(keys) }, 'Hotkey');
    return true
  }

  /**
   * Удаление привязки
   */
  unregisterBinding(actionId: string): void {
    this.bindings.delete(actionId)
    logger.dialog('Binding unregistered', { actionId }, 'Hotkey')
  }

  /**
   * Проверка конфликтов
   */
  private hasConflict(actionId: string, keys: Hotkey): boolean {
    for (const [existingActionId, binding] of this.bindings.entries()) {
      if (existingActionId !== actionId &&
          binding.enabled &&
          hotkeyEquals(binding.keys, keys)) {
        return true
      }
    }
    return false
  }

  /**
   * Обработка события нажатия клавиши
   */
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.isEnabled || !event.target) {
      return
    }

    const target = event.target as HTMLElement

    // Игнорируем ввод в текстовых полях
    if (this.isInputElement(target)) {
      const binding = this.findBindingForEvent(event)
      if (binding && this.shouldAllowInInput(binding.actionId)) {
        this.executeAction(binding.actionId, event)
      }
      return
    }

    const binding = this.findBindingForEvent(event)

    if (binding && binding.enabled) {
      this.executeAction(binding.actionId, event)
    }
  }

  /**
   * Поиск привязки для события
   */
  private findBindingForEvent(event: KeyboardEvent): HotkeyBinding | null {
    if (!this.bindings || this.bindings.size === 0) {
      return null
    }

    const eventHotkey: Hotkey = {
      key: event.key,
      ctrl: event.ctrlKey || event.metaKey,
      alt: event.altKey,
      shift: event.shiftKey,
      meta: event.metaKey,
    }

    for (const binding of this.bindings.values()) {
      try {
        if (binding.enabled && hotkeyEquals(binding.keys, eventHotkey)) {
          return binding
        }
      } catch (error) {
        logger.dialogError('hotkeyEquals error', { actionId: binding.actionId, error: String(error) }, 'Hotkey')
      }
    }

    return null
  }

  /**
   * Выполнение действия
   */
  private executeAction(actionId: string, event: KeyboardEvent): void {
    const action = this.actions.get(actionId)
    if (!action) {
      logger.dialogError('Action not found', { actionId }, 'Hotkey')
      return
    }

    // Проверка возможности выполнения
    if (action.canExecute && !action.canExecute()) {
      logger.dialog('Action cannot execute', { actionId }, 'Hotkey')
      return
    }

    try {
      const result = action.execute()

      // Поддержка асинхронных действий
      if (result instanceof Promise) {
        void (async () => {
          try {
            await result
          } catch (error) {
            logger.dialogError('Action execution failed', { actionId, error }, 'Hotkey')
          }
        })()
      }

      // Предотвращение стандартного поведения
      event.preventDefault()
      event.stopPropagation()

      logger.dialog('Action executed', { actionId }, 'Hotkey')
    } catch (error) {
      logger.dialogError('Action execution error', { actionId, error: String(error) }, 'Hotkey')
    }
  }

  /**
   * Проверка является ли элемент input
   */
  private isInputElement(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase()
    const inputTypes = ['input', 'textarea', 'select']

    return inputTypes.includes(tagName) ||
           element.contentEditable === 'true' ||
           element.getAttribute('contenteditable') === 'true'
  }

  /**
   * Разрешены ли горячие клавиши в input
   */
  private shouldAllowInInput(actionId: string): boolean {
    const allowedInInput = [
      'SAVE_PROJECT',
      'OPEN_PROJECT',
      'FIND_TASK',
      'COPY',
      'PASTE',
      'CUT',
      'REDO',
      'UNDO',
    ]

    return allowedInInput.includes(actionId)
  }

  /**
   * Добавление обработчика событий
   */
  addEventListener(actionId: string, handler: (action: string, event: KeyboardEvent) => void): void {
    if (!this.eventListeners.has(actionId)) {
      this.eventListeners.set(actionId, new Set())
    }

    this.eventListeners.get(actionId)!.add(handler)
    // logger.dialog('Event listener added', { actionId }, 'Hotkey');
  }

  /**
   * Удаление обработчика событий
   */
  removeEventListener(actionId: string, handler: (action: string, event: KeyboardEvent) => void): void {
    const listeners = this.eventListeners.get(actionId)
    if (listeners) {
      listeners.delete(handler)
      if (listeners.size === 0) {
        this.eventListeners.delete(actionId)
      }
    }
  }

  /**
   * Эмитирование события действия
   */
  private emitAction(actionId: string, event?: KeyboardEvent): void {
    const listeners = this.eventListeners.get(actionId)
    if (listeners) {
      listeners.forEach(handler => {
        try {
          handler(actionId, event || new KeyboardEvent('keydown'))
        } catch (error) {
          logger.dialogError('Event handler error', { actionId, error: String(error) }, 'Hotkey')
        }
      })
    }


  }

  /**
   * Включение/выключение системы
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    this.state.isEnabled = enabled
    // logger.dialog('Hotkey system', enabled ? 'enabled' : 'disabled', 'Hotkey');
  }

  /**
   * Получение текущего состояния
   */
  getState(): HotkeyState {
    return {
      ...this.state,
      actionsCount: this.actions.size,
    }
  }

  /**
   * Обновление привязки
   */
  updateBinding(actionId: string, keys: Hotkey): boolean {
    if (this.hasConflict(actionId, keys)) {
      return false
    }

    const existing = this.bindings.get(actionId)
    if (existing) {
      existing.keys = keys
    } else {
      this.bindings.set(actionId, {
        actionId,
        keys,
        enabled: true,
      })
    }

    logger.dialog('Binding updated', { actionId, keys: hotkeyToString(keys) }, 'Hotkey')
    return true
  }

  /**
   * Получение всех привязок
   */
  getAllBindings(): HotkeyBinding[] {
    return Array.from(this.bindings.values())
  }

  /**
   * Получение всех действий
   */
  getAllActions(): HotkeyAction[] {
    return Array.from(this.actions.values())
  }

  /**
   * Получение действий по категории
   */
  getActionsByCategory(category: HotkeyCategory): HotkeyAction[] {
    return Array.from(this.actions.values()).filter(action => action.category === category)
  }

  /**
   * Возвращает привязку по умолчанию для действия (из DEFAULT_HOTKEYS).
   */
  getDefaultBinding(actionId: string): HotkeyBinding | null {
    const defaultKeys = DEFAULT_HOTKEYS[actionId]
    if (!defaultKeys) return null
    return {
      actionId,
      keys: defaultKeys,
      enabled: true,
    }
  }

  /**
   * Сохраняет текущие привязки в localStorage.
   */
  saveToStorage(): void {
    try {
      const payload: Record<string, { keys: Hotkey; enabled: boolean }> = {}
      this.bindings.forEach((binding, actionId) => {
        payload[actionId] = { keys: binding.keys, enabled: binding.enabled }
      })
      localStorage.setItem(HotkeyService.STORAGE_KEY, JSON.stringify(payload))
    } catch (e) {
      logger.dialogError('Failed to save hotkeys to storage', { error: e instanceof Error ? e.message : String(e) }, 'Hotkey')
    }
  }

  /**
   * Загружает привязки из localStorage (вызывать при старте приложения при необходимости).
   */
  loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(HotkeyService.STORAGE_KEY)
      if (!raw) return
      const payload = JSON.parse(raw) as Record<string, { keys: Hotkey; enabled: boolean }>
      Object.entries(payload).forEach(([actionId, { keys, enabled }]) => {
        this.bindings.set(actionId, { actionId, keys, enabled })
      })
    } catch (e) {
      logger.dialogError('Failed to load hotkeys from storage', { error: e instanceof Error ? e.message : String(e) }, 'Hotkey')
    }
  }
}

export const hotkeyService = HotkeyService.getInstance()

