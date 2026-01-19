import { ToolbarAction } from './ToolbarAction';
import { IToolbarButton } from '../interfaces/ToolbarInterfaces';

/**
 * Действие для повторения последнего отменённого действия
 * Стандартная кнопка тулбара TB006
 */
export class RedoAction extends ToolbarAction {
  constructor() {
    super('TB006', 'Повторить', '↪️', 'Повторить последнее действие (Ctrl+Y)', 'Ctrl+Y');
  }

  /**
   * Выполняет повторение действия
   */
  execute(): void {
    console.log('Повторение действия');
    // TODO: Интеграция с HistoryManager или RedoStack
  }

  /**
   * Проверяет, можно ли выполнить повторение
   */
  canExecute(): boolean {
    // TODO: Проверить наличие отменённых действий
    return super.canExecute();
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
      disabled: !this.canExecute(),
      onClick: () => this.execute(),
      onKeyDown: (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
          event.preventDefault();
          this.execute();
        }
      }
    };
  }
}

