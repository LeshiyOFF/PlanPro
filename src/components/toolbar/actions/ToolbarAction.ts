import type { IAction } from '@/services/actions/BaseAction';
import { IToolbarButton } from '../interfaces/ToolbarInterfaces';

/**
 * Базовый класс для действий кнопок панели инструментов.
 * Реализует IAction для совместимости с ActionManager (name = label, description = tooltip, enabled = !disabled).
 */
export abstract class ToolbarAction implements IAction {
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

  /** IAction: name — то же, что label */
  get name(): string {
    return this.label;
  }

  /** IAction: description — то же, что tooltip */
  get description(): string {
    return this.tooltip ?? '';
  }

  /** IAction: enabled — инверсия disabled */
  get enabled(): boolean {
    return !this.disabled;
  }

  /**
   * Выполнить действие (возвращает Promise для IAction)
   */
  abstract execute(): Promise<void>;

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

