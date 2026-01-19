import { ActionCategory } from '../ActionManager';
import { logger } from '@/utils/logger';

/**
 * Сервис валидации регистрации действий
 */
export class ActionRegistryValidator {
  constructor(private actionManager: any) {}

  /**
   * Валидация регистрации
   */
  public validateRegistration(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Проверка наличия основных действий
    const requiredActions = [
      'new-project',
      'open-project',
      'save-project',
      'undo',
      'redo'
    ];

    requiredActions.forEach(actionId => {
      if (!this.actionManager.hasAction(actionId)) {
        errors.push(`Required action ${actionId} is not registered`);
      }
    });

    // Проверка конфликтов горячих клавиш
    const allActions = this.actionManager.getAllActions();
    const shortcuts = new Map<string, string[]>();
    
    allActions.forEach(action => {
      if (action.shortcut) {
        if (!shortcuts.has(action.shortcut)) {
          shortcuts.set(action.shortcut, []);
        }
        shortcuts.get(action.shortcut)!.push(action.id);
      }
    });

    shortcuts.forEach((actionIds, shortcut) => {
      if (actionIds.length > 1) {
        warnings.push(`Shortcut ${shortcut} is used by multiple actions: ${actionIds.join(', ')}`);
      }
    });

    const isValid = errors.length === 0;
    
    return {
      isValid,
      errors,
      warnings
    };
  }

  /**
   * Получение статистики регистрации
   */
  public getRegistrationStats(): {
    totalActions: number;
    fileActions: number;
    editActions: number;
    viewActions: number;
    insertActions: number;
    toolsActions: number;
  } {
    const stats = this.actionManager.getStats();
    
    return {
      totalActions: stats.totalActions,
      fileActions: this.actionManager.getActionsByCategory(ActionCategory.FILE).length,
      editActions: this.actionManager.getActionsByCategory(ActionCategory.EDIT).length,
      viewActions: this.actionManager.getActionsByCategory(ActionCategory.VIEW).length,
      insertActions: this.actionManager.getActionsByCategory(ActionCategory.INSERT).length,
      toolsActions: this.actionManager.getActionsByCategory(ActionCategory.TOOLS).length
    };
  }
}

