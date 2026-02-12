import { IContextMenu, IContextMenuContext } from '../../../domain/contextmenu/entities/ContextMenu'
import { ContextMenuType, ContextMenuStatus } from '../../../domain/contextmenu/ContextMenuType'
import { IMenuFactory } from '../../../domain/contextmenu/services/IContextMenuService'
import { DeleteAction } from '../../../domain/contextmenu/actions/DeleteAction'
import { logger } from '@/utils/logger'
import type { JsonObject } from '@/types/json-types'
import { generateMenuId } from '@/utils/id-utils'

/**
 * Фабрика контекстных меню для ресурсов.
 * Упрощённая версия: только действие "Удалить".
 */
export class ResourceContextMenuFactory implements IMenuFactory {
  canHandle(context: IContextMenuContext): boolean {
    if (!context.target) return false
    const t = context.target as Record<string, JsonObject>
    const id = t.id
    return (
      t.type === 'resource' ||
      t.resourceId !== undefined ||
      (typeof id === 'string' && id.startsWith('RES-'))
    )
  }

  async createMenu(context: IContextMenuContext): Promise<IContextMenu> {
    logger.info('[ResourceContextMenuFactory] Creating menu for:', context.target?.id)

    const menuId = generateMenuId()
    const { target } = context

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
            const resourceId = typeof r === 'object' && r !== null && 'id' in r ? (r as { id: string }).id : undefined
            logger.info('[ResourceContextMenuFactory] Delete action triggered for:', resourceId)
            if (target && typeof target === 'object' && 'onDelete' in target && typeof target.onDelete === 'function') {
              await target.onDelete(r)
              logger.info('[ResourceContextMenuFactory] Resource deleted successfully')
            } else {
              logger.warning('[ResourceContextMenuFactory] No onDelete handler provided')
            }
          }),
        },
      ],
    }
  }
}
