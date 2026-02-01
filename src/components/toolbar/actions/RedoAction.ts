import { ToolbarAction } from './ToolbarAction';
import { IToolbarButton } from '../interfaces/ToolbarInterfaces';
import { undoRedoService } from '../../../services/UndoRedoService';
import type { UndoRedoState } from '../../../services/UndoRedoService';

/**
 * Действие для повторения последнего отменённого действия
 * Стандартная кнопка тулбара TB006
 */
export class RedoAction extends ToolbarAction {
  private state: UndoRedoState | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    super('TB006', 'Повторить', '↪️', 'Повторить последнее действие (Ctrl+Y)', 'Ctrl+Y');
    this.unsubscribe = undoRedoService.addStateListener((s) => {
      this.state = s;
    });
  }

  /**
   * Выполняет повторение действия
   */
  override async execute(): Promise<void> {
    console.log('Повторение действия');
    if (!this.state?.canRedo) {
      return;
    }
    // Интеграция с HistoryManager или RedoStack — при подключении сервиса
  }

  /**
   * Проверяет, можно ли выполнить повторение
   */
  override canExecute(): boolean {
    return this.state?.canRedo ?? false;
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

