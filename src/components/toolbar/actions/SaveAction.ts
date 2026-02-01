import { ToolbarAction } from './ToolbarAction'
import { IToolbarButton } from '../interfaces/ToolbarInterfaces'

/**
 * Действие для сохранения текущего проекта
 * Стандартная кнопка тулбара TB003
 */
export class SaveAction extends ToolbarAction {
  private handler?: () => void | Promise<void>

  constructor(handler?: () => void | Promise<void>) {
    super('TB003', 'Сохранить', '💾', 'Сохранить текущий проект (Ctrl+S)', 'Ctrl+S')
    this.handler = handler
  }

  /**
   * Выполняет сохранение проекта
   */
  async execute(): Promise<void> {
    console.log('[SaveAction] Executing save project action')
    if (this.handler) {
      await this.handler()
    } else {
      console.warn('[SaveAction] No handler provided for SaveAction')
    }
  }

  /**
   * Создаёт экземпляр кнопки для тулбара
   */
  createButton(): IToolbarButton {
    return {
      id: this.id,
      label: this.label,
      icon: this.icon,
      tooltip: this.tooltip,
      disabled: this.disabled,
      onClick: () => this.execute(),
      onKeyDown: (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
          event.preventDefault()
          this.execute()
        }
      },
    }
  }
}

