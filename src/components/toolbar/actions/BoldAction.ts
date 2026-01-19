import { ToolbarAction } from './ToolbarAction';
import { IToolbarButton } from '../interfaces/ToolbarInterfaces';

/**
 * Действие для применения жирного начертания текста
 * Кнопка форматирования TF001
 */
export class BoldAction extends ToolbarAction {
  private isActive: boolean = false;

  constructor() {
    super('TF001', 'Жирный', 'B', 'Жирный текст (Ctrl+B)', 'Ctrl+B');
  }

  /**
   * Переключает жирное начертание текста
   */
  execute(): void {
    this.isActive = !this.isActive;
    console.log(`Жирный текст: ${this.isActive ? 'включено' : 'выключено'}`);
    // TODO: Интеграция с TextFormatter или SelectionManager
  }

  /**
   * Проверяет, активно ли жирное начертание
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
        if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
          event.preventDefault();
          this.execute();
        }
      }
    };
  }
}
