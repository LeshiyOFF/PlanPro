/**
 * Интерфейс для кнопки панели инструментов
 */
export interface IToolbarButton {
  id: string;
  label: string;
  icon: string;
  tooltip?: string;
  disabled?: boolean;
  visible?: boolean;
  className?: string;
  onClick: () => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  badge?: string | number;
  dropdownItems?: IToolbarButton[];
}

/**
 * Интерфейс для группы кнопок панели инструментов
 */
export interface IToolbarGroup {
  id: string;
  title: string;
  buttons: IToolbarButton[];
  visible?: boolean;
  className?: string;
}

/**
 * Тип панели инструментов
 */
export type ToolbarType = 
  | 'standard'
  | 'formatting'
  | 'view'
  | 'custom';

/**
 * Конфигурация панели инструментов
 */
export interface IToolbarConfig {
  id: string;
  type: ToolbarType;
  title: string;
  groups: IToolbarGroup[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  collapsible?: boolean;
}

/**
 * События панели инструментов
 */
export interface IToolbarEvents {
  onButtonClick?: (buttonId: string) => void;
  onGroupToggle?: (groupId: string, isExpanded: boolean) => void;
  onToolbarResize?: (width: number) => void;
}

/**
 * Позиция кнопки в группе
 */
export type ToolbarButtonPosition = 
  | 'first'
  | 'last'
  | 'middle';

/**
 * Размер кнопки
 */
export type ToolbarButtonSize = 
  | 'small'
  | 'medium'
  | 'large';

/**
 * Состояние кнопки
 */
export type ToolbarButtonState = 
  | 'default'
  | 'active'
  | 'disabled'
  | 'loading';

/**
 * Интерфейс для контейнера тулбара
 */
export interface IToolbarContainer {
  className?: string;
  onAction?: (actionId: string, actionLabel: string) => void;
}
