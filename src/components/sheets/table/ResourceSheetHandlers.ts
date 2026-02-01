import React from 'react'
import { Resource } from '@/types/resource-types'
import { CellValue } from '@/types/sheet/CellValueTypes'
import { ContextMenuType } from '@/domain/contextmenu/ContextMenuType'
import { IContextMenuContext } from '@/domain/contextmenu/entities/ContextMenu'

/**
 * Обработка изменения данных ресурса с конвертацией значений
 */
export function createDataChangeHandler(
  resources: Resource[],
  onResourceUpdate: (resourceId: string, updates: Partial<Resource>) => void,
): (rowId: string, field: string, value: CellValue) => void {
  return (rowId: string, field: string, value: CellValue) => {
    let finalValue: number | string | undefined = value as number | string | undefined
    const row = resources.find((r) => r.id === rowId)

    if (field === 'maxUnits' && row) {
      if (row.type === 'Work') {
        const numeric = parseFloat(String(value).replace('%', ''))
        finalValue = numeric / 100
      } else {
        finalValue = parseFloat(String(value))
      }
      if (isNaN(finalValue)) return
    } else if (field === 'standardRate') {
      finalValue = parseFloat(String(value))
      if (isNaN(finalValue)) return
    }

    onResourceUpdate(rowId, { [field]: finalValue })
  }
}

/**
 * Создание обработчика контекстного меню для таблицы ресурсов.
 * Вызывает showMenu с IContextMenuContext.
 */
export function createContextMenuHandler(
  showMenu: (type: ContextMenuType, context: IContextMenuContext) => void | Promise<void>,
  contextMenuType: ContextMenuType,
  onDeleteResources?: (resourceIds: string[]) => void,
): (event: React.MouseEvent, row: Resource) => void {
  return (event: React.MouseEvent, row: Resource) => {
    event.preventDefault()
    const context: IContextMenuContext = {
      target: {
        ...row,
        onDelete: async (r: Resource) => {
          if (onDeleteResources) {
            onDeleteResources([r.id])
          }
        },
      },
      position: {
        x: event.clientX,
        y: event.clientY,
      },
    }
    void showMenu(contextMenuType, context)
  }
}
