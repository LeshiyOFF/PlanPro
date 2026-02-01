import { ToolbarAction } from './ToolbarAction'
import { IToolbarButton } from '../interfaces/ToolbarInterfaces'

/**
 * Действие для печати проекта
 * Стандартная кнопка тулбара TB004
 */
export class PrintAction extends ToolbarAction {
  constructor() {
    super('TB004', 'Печать', '🖨️', 'Печать проекта (Ctrl+P)', 'Ctrl+P')
  }

  /**
   * Выполняет печать проекта
   */
  override async execute(): Promise<void> {
    window.print()
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
        if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
          event.preventDefault()
          this.execute()
        }
      },
    }
  }
}

