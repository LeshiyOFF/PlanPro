import { ToolbarAction } from './ToolbarAction';
import { IToolbarButton } from '../interfaces/ToolbarInterfaces';

/**
 * Действие для применения курсивного начертания текста
 * Кнопка форматирования TF002
 */
export class ItalicAction extends ToolbarAction {
  private isActive: boolean = false;

  constructor() {
    super('TF002', 'Курсив', 'I', 'Курсивный текст (Ctrl+I)', 'Ctrl+I');
  }

  /**
   * Переключает курсивное начертание текста
   */
  execute(): void {
    this.isActive = !this.isActive;
    console.log(`Курсив: ${this.isActive ? 'включено' : 'выключено'}`);
    // TODO: Интеграция с TextFormatter или SelectionManager
  }

  /**
   * Проверяет, активно ли курсивное начертание
   */
  isActiveState(): boolean {
    return this.isActive;
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
      className: this.isActive ? 'toolbar-button-active' : '',
      onClick: () => this.execute(),
      onKeyDown: (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
          event.preventDefault();
          this.execute();
        }
      }
    };
  }
}
