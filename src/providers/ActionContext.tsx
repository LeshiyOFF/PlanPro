import React, { createContext, useContext } from 'react';
import { ActionManager } from '@/services/actions/ActionManager';
import type { IAction } from '@/services/actions/BaseAction';

/**
 * Контекст для Action Manager
 */
export const ActionContext = createContext<ActionContextType | undefined>(undefined);

/**
 * Интерфейс контекста для Action Manager
 */
export interface ActionContextType {
  actionManager: ActionManager;
  executeAction: (actionId: string) => Promise<void>;
  getAction: (actionId: string) => IAction | undefined;
  getActionsByCategory: (category: string) => IAction[];
  getAllActions: () => IAction[];
  updateActionStates: () => void;
}

/**
 * Hook для использования Action Manager
 */
export const useActionManager = (): ActionContextType => {
  const context = useContext(ActionContext);
  
  if (context === undefined) {
    throw new Error('useActionManager must be used within an ActionProvider');
  }
  
  return context;
};

/**
 * Hook для получения действий по категории
 */
export const useActionsByCategory = (category: string) => {
  const { getActionsByCategory, updateActionStates } = useActionManager();
  
  const actions = React.useMemo(() => {
    return getActionsByCategory(category);
  }, [getActionsByCategory, category]);

  React.useEffect(() => {
    updateActionStates();
  }, [updateActionStates]);

  return actions;
};

/**
 * Hook для получения всех действий
 */
export const useAllActions = () => {
  const { getAllActions, updateActionStates } = useActionManager();
  
  const actions = React.useMemo(() => {
    return getAllActions();
  }, [getAllActions]);

  React.useEffect(() => {
    updateActionStates();
  }, [updateActionStates]);

  return actions;
};

