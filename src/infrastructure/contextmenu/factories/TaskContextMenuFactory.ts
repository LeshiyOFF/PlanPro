import { IContextMenu, IContextMenuContext } from '../../../domain/contextmenu/entities/ContextMenu';
import { ContextMenuType, ContextMenuStatus } from '../../../domain/contextmenu/ContextMenuType';
import { IMenuFactory } from '../../../domain/contextmenu/services/IContextMenuService';
import { CopyAction } from '../../../domain/contextmenu/actions/CopyAction';
import { DeleteAction } from '../../../domain/contextmenu/actions/DeleteAction';
import { PropertiesAction } from '../../../domain/contextmenu/actions/PropertiesAction';
import { logger } from '@/utils/logger';

/**
 * Фабрика контекстных меню для задач
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
    logger.info('Creating task context menu for:', context.target);

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
          label: 'Свойства задачи',
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
            execute: async () => logger.info('Edit task:', target),
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
          id: 'copy',
          label: 'Копировать',
          icon: '📋',
          shortcut: 'Ctrl+C',
          action: new CopyAction(target)
        },
        {
          id: 'cut',
          label: 'Вырезать',
          icon: '✂️',
          shortcut: 'Ctrl+X',
          action: {
            execute: async () => logger.info('Cut task:', target),
            canExecute: () => true,
            getLabel: () => 'Вырезать',
            getIcon: () => '✂️',
            getShortcut: () => 'Ctrl+X'
          }
        },
        {
          id: 'paste',
          label: 'Вставить',
          icon: '📋',
          shortcut: 'Ctrl+V',
          action: {
            execute: async () => logger.info('Paste task'),
            canExecute: () => true,
            getLabel: () => 'Вставить',
            getIcon: () => '📋',
            getShortcut: () => 'Ctrl+V'
          }
        },
        {
          id: 'separator2',
          separator: true
        },
        {
          id: 'delete',
          label: 'Удалить задачу',
          icon: '🗑️',
          shortcut: 'Delete',
          action: new DeleteAction(target)
        },
        {
          id: 'separator3',
          separator: true
        },
        {
          id: 'dependencies',
          label: 'Зависимости',
          icon: '🔗',
          submenu: [
            {
              id: 'add-predecessor',
              label: 'Добавить предшественника',
              icon: '⬅️',
              action: {
                execute: async () => logger.info('Add predecessor'),
                canExecute: () => true,
                getLabel: () => 'Добавить предшественника',
                getIcon: () => '⬅️',
                getShortcut: () => ''
              }
            },
            {
              id: 'add-successor',
              label: 'Добавить последователя',
              icon: '➡️',
              action: {
                execute: async () => logger.info('Add successor'),
                canExecute: () => true,
                getLabel: () => 'Добавить последователя',
                getIcon: () => '➡️',
                getShortcut: () => ''
              }
            }
          ]
        }
      ]
    };
  }
}

