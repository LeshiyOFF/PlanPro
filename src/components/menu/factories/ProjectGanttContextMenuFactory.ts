import { BaseContextMenuFactory } from './BaseContextMenuFactory'
import { ContextMenuItem } from '@/providers/MenuProvider'

/**
 * Фабрика контекстных меню для проектов и диаграмм
 */
export class ProjectGanttContextMenuFactory extends BaseContextMenuFactory {

  /**
   * Контекстное меню для проекта
   */
  static createProjectContextMenu(onAction: (action: string) => void): ContextMenuItem[] {
    return [
      {
        id: 'close',
        label: 'Закрыть проект',
        icon: '❌',
        handler: () => onAction('close'),
      },
      BaseContextMenuFactory.createSeparator(),
      {
        id: 'save',
        label: 'Сохранить проект',
        icon: '💾',
        shortcut: 'Ctrl+S',
        handler: () => onAction('save'),
      },
      {
        id: 'saveAs',
        label: 'Сохранить как...',
        icon: '💾📝',
        shortcut: 'Ctrl+Shift+S',
        handler: () => onAction('saveAs'),
      },
      BaseContextMenuFactory.createSeparator(),
      {
        id: 'print',
        label: 'Печать',
        icon: '🖨️',
        shortcut: 'Ctrl+P',
        handler: () => onAction('print'),
      },
      {
        id: 'exportPdf',
        label: 'Экспорт в PDF',
        icon: '📄',
        handler: () => onAction('exportPdf'),
      },
    ]
  }

  /**
   * Контекстное меню для диаграммы Ганта
   */
  static createGanttContextMenu(onAction: (action: string) => void): ContextMenuItem[] {
    return [
      {
        id: 'zoomIn',
        label: 'Увеличить масштаб',
        icon: '🔍+',
        shortcut: 'Ctrl++',
        handler: () => onAction('zoomIn'),
      },
      {
        id: 'zoomOut',
        label: 'Уменьшить масштаб',
        icon: '🔍-',
        shortcut: 'Ctrl+-',
        handler: () => onAction('zoomOut'),
      },
      {
        id: 'fitWidth',
        label: 'Масштаб по ширине',
        icon: '↔️',
        shortcut: 'Ctrl+0',
        handler: () => onAction('fitWidth'),
      },
      BaseContextMenuFactory.createSeparator(),
      {
        id: 'filter',
        label: 'Фильтр задач',
        icon: '🔽',
        handler: () => onAction('filter'),
      },
      {
        id: 'find',
        label: 'Найти задачу',
        icon: '🔍',
        shortcut: 'Ctrl+F',
        handler: () => onAction('find'),
      },
    ]
  }
}

