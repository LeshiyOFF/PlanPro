import { BaseActionRegistry } from './BaseActionRegistry';
import { ActionCategory } from '../ActionManager';
import {
  NewProjectAction,
  OpenProjectAction,
  SaveProjectAction,
  SaveProjectAsAction,
  PrintAction
} from '../FileActions';
import { logger } from '@/utils/logger';

/**
 * Реестр файловых действий
 */
export class FileActionRegistry extends BaseActionRegistry {
  /**
   * Регистрация файловых действий
   */
  public registerAllActions(): void {
    const fileActions = [
      new NewProjectAction(this.dependencies),
      new OpenProjectAction(this.dependencies),
      new SaveProjectAction(this.dependencies),
      new SaveProjectAsAction(this.dependencies),
      new PrintAction()
    ];

    fileActions.forEach(action => {
      this.actionManager.registerAction(action, ActionCategory.FILE);
    });

    logger.info(`Registered ${fileActions.length} file actions`);
  }
}

