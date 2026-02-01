import { ToolbarAction } from './ToolbarAction';
import { IToolbarButton } from '../interfaces/ToolbarInterfaces';
import { textFormattingService } from '@/services/TextFormattingService';

/**
 * Действие для применения жирного начертания текста
 * Кнопка форматирования TF001
 */
export class BoldAction extends ToolbarAction {
  constructor() {
    super('TF001', 'Жирный', 'B', 'Жирный текст (Ctrl+B)', 'Ctrl+B');
  }

  /**
   * Переключает жирное начертание текста
   */
  override async execute(): Promise<void> {
    textFormattingService.toggleStyle('bold');
  }

  /**
   * Проверяет, активно ли жирное начертание
   */
  isActiveState(): boolean {
    return textFormattingService.getStyleState('bold');
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
        if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
          event.preventDefault();
          this.execute();
        }
      }
    };
  }
}

