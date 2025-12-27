import { MenuItemConstructorOptions } from 'electron'

/**
 * Шаблон меню "Правка"
 */
export class EditMenuTemplate {
  /**
   * Создание меню "Правка"
   */
  public static create(): MenuItemConstructorOptions {
    return {
      label: 'Правка',
      submenu: [
        { role: 'undo', label: 'Отменить' },
        { role: 'redo', label: 'Повторить' },
        { type: 'separator' },
        { role: 'cut', label: 'Вырезать' },
        { role: 'copy', label: 'Копировать' },
        { role: 'paste', label: 'Вставить' },
        { role: 'selectAll', label: 'Выбрать все' }
      ]
    }
  }
}