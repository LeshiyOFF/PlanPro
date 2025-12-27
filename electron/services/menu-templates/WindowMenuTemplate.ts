import { MenuItemConstructorOptions } from 'electron'

/**
 * Шаблон меню "Окно"
 */
export class WindowMenuTemplate {
  /**
   * Создание меню "Окно"
   */
  public static create(): MenuItemConstructorOptions {
    return {
      label: 'Окно',
      submenu: [
        { role: 'minimize', label: 'Свернуть' },
        { role: 'close', label: 'Закрыть' }
      ]
    }
  }
}