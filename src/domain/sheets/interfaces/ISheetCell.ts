/**
 * Координаты ячейки
 */
export interface ISheetCellAddress {
  rowId: string;
  columnId: string;
}

/**
 * Состояние редактируемой ячейки
 */
export interface ISheetEditState {
  address: ISheetCellAddress;
  originalValue: any;
  currentValue: any;
  isValid: boolean;
  errorMessage?: string;
}


