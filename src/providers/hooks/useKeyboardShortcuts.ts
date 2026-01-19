import { useEffect, useCallback } from 'react';
import { ActionManager } from '@/services/actions/ActionManager';
import { logger } from '@/utils/logger';

/**
 * Хук для обработки горячих клавиш
 */
export const useKeyboardShortcuts = (
  actionManager: ActionManager,
  executeAction: (actionId: string) => Promise<void>
) => {
  const handleKeyDown = useCallback(async (event: KeyboardEvent): Promise<void> => {
    // Обработка Ctrl+короткие клавиши
    if (event.ctrlKey || event.metaKey) {
      let shortcut = '';
      
      if (event.key === 'Control' || event.key === 'Meta') {
        return; // Игнорируем отдельное нажатие Ctrl/Meta
      }

      // Формирование строки горячей клавиши
      shortcut = 'Ctrl+';
      
      switch (event.key) {
        case '+':
        case '=':
          shortcut += '+';
          break;
        case '-':
          shortcut += '-';
          break;
        default:
          shortcut += event.key.toUpperCase();
          break;
      }

      const actions = actionManager.getActionsByShortcut(shortcut);
      
      if (actions.length > 0) {
        event.preventDefault();
        
        for (const action of actions) {
          if (action.canExecute()) {
            try {
              await executeAction(action.id);
              break; // Выполняем только первое доступное действие
            } catch (error) {
              logger.error(`Failed to execute shortcut action ${action.id}:`, error);
            }
          }
        }
      }
    }

    // Обработка Ins для новой задачи
    if (event.key === 'Insert') {
      const insertActions = actionManager.getActionsByShortcut('Ins');
      
      if (insertActions.length > 0) {
        event.preventDefault();
        
        for (const action of insertActions) {
          if (action.canExecute()) {
            try {
              await executeAction(action.id);
              break;
            } catch (error) {
              logger.error(`Failed to execute Insert action ${action.id}:`, error);
            }
          }
        }
      }
    }
  }, [actionManager, executeAction]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

