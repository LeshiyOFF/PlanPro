import { IContextMenu, IContextMenuContext } from '../../../domain/contextmenu/entities/ContextMenu';
import { ContextMenuType, ContextMenuStatus } from '../../../domain/contextmenu/ContextMenuType';
import { IMenuFactory } from '../../../domain/contextmenu/services/IContextMenuService';
import { DeleteAction } from '../../../domain/contextmenu/actions/DeleteAction';
import { logger } from '@/utils/logger';

/**
 * Фабрика контекстных меню для ресурсов.
 * Упрощённая версия: только действие "Удалить".
 */
export class ResourceContextMenuFactory implements IMenuFactory {
  canHandle(context: IContextMenuContext): boolean {
    return context.target && (
      context.target.type === 'resource' ||
      context.target.resourceId ||
      context.target.id?.startsWith('RES-')
    );
  }

  async createMenu(context: IContextMenuContext): Promise<IContextMenu> {
    logger.info('[ResourceContextMenuFactory] Creating menu for:', context.target?.id);

    const menuId = `resource-menu-${Date.now()}`;
    const { target } = context;

    return {
      id: menuId,
      type: ContextMenuType.RESOURCE,
      position: context.position,
      status: ContextMenuStatus.VISIBLE,
      target,
      items: [
        {
          id: 'delete',
          label: 'Удалить ресурс',
          icon: '🗑️',
          action: new DeleteAction(target, async (r) => {
            logger.info('[ResourceContextMenuFactory] Delete action triggered for:', r?.id);
            if (target.onDelete) {
              await target.onDelete(r);
              logger.info('[ResourceContextMenuFactory] Resource deleted successfully');
            } else {
              logger.warning('[ResourceContextMenuFactory] No onDelete handler provided');
            }
          })
        }
      ]
    };
  }
}

