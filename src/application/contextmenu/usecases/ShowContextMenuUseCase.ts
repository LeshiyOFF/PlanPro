import { IContextMenu } from '../../domain/contextmenu/entities/ContextMenu';
import { IContextMenuContext } from '../../domain/contextmenu/entities/ContextMenu';
import { ContextMenuType, ContextMenuStatus } from '../../domain/contextmenu/ContextMenuType';
import { IMenuFactory } from '../../domain/contextmenu/services/IContextMenuService';

/**
 * Use Case для отображения контекстного меню
 */
export class ShowContextMenuUseCase {
  constructor(
    private readonly factories: Map<ContextMenuType, IMenuFactory>
  ) {}

  /**
   * Выполнить use case
   */
  async execute(type: ContextMenuType, context: IContextMenuContext): Promise<IContextMenu> {
    const factory = this.factories.get(type);
    if (!factory) {
      throw new Error(`No factory registered for menu type: ${type}`);
    }

    if (!factory.canHandle(context)) {
      throw new Error(`Factory cannot handle the provided context for type: ${type}`);
    }

    const menu = await factory.createMenu(context);
    
    // Валидация созданного меню
    this.validateMenu(menu);

    return menu;
  }

  /**
   * Валидация меню
   */
  private validateMenu(menu: IContextMenu): void {
    if (!menu.id || menu.id.trim() === '') {
      throw new Error('Menu ID cannot be empty');
    }

    if (!menu.items || menu.items.length === 0) {
      throw new Error('Menu must have at least one item');
    }

    // Валидация пунктов меню
    menu.items.forEach((item, index) => {
      if (!item.id || item.id.trim() === '') {
        throw new Error(`Menu item at index ${index} cannot have empty ID`);
      }

      if (!item.label || item.label.trim() === '') {
        throw new Error(`Menu item '${item.id}' cannot have empty label`);
      }
    });
  }
}

