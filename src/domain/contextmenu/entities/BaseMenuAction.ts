/**
 * Базовое действие пункта меню
 */
export abstract class BaseMenuAction {
  protected constructor(
    protected readonly label: string,
    protected readonly icon: string = '',
    protected readonly shortcut: string = ''
  ) {}

  abstract execute(): Promise<void>;
  abstract canExecute(): boolean;

  getLabel(): string {
    return this.label;
  }

  getIcon(): string {
    return this.icon;
  }

  getShortcut(): string {
    return this.shortcut;
  }
}
