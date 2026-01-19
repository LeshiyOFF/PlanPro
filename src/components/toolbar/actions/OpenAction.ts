import { ToolbarAction } from './ToolbarAction';
import { IToolbarButton } from '../interfaces/ToolbarInterfaces';

/**
 * Действие для открытия существующего проекта
 * Стандартная кнопка тулбара TB002
 */
export class OpenAction extends ToolbarAction {
  private handler?: () => void | Promise<void>;

  constructor(handler?: () => void | Promise<void>) {
    super('TB002', 'Открыть', '📁', 'Открыть существующий проект (Ctrl+O)', 'Ctrl+O');
    this.handler = handler;
  }

  /**
   * Выполняет открытие файла проекта
   */
  async execute(): Promise<void> {
    console.log('[OpenAction] Executing open project action');
    if (this.handler) {
      await this.handler();
    } else {
      console.warn('[OpenAction] No handler provided for OpenAction');
    }
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
        if ((event.ctrlKey || event.metaKey) && event.key === 'o') {
          event.preventDefault();
          this.execute();
        }
      }
    };
  }
}

