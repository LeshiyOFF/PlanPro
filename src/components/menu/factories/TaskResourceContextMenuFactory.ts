import { BaseContextMenuFactory } from './BaseContextMenuFactory'
import { ContextMenuItem } from '@/providers/MenuProvider'

/**
 * Фабрика контекстных меню для задач и ресурсов
 */
export class TaskResourceContextMenuFactory extends BaseContextMenuFactory {

  /**
   * Контекстное меню для задачи
   */
  static createTaskContextMenu(onAction: (action: string) => void): ContextMenuItem[] {
    const factory = new TaskResourceContextMenuFactory()

    return [
      {
        id: 'info',
        label: 'Информация о задаче',
        icon: 'ℹ️',
        shortcut: 'F9',
        handler: () => onAction('info'),
      },
      {
        id: 'insert',
        label: 'Вставить задачу',
        icon: '➕',
        shortcut: 'Ctrl+K',
        handler: () => onAction('insert'),
      },
      {
        id: 'delete',
        label: 'Удалить задачу',
        icon: '🗑️',
        shortcut: 'Delete',
        handler: () => onAction('delete'),
      },
      factory.createSeparator(),
      ...factory.createEditItems(onAction),
      factory.createSeparator(),
      ...factory.createInfoItems(onAction),
    ]
  }

  /**
   * Контекстное меню для ресурса
   */
  static createResourceContextMenu(onAction: (action: string) => void): ContextMenuItem[] {
    const factory = new TaskResourceContextMenuFactory()

    return [
      {
        id: 'info',
        label: 'Информация о ресурсе',
        icon: 'ℹ️',
        shortcut: 'F10',
        handler: () => onAction('info'),
      },
      {
        id: 'insert',
        label: 'Вставить ресурс',
        icon: '➕',
        handler: () => onAction('insert'),
      },
      {
        id: 'delete',
        label: 'Удалить ресурс',
        icon: '🗑️',
        handler: () => onAction('delete'),
      },
      factory.createSeparator(),
      ...factory.createEditItems(onAction),
      factory.createSeparator(),
      ...factory.createInfoItems(onAction),
    ]
  }
}

