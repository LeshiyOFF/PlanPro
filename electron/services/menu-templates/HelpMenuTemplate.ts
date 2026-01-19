import { MenuItemConstructorOptions } from 'electron'

/**
 * Шаблон меню "Справка"
 */
export class HelpMenuTemplate {
  /**
   * Создание меню "Справка"
   */
  public static create(isMac: boolean): MenuItemConstructorOptions {
    const helpMenu: MenuItemConstructorOptions = {
      label: 'Справка',
      submenu: [
        {
          label: 'Документация',
          click: () => this.handleMenuAction('documentation')
        },
        {
          label: 'Сообщить о проблеме',
          click: () => this.handleMenuAction('report-issue')
        },
        { type: 'separator' },
        {
          label: 'Проверить обновления',
          click: () => this.handleMenuAction('check-updates')
        },
        { type: 'separator' },
        {
          label: 'О ПланПро',
          click: () => this.handleMenuAction('about')
        }
      ]
    }

    if (isMac && Array.isArray(helpMenu.submenu)) {
      helpMenu.submenu.push(
        { type: 'separator' },
        {
          label: 'Привлечь ProjectLibre',
          click: () => this.handleMenuAction('donate')
        }
      )
    }

    return helpMenu
  }

  /**
   * Обработчик действий меню
   */
  private static handleMenuAction(action: string): void {
    console.log(`Help menu action: ${action}`)
  }
}