/**
 * Интерфейсы для ячеек таблицы.
 */

import { CellValue } from '@/types/sheet/CellValueTypes'

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
  originalValue: CellValue;
  currentValue: CellValue;
  isValid: boolean;
  errorMessage?: string;
}
