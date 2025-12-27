import { MenuItemConstructorOptions } from 'electron'

/**
 * Шаблон меню "Вид"
 */
export class ViewMenuTemplate {
  /**
   * Создание меню "Вид"
   */
  public static create(): MenuItemConstructorOptions {
    return {
      label: 'Вид',
      submenu: [
        {
          label: 'Диаграмма Ганта',
          type: 'radio',
          checked: true,
          click: () => this.handleMenuAction('view-gantt')
        },
        {
          label: 'Сетевая диаграмма',
          type: 'radio',
          click: () => this.handleMenuAction('view-network')
        },
        {
          label: 'Использование задач',
          type: 'radio',
          click: () => this.handleMenuAction('view-task-usage')
        },
        {
          label: 'Использование ресурсов',
          type: 'radio',
          click: () => this.handleMenuAction('view-resource-usage')
        },
        { type: 'separator' },
        {
          label: 'Масштаб',
          submenu: [
            { role: 'zoomIn', label: 'Увеличить' },
            { role: 'zoomOut', label: 'Уменьшить' },
            { role: 'resetZoom', label: 'Сбросить' }
          ]
        },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Полноэкранный режим' }
      ]
    }
  }

  /**
   * Обработчик действий меню
   */
  private static handleMenuAction(action: string): void {
    console.log(`View menu action: ${action}`)
  }
}