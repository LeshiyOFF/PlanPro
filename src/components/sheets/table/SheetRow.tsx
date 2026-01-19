import React from 'react';
import { ISheetColumn } from '@/domain/sheets/interfaces/ISheetColumn';
import { ISheetCellAddress } from '@/domain/sheets/interfaces/ISheetCell';
import { SheetCell } from '../cells/SheetCell';

interface SheetRowProps<T> {
  row: T;
  rowId: string;
  columns: ISheetColumn<T>[];
  isEditing: (rowId: string, columnId: string) => boolean;
  isSelected: boolean;
  onRowClick: (rowId: string, isMulti: boolean, isRange: boolean) => void;
  editValue: any;
  isValid: boolean;
  errorMessage?: string;
  onStartEdit: (address: ISheetCellAddress, value: any) => void;
  onValueChange: (value: any) => void;
  onCommit: () => void;
  onCancel: () => void;
  onContextMenu?: (event: React.MouseEvent, row: T, columnId?: string) => void;
  isDisabled?: boolean;
}

/**
 * Строка профессиональной таблицы
 */
export const SheetRow = <T extends Record<string, any>>({
  row,
  rowId,
  columns,
  isEditing,
  isSelected,
  onRowClick,
  editValue,
  isValid,
  errorMessage,
  onStartEdit,
  onValueChange,
  onCommit,
  onCancel,
  onContextMenu,
  isDisabled = false
}: SheetRowProps<T>) => {
  const handleClick = (e: React.MouseEvent) => {
    if (isDisabled) return;
    onRowClick(rowId, e.ctrlKey || e.metaKey, e.shiftKey);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    if (onContextMenu) {
      onContextMenu(e, row);
    }
  };

  return (
    <tr 
      className={`transition-colors ${
        isDisabled ? 'opacity-40 grayscale pointer-events-none' : 
        isSelected ? 'bg-primary/10' : 'hover:bg-gray-50/50'
      }`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {columns.map(column => (
        <SheetCell
          key={`${rowId}-${column.id}`}
          rowId={rowId}
          column={column}
          value={row[column.field as keyof T]}
          isEditing={isEditing(rowId, column.id)}
          editValue={editValue}
          isValid={isValid}
          errorMessage={errorMessage}
          onStartEdit={onStartEdit}
          onValueChange={onValueChange}
          onCommit={onCommit}
          onCancel={onCancel}
          onContextMenu={onContextMenu}
          row={row}
        />
      ))}
    </tr>
  );
};

