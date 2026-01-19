import { IAction } from './BaseAction';
import { logger } from '@/utils/logger';
import type { UIEvent } from '@/types/Master_Functionality_Catalog';
import { EventType } from '@/types/Master_Functionality_Catalog';

/**
 * Ядро Action Manager - основная логика управления действиями
 */
export class ActionManagerCore {
  protected actions: Map<string, IAction> = new Map();
  protected categoryMap: Map<string, Set<string>> = new Map();

  /**
   * Регистрация действия
   */
  public registerAction(action: IAction, category?: string): void {
    const actionId = action.id;
    
    if (this.actions.has(actionId)) {
      // logger.warning(`Action with id ${actionId} already exists, overwriting`);
    }

    this.actions.set(actionId, action);

    if (category) {
      if (!this.categoryMap.has(category)) {
        this.categoryMap.set(category, new Set());
      }
      this.categoryMap.get(category)!.add(actionId);
    }

    // logger.info(`Action registered: ${action.name} (${actionId})`);
  }

  /**
   * Удаление действия
   */
  public unregisterAction(actionId: string): void {
    const action = this.actions.get(actionId);
    if (!action) {
      logger.warn(`Action with id ${actionId} not found`);
      return;
    }

    this.actions.delete(actionId);

    for (const [category, actionIds] of this.categoryMap.entries()) {
      actionIds.delete(actionId);
      if (actionIds.size === 0) {
        this.categoryMap.delete(category);
      }
    }

    logger.info(`Action unregistered: ${action.name} (${actionId})`);
  }

  /**
   * Получение действия
   */
  public getAction(actionId: string): IAction | undefined {
    return this.actions.get(actionId);
  }

  /**
   * Получение всех действий
   */
  public getAllActions(): IAction[] {
    return Array.from(this.actions.values());
  }

  /**
   * Получение действий по категории
   */
  public getActionsByCategory(category: string): IAction[] {
    const actionIds = this.categoryMap.get(category);
    if (!actionIds) {
      return [];
    }

    return Array.from(actionIds)
      .map(id => this.actions.get(id))
      .filter((action): action is IAction => action !== undefined);
  }

  /**
   * Получение действий по горячей клавише
   */
  public getActionsByShortcut(shortcut: string): IAction[] {
    return this.getAllActions().filter(action => action.shortcut === shortcut);
  }

  /**
   * Проверка существования действия
   */
  public hasAction(actionId: string): boolean {
    return this.actions.has(actionId);
  }

  /**
   * Очистка всех действий
   */
  public clear(): void {
    this.actions.clear();
    this.categoryMap.clear();
    logger.info('All actions cleared');
  }
}
