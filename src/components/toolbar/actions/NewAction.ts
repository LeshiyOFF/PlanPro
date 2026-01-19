import { ToolbarAction } from './ToolbarAction';
import { IToolbarButton } from '../interfaces/ToolbarInterfaces';

/**
 * Действие для создания нового проекта
 * Стандартная кнопка тулбара TB001
 */
export class NewAction extends ToolbarAction {
  private handler?: () => void | Promise<void>;

  constructor(handler?: () => void | Promise<void>) {
    super('TB001', 'Новый', '➕', 'Создать новый проект (Ctrl+N)', 'Ctrl+N');
    this.handler = handler;
  }

  /**
   * Выполняет создание нового проекта
   */
  async execute(): Promise<void> {
    console.log('[NewAction] Executing new project action');
    if (this.handler) {
      await this.handler();
    } else {
      console.warn('[NewAction] No handler provided for NewAction');
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
        if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
          event.preventDefault();
          this.execute();
        }
      }
    };
  }
}
