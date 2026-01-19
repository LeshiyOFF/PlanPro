import { IContextMenu, IContextMenuContext } from '../../../domain/contextmenu/entities/ContextMenu';
import { ContextMenuType, ContextMenuStatus } from '../../../domain/contextmenu/ContextMenuType';
import { IMenuFactory } from '../../../domain/contextmenu/services/IContextMenuService';
import { CopyAction } from '../../../domain/contextmenu/actions/CopyAction';
import { DeleteAction } from '../../../domain/contextmenu/actions/DeleteAction';
import { PropertiesAction } from '../../../domain/contextmenu/actions/PropertiesAction';
import { logger } from '@/utils/logger';

/**
 * Фабрика контекстных меню для ресурсов
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
    logger.info('Creating resource context menu for:', context.target);

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
          id: 'properties',
          label: 'Свойства ресурса',
          icon: 'ℹ️',
          shortcut: 'F9',
          action: new PropertiesAction(target)
        },
        {
          id: 'edit',
          label: 'Редактировать',
          icon: '✏️',
          shortcut: 'Enter',
          action: {
            execute: async () => logger.info('Edit resource:', target),
            canExecute: () => true,
            getLabel: () => 'Редактировать',
            getIcon: () => '✏️',
            getShortcut: () => 'Enter'
          }
        },
        {
          id: 'separator1',
          separator: true
        },
        {
          id: 'availability',
          label: 'Доступность',
          icon: '📅',
          action: {
            execute: async () => logger.info('Edit resource availability'),
            canExecute: () => true,
            getLabel: () => 'Доступность',
            getIcon: () => '📅',
            getShortcut: () => ''
          }
        },
        {
          id: 'working-time',
          label: 'Рабочее время',
          icon: '⏰',
          action: {
            execute: async () => logger.info('Edit resource working time'),
            canExecute: () => true,
            getLabel: () => 'Рабочее время',
            getIcon: () => '⏰',
            getShortcut: () => ''
          }
        },
        {
          id: 'separator2',
          separator: true
        },
        {
          id: 'copy',
          label: 'Копировать',
          icon: '📋',
          shortcut: 'Ctrl+C',
          action: new CopyAction(target)
        },
        {
          id: 'delete',
          label: 'Удалить ресурс',
          icon: '🗑️',
          shortcut: 'Delete',
          action: new DeleteAction(target)
        },
        {
          id: 'separator3',
          separator: true
        },
        {
          id: 'assignments',
          label: 'Назначения',
          icon: '👥',
          submenu: [
            {
              id: 'view-assignments',
              label: 'Показать назначения',
              icon: '👁️',
              action: {
                execute: async () => logger.info('View resource assignments'),
                canExecute: () => true,
                getLabel: () => 'Показать назначения',
                getIcon: () => '👁️',
                getShortcut: () => ''
              }
            },
            {
              id: 'bulk-assign',
              label: 'Массовое назначение',
              icon: '📋',
              action: {
                execute: async () => logger.info('Bulk assign tasks'),
                canExecute: () => true,
                getLabel: () => 'Массовое назначение',
                getIcon: () => '📋',
                getShortcut: () => ''
              }
            }
          ]
        }
      ]
    };
  }
}

