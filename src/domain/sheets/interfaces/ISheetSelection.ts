/**
 * Типы выбора в таблице
 */
export enum SelectionMode {
  SINGLE = 'single',
  MULTIPLE = 'multiple'
}

/**
 * Интерфейс состояния выбора
 */
export interface ISheetSelectionState {
  selectedIds: Set<string>;
  lastSelectedId: string | null;
}

