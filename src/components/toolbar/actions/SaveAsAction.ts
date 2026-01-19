import { ToolbarAction } from './ToolbarAction';
import { IToolbarButton } from '../interfaces/ToolbarInterfaces';

/**
 * Действие для сохранения проекта под новым именем
 * Стандартная кнопка тулбара TB003_AS
 */
export class SaveAsAction extends ToolbarAction {
  private handler?: () => void | Promise<void>;

  constructor(handler?: () => void | Promise<void>) {
    super('TB003_AS', 'Сохранить как', '💾', 'Сохранить проект под новым именем', 'F12');
    this.handler = handler;
  }

  /**
   * Выполняет сохранение проекта как...
   */
  async execute(): Promise<void> {
    console.log('[SaveAsAction] Executing save project as action');
    if (this.handler) {
      await this.handler();
    } else {
      console.warn('[SaveAsAction] No handler provided for SaveAsAction');
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
      onClick: () => this.execute()
    };
  }
}

