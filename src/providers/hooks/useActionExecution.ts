import { useCallback, useRef } from 'react';
import { ActionManager } from '@/services/actions/ActionManager';
import type { IAction } from '@/services/actions/BaseAction';
import { logger } from '@/utils/logger';

/**
 * Хук для выполнения действий с защитой от двойных кликов
 */
export const useActionExecution = (actionManager: ActionManager) => {
  // Карта активных действий для предотвращения дублирования
  const busyActionsRef = useRef<Set<string>>(new Set());

  const executeAction = useCallback(async (actionId: string): Promise<void> => {
    // Проверка: если действие уже выполняется, игнорируем
    if (busyActionsRef.current.has(actionId)) {
      logger.warn(`Action ${actionId} is already in progress, ignoring duplicate call`);
      return;
    }

    // Помечаем действие как выполняющееся
    busyActionsRef.current.add(actionId);
    
    try {
      logger.info(`[ActionExecution] Starting action: ${actionId}`);
      await actionManager.executeAction(actionId);
      logger.info(`[ActionExecution] Completed action: ${actionId}`);
    } catch (error) {
      logger.error(`Failed to execute action ${actionId}:`, error);
      throw error;
    } finally {
      // ОБЯЗАТЕЛЬНО снимаем блокировку в finally
      busyActionsRef.current.delete(actionId);
    }
  }, [actionManager]);

  const getAction = useCallback((actionId: string): IAction | undefined => {
    return actionManager.getAction(actionId);
  }, [actionManager]);

  const getActionsByCategory = useCallback((category: string): IAction[] => {
    return actionManager.getActionsByCategory(category);
  }, [actionManager]);

  const getAllActions = useCallback((): IAction[] => {
    return actionManager.getAllActions();
  }, [actionManager]);

  return {
    executeAction,
    getAction,
    getActionsByCategory,
    getAllActions
  };
};
