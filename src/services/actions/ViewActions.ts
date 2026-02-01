import { BaseAction } from './BaseAction'
import { EventType } from '@/types/Master_Functionality_Catalog'
import type { NavigationProviderPort } from './registry/BaseActionRegistry'
import type { ViewType } from '@/types/ViewTypes'

/**
 * Action для переключения представления
 */
export class SwitchViewAction extends BaseAction {
  public readonly name: string
  public readonly description: string

  constructor(
    public viewType: ViewType | string,
    private navigationProvider: NavigationProviderPort,
    viewName: string,
    shortcut?: string,
  ) {
    super({ shortcut, icon: 'view' })
    this.name = viewName
    this.description = `Переключиться на ${viewName}`
  }

  public get id(): string {
    return `switch-view-${this.viewType}`
  }

  public canExecute(): boolean {
    const views = this.navigationProvider.availableViews ?? []
    return views.some((v) => v.type === this.viewType)
  }

  public async execute(): Promise<void> {
    if (!this.canExecute()) {
      throw new Error(`Представление ${this.viewType} недоступно`)
    }

    this.logAction(EventType.VIEW_CHANGED, { viewType: this.viewType })
    this.navigationProvider.navigateToView(this.viewType)
  }
}

