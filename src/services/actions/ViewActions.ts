import { BaseAction } from './BaseAction';
import type { UIEvent } from '@/types/Master_Functionality_Catalog';
import { EventType } from '@/types/Master_Functionality_Catalog';
import { logger } from '@/utils/logger';
import type { ViewType } from '@/types/ViewTypes';

/**
 * Action для переключения представления
 */
export class SwitchViewAction extends BaseAction {
  public readonly name: string;
  public readonly description: string;

  constructor(
    public viewType: string,
    private navigationProvider: any,
    viewName: string,
    shortcut?: string
  ) {
    super({ shortcut, icon: 'view' });
    this.name = viewName;
    this.description = `Переключиться на ${viewName}`;
  }

  public get id(): string {
    return `switch-view-${this.viewType}`;
  }

  public canExecute(): boolean {
    return this.navigationProvider.availableViews.some((v: any) => v.type === this.viewType);
  }

  public async execute(): Promise<void> {
    if (!this.canExecute()) {
      throw new Error(`Представление ${this.viewType} недоступно`);
    }

    this.logAction(EventType.VIEW_CHANGED, { viewType: this.viewType });
    this.navigationProvider.navigateToView(this.viewType);
  }
}
