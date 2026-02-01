/**
 * Типы для пунктов контекстного меню
 * Устраняет использование any в menu item поиске
 */

/**
 * Действие пункта меню
 */
export interface IMenuAction {
  readonly execute: () => Promise<void> | void;
  readonly canExecute: () => boolean;
}

/**
 * Пункт контекстного меню
 */
export interface IMenuItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: string | React.ReactNode;
  readonly separator?: boolean;
  readonly disabled?: boolean;
  readonly action?: IMenuAction;
  readonly submenu?: ReadonlyArray<IMenuItem>;
}

/**
 * Подменю
 */
export type ISubmenu = ReadonlyArray<IMenuItem>;
