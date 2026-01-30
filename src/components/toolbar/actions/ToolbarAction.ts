import { IToolbarButton } from '../interfaces/ToolbarInterfaces';

/**
 * Базовый класс для действий кнопок панели инструментов
 */
export abstract class ToolbarAction {
  public readonly id: string;
  public readonly label: string;
  public readonly icon: string;
  public readonly tooltip?: string;
  public readonly shortcut?: string;
  public disabled: boolean = false;

  constructor(id: string, label: string, icon: string, tooltip?: string, shortcut?: string) {
    this.id = id;
    this.label = label;
    this.icon = icon;
    this.tooltip = tooltip;
    this.shortcut = shortcut;
  }

  /**
   * Выполнить действие
   */
  abstract execute(): void | Promise<void>;

  /**
   * Можно ли выполнить действие
   */
  canExecute(): boolean {
    return !this.disabled;
  }

  /**
   * Установить состояние disabled
   */
  setDisabled(disabled: boolean): void {
    this.disabled = disabled;
  }

  /**
   * Получить конфигурацию кнопки для UI
   */
  toToolbarButton(): IToolbarButton {
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

