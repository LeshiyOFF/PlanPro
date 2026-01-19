import { ActionManagerWithExecution } from './ActionManagerExecution';
import { ActionCategory, IActionManager } from './ActionManagerTypes';
import { ActionManagerCore } from './ActionManagerCore';
import { IAction } from './BaseAction';
import { logger } from '@/utils/logger';

/**
 * Фабрика создания Action Manager
 */
export class ActionManagerFactory {
  /**
   * Создание экземпляра Action Manager
   */
  public static create(): IActionManager {
    // Комбинируем базовый ActionManagerCore с выполнением
    const baseManager = new ActionManagerCore();
    const executionManager = new ActionManagerWithExecution();
    
    // Создаем композитный менеджер
    return new ActionManagerComposite(baseManager, executionManager);
  }
}

/**
 * Композитный ActionManager объединяющий функциональность
 */
class ActionManagerComposite implements IActionManager {
  private base: ActionManagerCore;
  private execution: ActionManagerWithExecution;

  constructor(base: ActionManagerCore, execution: ActionManagerWithExecution) {
    this.base = base;
    this.execution = execution;
  }

  registerAction = (action: IAction): void => {
    this.base.registerAction(action);
    this.execution.registerAction(action);
  };

  unregisterAction = (actionId: string): void => {
    this.base.unregisterAction(actionId);
  };

  getAction = (actionId: string): IAction | undefined => {
    return this.base.getAction(actionId);
  };

  getActionsByCategory = (category: string): IAction[] => {
    return this.base.getActionsByCategory(category);
  };

  getAllActions = (): IAction[] => {
    return this.base.getAllActions();
  };

  getCategories = (): string[] => {
    return this.base.getCategories();
  };

  executeAction = async (actionId: string): Promise<void> => {
    return this.execution.executeAction(actionId);
  };

  updateActionStates = (): void => {
    try {
      if (this.base && typeof this.base.updateActionStates === 'function') {
        this.base.updateActionStates();
      }
    } catch (error) {
      logger.error('Error in updateActionStates:', error);
    }
  };

  getActionsByShortcut = (shortcut: string): IAction[] => {
    return this.base.getActionsByShortcut(shortcut);
  };

  // Добавим недостающие методы
  hasAction = (actionId: string): boolean => {
    return this.base.hasAction(actionId);
  };

  clear = (): void => {
    this.base.clear();
  };

  getStats = () => {
    return this.base.getStats();
  };
}

