import { ToolbarAction } from './ToolbarAction'
import { IToolbarButton } from '../interfaces/ToolbarInterfaces'
import { textFormattingService } from '@/services/TextFormattingService'

/**
 * Действие для применения курсивного начертания текста
 * Кнопка форматирования TF002
 */
export class ItalicAction extends ToolbarAction {
  constructor() {
    super('TF002', 'Курсив', 'I', 'Курсивный текст (Ctrl+I)', 'Ctrl+I')
  }

  /**
   * Переключает курсивное начертание текста
   */
  override async execute(): Promise<void> {
    textFormattingService.toggleStyle('italic')
  }

  /**
   * Проверяет, активно ли курсивное начертание
   */
  isActiveState(): boolean {
    return textFormattingService.getStyleState('italic')
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
      className: this.isActiveState() ? 'toolbar-button-active' : '',
      onClick: () => this.execute(),
      onKeyDown: (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
          event.preventDefault()
          this.execute()
        }
      },
    }
  }
}

