import { ToolbarAction } from './ToolbarAction';
import { IToolbarButton } from '../interfaces/ToolbarInterfaces';

/**
 * Действие для отмены последнего действия
 * Стандартная кнопка тулбара TB005
 */
export class UndoAction extends ToolbarAction {
  constructor() {
    super('TB005', 'Отменить', '↩️', 'Отменить последнее действие (Ctrl+Z)', 'Ctrl+Z');
  }

  /**
   * Выполняет отмену действия
   */
  execute(): void {
    console.log('Отмена действия');
    // TODO: Интеграция с HistoryManager или UndoStack
  }

  /**
   * Проверяет, можно ли выполнить отмену
   */
  canExecute(): boolean {
    // TODO: Проверить наличие действий в истории
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
        if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
          event.preventDefault();
          this.execute();
        }
      }
    };
  }
}
