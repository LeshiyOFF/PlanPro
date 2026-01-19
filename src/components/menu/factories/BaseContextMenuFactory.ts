import { ContextMenuItem } from '@/providers/MenuProvider';

/**
 * Фабрика контекстных меню - базовый класс
 */
export abstract class BaseContextMenuFactory {
  
  /**
   * Создать базовые элементы редактирования
   */
  protected createEditItems(onAction: (action: string) => void): ContextMenuItem[] {
    return [
      {
        id: 'cut',
        label: 'Вырезать',
        icon: '✂️',
        shortcut: 'Ctrl+X',
        handler: () => onAction('cut')
      },
      {
        id: 'copy',
        label: 'Копировать',
        icon: '📋',
        shortcut: 'Ctrl+C',
        handler: () => onAction('copy')
      },
      {
        id: 'paste',
        label: 'Вставить',
        icon: '📋',
        shortcut: 'Ctrl+V',
        handler: () => onAction('paste')
      }
    ];
  }

  /**
   * Создать информационные элементы
   */
  protected createInfoItems(onAction: (action: string) => void): ContextMenuItem[] {
    return [
      {
        id: 'info',
        label: 'Информация',
        icon: 'ℹ️',
        handler: () => onAction('info')
      },
      {
        id: 'worktime',
        label: 'Рабочее время',
        icon: '⏰',
        handler: () => onAction('worktime')
      },
      {
        id: 'notes',
        label: 'Заметки',
        icon: '📝',
        handler: () => onAction('notes')
      }
    ];
  }

  /**
   * Создать разделитель
   */
  protected createSeparator(): ContextMenuItem {
    return {
      id: `separator-${Date.now()}`,
      label: '',
      separator: true,
      handler: () => {}
    };
  }
}
