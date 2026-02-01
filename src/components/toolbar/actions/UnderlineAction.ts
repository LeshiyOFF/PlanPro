import { ToolbarAction } from './ToolbarAction';
import { IToolbarButton } from '../interfaces/ToolbarInterfaces';
import { textFormattingService } from '@/services/TextFormattingService';

/**
 * Действие для применения подчёркнутого начертания текста
 * Кнопка форматирования TF003
 */
export class UnderlineAction extends ToolbarAction {
  constructor() {
    super('TF003', 'Подчёркнутый', 'U', 'Подчёркнутый текст (Ctrl+U)', 'Ctrl+U');
  }

  /**
   * Переключает подчёркнутое начертание текста
   */
  override async execute(): Promise<void> {
    textFormattingService.toggleStyle('underline');
  }

  /**
   * Проверяет, активно ли подчёркивание
   */
  isActiveState(): boolean {
    return textFormattingService.getStyleState('underline');
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
        if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
          event.preventDefault();
          this.execute();
        }
      }
    };
  }
}

