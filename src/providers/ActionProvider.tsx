import React, { useMemo } from 'react';
import { getActionManager, ActionManager, IActionManager } from '@/services/actions/ActionManager';
import { ActionContext, ActionContextType } from './ActionContext';
import { useActionExecution } from './hooks/useActionExecution';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useActionStateUpdater } from './hooks/useActionStateUpdater';

/**
 * Provider для управления действиями приложения
 * Следует SOLID принципам:
 * - Single Responsibility: Предоставляет только Action Manager функциональность
 * - Dependency Inversion: Работает через абстракции
 */
export const ActionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const actionManager = useMemo(() => getActionManager(), []);
  const actionExecution = useActionExecution(actionManager);

  // Хук для обработки горячих клавиш
  useKeyboardShortcuts(actionManager, actionExecution.executeAction);

  // Хук для периодического обновления состояний
  useActionStateUpdater(actionManager.updateActionStates);

  // Контекстное значение
  const contextValue: ActionContextType = useMemo(() => ({
    actionManager,
    ...actionExecution
  }), [
    actionManager,
    actionExecution
  ]);

  return (
    <ActionContext.Provider value={contextValue}>
      {children}
    </ActionContext.Provider>
  );
};

export default ActionProvider;
