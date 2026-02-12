import { IContextMenu, IContextMenuContext } from '../../../domain/contextmenu/entities/ContextMenu'
import { ContextMenuType, ContextMenuStatus } from '../../../domain/contextmenu/ContextMenuType'
import { IMenuFactory } from '../../../domain/contextmenu/services/IContextMenuService'
import { DeleteAction } from '../../../domain/contextmenu/actions/DeleteAction'
import { logger } from '@/utils/logger'
import type { JsonObject } from '@/types/json-types'
import { generateMenuId } from '@/utils/id-utils'

/**
 * Фабрика контекстных меню для задач.
 * Упрощённая версия: "Информация" и "Удалить".
 */
export class TaskContextMenuFactory implements IMenuFactory {
  canHandle(context: IContextMenuContext): boolean {
    if (!context.target) return false
    const t = context.target as Record<string, JsonObject>
    const id = t.id
    return (
      t.type === 'task' ||
      t.taskId !== undefined ||
      (typeof id === 'string' && id.startsWith('TASK-'))
    )
  }

  async createMenu(context: IContextMenuContext): Promise<IContextMenu> {
    logger.info('[TaskContextMenuFactory] Creating menu for:', context.target?.id)

    const menuId = generateMenuId()
    const { target } = context

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
              logger.info('[TaskContextMenuFactory] Properties action for:', target?.id)
              if (target && typeof target === 'object' && 'onShowProperties' in target && typeof target.onShowProperties === 'function') {
                await target.onShowProperties(target)
              } else {
                logger.warning('[TaskContextMenuFactory] No onShowProperties handler')
              }
            },
            canExecute: () => true,
            getLabel: () => 'Информация о задаче',
            getIcon: () => 'ℹ️',
            getShortcut: () => '',
          },
        },
        {
          id: 'separator1',
          label: '',
          separator: true,
        },
        {
          id: 'delete',
          label: 'Удалить задачу',
          icon: '🗑️',
          action: new DeleteAction(target, async (t) => {
            const taskId = typeof t === 'object' && t !== null && 'id' in t ? (t as { id: string }).id : undefined
            logger.info('[TaskContextMenuFactory] Delete action triggered for:', taskId)
            if (target && typeof target === 'object' && 'onDelete' in target && typeof target.onDelete === 'function') {
              await target.onDelete(t)
              logger.info('[TaskContextMenuFactory] Task deleted successfully')
            } else {
              logger.warning('[TaskContextMenuFactory] No onDelete handler provided')
            }
          }),
        },
      ],
    }
  }
}
