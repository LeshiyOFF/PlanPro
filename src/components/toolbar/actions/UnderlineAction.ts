import { ToolbarAction } from './ToolbarAction';
import { IToolbarButton } from '../interfaces/ToolbarInterfaces';

/**
 * Действие для применения подчёркнутого начертания текста
 * Кнопка форматирования TF003
 */
export class UnderlineAction extends ToolbarAction {
  private isActive: boolean = false;

  constructor() {
    super('TF003', 'Подчёркнутый', 'U', 'Подчёркнутый текст (Ctrl+U)', 'Ctrl+U');
  }

  /**
   * Переключает подчёркнутое начертание текста
   */
  execute(): void {
    this.isActive = !this.isActive;
    console.log(`Подчёркивание: ${this.isActive ? 'включено' : 'выключено'}`);
    // TODO: Интеграция с TextFormatter или SelectionManager
  }

  /**
   * Проверяет, активно ли подчёркивание
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
        if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
          event.preventDefault();
          this.execute();
        }
      }
    };
  }
}

