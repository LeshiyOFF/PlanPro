import { getActionManager, IActionManager } from '@/services/actions/ActionManager';

/**
 * Хук для доступа к Action Manager
 * Предоставляет singleton экземпляр ActionManager
 */
export const useActionManager = (): IActionManager => {
  return getActionManager();
};

