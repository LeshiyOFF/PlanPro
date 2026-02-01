import { ToolbarAction } from './ToolbarAction';
import { IToolbarButton } from '../interfaces/ToolbarInterfaces';

/**
 * Действие для поиска в проекте
 * Стандартная кнопка тулбара TB007
 */
export class FindAction extends ToolbarAction {
  constructor() {
    super('TB007', 'Найти', '🔍', 'Найти в проекте (Ctrl+F)', 'Ctrl+F');
  }

  /**
   * Выполняет открытие панели поиска
   */
  override async execute(): Promise<void> {
    window.dispatchEvent(new CustomEvent('search:open'));
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
        if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
          event.preventDefault();
          this.execute();
        }
      }
    };
  }
}

