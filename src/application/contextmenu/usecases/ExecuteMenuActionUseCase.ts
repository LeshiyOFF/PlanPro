import { IContextMenu } from '@/domain/contextmenu/entities/ContextMenu';

/**
 * Use Case для выполнения действия пункта меню
 */
export class ExecuteMenuActionUseCase {
  /**
   * Выполнить действие пункта меню
   */
  async execute(menu: IContextMenu, actionId: string): Promise<void> {
    // Найти пункт меню по actionId
    const menuItem = this.findMenuItem(menu, actionId);
    
    if (!menuItem) {
      throw new Error(`Menu action not found: ${actionId}`);
    }

    if (menuItem.separator) {
      throw new Error(`Cannot execute separator action: ${actionId}`);
    }

    if (menuItem.disabled) {
      throw new Error(`Menu action is disabled: ${actionId}`);
    }

    if (!menuItem.action) {
      throw new Error(`Menu action has no executor: ${actionId}`);
    }

    // Проверить можно ли выполнить действие
    if (!menuItem.action.canExecute()) {
      throw new Error(`Menu action cannot be executed: ${actionId}`);
    }

    // Выполнить действие
    try {
      await menuItem.action.execute();
    } catch (error) {
      throw new Error(`Failed to execute menu action ${actionId}: ${error.message}`);
    }
  }

  /**
   * Найти пункт меню в дереве меню
   */
  private findMenuItem(menu: IContextMenu, actionId: string): any {
    // Поиск в основных пунктах меню
    const item = menu.items.find(item => item.id === actionId);
    if (item) return item;

    // Рекурсивный поиск в подменю
    for (const mainItem of menu.items) {
      if (mainItem.submenu) {
        const subItem = this.searchInSubmenu(mainItem.submenu, actionId);
        if (subItem) return subItem;
      }
    }

    return null;
  }

  /**
   * Рекурсивный поиск в подменю
   */
  private searchInSubmenu(submenu: any[], actionId: string): any {
    for (const item of submenu) {
      if (item.id === actionId) return item;
      
      if (item.submenu) {
        const subItem = this.searchInSubmenu(item.submenu, actionId);
        if (subItem) return subItem;
      }
    }
    return null;
  }
}

