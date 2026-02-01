import { ReactNode } from 'react';
import { ContextMenuType, ContextMenuStatus } from '../ContextMenuType';

/**
 * Действие пункта меню
 */
export interface IMenuAction {
  execute(): Promise<void>;
  canExecute(): boolean;
  getLabel(): string;
  getIcon(): ReactNode;
  getShortcut(): string;
}

/**
 * Пункт контекстного меню
 */
export interface IContextMenuItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: ReactNode;
  readonly shortcut?: string;
  readonly disabled?: boolean;
  readonly separator?: boolean;
  readonly tooltip?: string;
  readonly action?: IMenuAction;
  readonly submenu?: IContextMenuItem[];
}

/** Цель контекстного меню (задача, ресурс или объект с id) */
export type ContextMenuTarget = Record<string, string | number | boolean | object | null | undefined>;

/**
 * Контекстное меню
 */
export interface IContextMenu {
  readonly id: string;
  readonly type: ContextMenuType;
  readonly items: IContextMenuItem[];
  readonly position: {
    x: number;
    y: number;
  };
  readonly status: ContextMenuStatus;
  readonly target?: ContextMenuTarget;
}

/**
 * Контекст для отображения меню
 */
export interface IContextMenuContext {
  readonly target: ContextMenuTarget;
  readonly position: {
    x: number;
    y: number;
  };
  readonly actions?: Array<{
    label?: string;
    onClick?: () => void;
    icon?: ReactNode;
    divider?: boolean;
    disabled?: boolean;
    tooltip?: string;
  }>;
  readonly metadata?: Record<string, string | number | boolean | null | undefined>;
}

