import { IActionManager } from './ActionManager'
import { IAction } from './BaseAction'
import type { StrictData } from '@/types/Master_Functionality_Catalog'
import { logger } from '@/utils/logger'
import { ActionCategory } from './ActionManagerTypes'

/**
 * Выполнение действия с полной обработкой ошибок
 */
export class ActionManagerWithExecution implements IActionManager {
  private actions: Map<string, IAction> = new Map()
  private categories: Map<string, ActionCategory> = new Map()

  /**
   * Выполнение действия по ID
   */
  public async executeAction(actionId: string): Promise<void> {
    const action = this.getAction(actionId)

    if (!action) {
      throw new Error(`Action with id ${actionId} not found`)
    }

    if (!action.canExecute()) {
      throw new Error(`Action ${action.name} cannot be executed`)
    }

    try {
      await action.execute()
      logger.info(`Action executed successfully: ${action.name}`)
    } catch (error) {
      const logData: StrictData = {
        actionId,
        actionName: action.name,
        error: error instanceof Error ? error.message : String(error),
      }
      logger.error(`Action execution failed: ${action.name}`, logData)
      throw error
    }
  }

  /**
   * Регистрация действия
   */
  public registerAction(action: IAction, category?: string): void {
    this.actions.set(action.id, action)
    if (category) {
      this.categories.set(action.id, ActionCategory[category as keyof typeof ActionCategory] || ActionCategory.HELP)
    }
  }

  /**
   * Удаление действия
   */
  public unregisterAction(actionId: string): void {
    this.actions.delete(actionId)
    this.categories.delete(actionId)
  }

  /**
   * Получение действия по ID
   */
  public getAction(actionId: string): IAction | undefined {
    return this.actions.get(actionId)
  }

  /**
   * Получение всех действий
   */
  public getAllActions(): IAction[] {
    return Array.from(this.actions.values())
  }

  /**
   * Получение действий по категории
   */
  public getActionsByCategory(category: string): IAction[] {
    return this.getAllActions().filter(action =>
      this.categories.get(action.id) === ActionCategory[category as keyof typeof ActionCategory],
    )
  }

  /**
   * Получение всех категорий
   */
  public getCategories(): string[] {
    return Array.from(new Set(this.categories.values()))
  }

  /**
   * Обновление состояний действий (резерв для расширения IAction)
   */
  public updateActionStates(): void {
    // Состояния обновляются при необходимости; IAction не определяет getState/updateState
  }

  /**
   * Проверка наличия действия
   */
  public hasAction(actionId: string): boolean {
    return this.actions.has(actionId)
  }

  /**
   * Получение действий по горячей клавише
   */
  public getActionsByShortcut(shortcut: string): IAction[] {
    return this.getAllActions().filter(action => action.shortcut === shortcut)
  }

  /**
   * Обновление состояний всех действий (переименовано для избежания дублирования)
   */
  public updateAllActionStates(): void {
    this.actions.forEach(action => {
      try {
        if ('updateState' in action && typeof (action as { updateState?: () => void }).updateState === 'function') {
          (action as { updateState: () => void }).updateState()
        }
      } catch (error) {
        console.warn(`Failed to update state for action ${action.id}:`, error)
      }
    })
  }

  /**
   * Очистка всех действий
   */
  public clear(): void {
    this.actions.clear()
    this.categories.clear()
  }

  /**
   * Получение статистики
   */
  public getStats(): {
    totalActions: number;
    totalCategories: number;
    enabledActions: number;
    disabledActions: number;
    } {
    const actions = this.getAllActions()
    const enabled = actions.filter(action => action.canExecute()).length
    const disabled = actions.filter(action => !action.canExecute()).length

    return {
      totalActions: actions.length,
      totalCategories: this.getCategories().length,
      enabledActions: enabled,
      disabledActions: disabled,
    }
  }

}

