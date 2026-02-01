import { BaseActionRegistry } from './BaseActionRegistry';
import { ActionCategory } from '../ActionManager';
import { SwitchViewAction } from '../ViewActions';
import { logger } from '@/utils/logger';

/**
 * Реестр действий переключения представлений
 */
export class ViewActionRegistry extends BaseActionRegistry {
  /**
   * Регистрация действий переключения представлений
   */
  public registerAllActions(): void {
    const viewActions: SwitchViewAction[] = [];
    const viewConfigs = this.getViewConfigs();

    viewConfigs.forEach(config => {
      const action = new SwitchViewAction(
        config.type,
        this.dependencies.navigationProvider,
        config.name,
        config.shortcut
      );
      
      viewActions.push(action);
      this.actionManager.registerAction(action, ActionCategory.VIEW);
    });

    logger.info(`Registered ${viewActions.length} view actions`);
  }

  /**
   * Получение конфигураций представлений
   */
  private getViewConfigs(): Array<{ type: string; name: string; shortcut?: string }> {
    const availableViews = this.dependencies.navigationProvider.availableViews || [];
    
    return availableViews.map((view, index: number) => ({
      type: view.type,
      name: view.title ?? `View ${index + 1}`,
      shortcut: `Ctrl+${index + 1}`
    }));
  }
}

