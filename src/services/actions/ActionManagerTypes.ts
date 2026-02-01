import type { IAction } from './BaseAction';

/**
 * Категории действий
 */
export enum ActionCategory {
  FILE = 'file',
  EDIT = 'edit',
  VIEW = 'view',
  INSERT = 'insert',
  FORMAT = 'format',
  TOOLS = 'tools',
  HELP = 'help'
}

/**
 * Интерфейс для Action Manager
 */
export interface IActionManager {
  registerAction(action: IAction, category?: string): void;
  unregisterAction(actionId: string): void;
  getAction(actionId: string): IAction | undefined;
  executeAction(actionId: string): Promise<void>;
  getAllActions(): IAction[];
  getActionsByCategory(category: string): IAction[];
  getCategories(): string[];
  hasAction(actionId: string): boolean;
  getActionsByShortcut(shortcut: string): IAction[];
  updateActionStates(): void;
  clear(): void;
  getStats(): {
    totalActions: number;
    totalCategories: number;
    enabledActions: number;
    disabledActions: number;
  };
}

