import { MenuItemConstructorOptions } from 'electron'

/**
 * Шаблон меню "Проект"
 */
export class ProjectMenuTemplate {
  /**
   * Создание меню "Проект"
   */
  public static create(): MenuItemConstructorOptions {
    return {
      label: 'Проект',
      submenu: [
        {
          label: 'Свойства проекта...',
          click: () => this.handleMenuAction('project-properties')
        },
        { type: 'separator' },
        {
          label: 'Календарь...',
          click: () => this.handleMenuAction('calendar-settings')
        },
        {
          label: 'Ресурсы...',
          click: () => this.handleMenuAction('resources')
        },
        { type: 'separator' },
        {
          label: 'Статистика проекта',
          click: () => this.handleMenuAction('project-statistics')
        }
      ]
    }
  }

  /**
   * Обработчик действий меню
   */
  private static handleMenuAction(action: string): void {
    console.log(`Project menu action: ${action}`)
  }
}