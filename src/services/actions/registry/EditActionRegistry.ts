import { BaseActionRegistry } from './BaseActionRegistry';
import { ActionCategory } from '../ActionManager';
import {
  UndoAction,
  RedoAction,
  CutAction,
  CopyAction,
  PasteAction
} from '../EditActions';
import { logger } from '@/utils/logger';

/**
 * Реестр действий редактирования
 */
export class EditActionRegistry extends BaseActionRegistry {
  /**
   * Регистрация действий редактирования
   */
  public registerAllActions(): void {
    const editActions = [
      new UndoAction(this.dependencies.appStore),
      new RedoAction(this.dependencies.appStore),
      new CutAction(this.dependencies.appStore),
      new CopyAction(this.dependencies.appStore),
      new PasteAction(this.dependencies.appStore)
    ];

    editActions.forEach(action => {
      this.actionManager.registerAction(action, ActionCategory.EDIT);
    });

    logger.info(`Registered ${editActions.length} edit actions`);
  }
}

