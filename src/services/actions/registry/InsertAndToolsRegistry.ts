import { BaseActionRegistry } from './BaseActionRegistry';
import { ActionCategory } from '../ActionManager';
import {
  NewTaskAction,
  NewResourceAction
} from '../InsertActions';
import { SearchAction } from '../ToolsActions';
import { logger } from '@/utils/logger';

/**
 * Реестр действий вставки
 */
export class InsertActionRegistry extends BaseActionRegistry {
  /**
   * Регистрация действий вставки
   */
  public registerAllActions(): void {
    const insertActions = [
      new NewTaskAction(this.dependencies.projectProvider),
      new NewResourceAction(this.dependencies.projectProvider)
    ];

    insertActions.forEach(action => {
      this.actionManager.registerAction(action, ActionCategory.INSERT);
    });

    logger.info(`Registered ${insertActions.length} insert actions`);
  }
}

/**
 * Реестр действий инструментов
 */
export class ToolsActionRegistry extends BaseActionRegistry {
  /**
   * Регистрация действий инструментов
   */
  public registerAllActions(): void {
    const toolsActions = [
      new SearchAction()
    ];

    toolsActions.forEach(action => {
      this.actionManager.registerAction(action, ActionCategory.TOOLS);
    });

    logger.info(`Registered ${toolsActions.length} tools actions`);
  }
}

