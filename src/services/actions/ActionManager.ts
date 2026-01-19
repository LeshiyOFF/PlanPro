import { ActionManagerFactory } from './ActionManagerFactory';
import { ActionCategory, IActionManager } from './ActionManagerTypes';

/**
 * Singleton экземпляр Action Manager
 */
let actionManagerInstance: IActionManager | null = null;

export const getActionManager = (): IActionManager => {
  if (!actionManagerInstance) {
    actionManagerInstance = ActionManagerFactory.create();
  }
  return actionManagerInstance;
};

/**
 * Сброс singleton экземпляра (для тестов)
 */
export const resetActionManager = (): void => {
  actionManagerInstance = null;
};

export { ActionCategory, type IActionManager };

