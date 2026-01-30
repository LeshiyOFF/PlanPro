import { IContextMenu, IContextMenuContext } from '../../../domain/contextmenu/entities/ContextMenu';
import { ContextMenuType, ContextMenuStatus } from '../../../domain/contextmenu/ContextMenuType';
import { IMenuFactory } from '../../../domain/contextmenu/services/IContextMenuService';
import { DeleteAction } from '../../../domain/contextmenu/actions/DeleteAction';
import { logger } from '@/utils/logger';

/**
 * Фабрика контекстных меню для задач.
 * Упрощённая версия: "Информация" и "Удалить".
 */
export class TaskContextMenuFactory implements IMenuFactory {
  canHandle(context: IContextMenuContext): boolean {
    return context.target && (
      context.target.type === 'task' ||
      context.target.taskId ||
      context.target.id?.startsWith('TASK-')
    );
  }

  async createMenu(context: IContextMenuContext): Promise<IContextMenu> {
    logger.info('[TaskContextMenuFactory] Creating menu for:', context.target?.id);

    const menuId = `task-menu-${Date.now()}`;
    const { target } = context;

    return {
      id: menuId,
      type: ContextMenuType.TASK,
      position: context.position,
      status: ContextMenuStatus.VISIBLE,
      target,
      items: [
        {
          id: 'properties',
          label: 'Информация о задаче',
          icon: 'ℹ️',
          action: {
            execute: async () => {
              logger.info('[TaskContextMenuFactory] Properties action for:', target?.id);
              if (target.onShowProperties) {
                await target.onShowProperties(target);
              } else {
                logger.warning('[TaskContextMenuFactory] No onShowProperties handler');
              }
            },
            canExecute: () => true,
            getLabel: () => 'Информация о задаче',
            getIcon: () => 'ℹ️',
            getShortcut: () => ''
          }
        },
        {
          id: 'separator1',
          separator: true
        },
        {
          id: 'delete',
          label: 'Удалить задачу',
          icon: '🗑️',
          action: new DeleteAction(target, async (t) => {
            logger.info('[TaskContextMenuFactory] Delete action triggered for:', t?.id);
            if (target.onDelete) {
              await target.onDelete(t);
              logger.info('[TaskContextMenuFactory] Task deleted successfully');
            } else {
              logger.warning('[TaskContextMenuFactory] No onDelete handler provided');
            }
          })
        }
      ]
    };
  }
}

