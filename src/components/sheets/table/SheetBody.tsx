import React from 'react';
import { ISheetColumn } from '@/domain/sheets/interfaces/ISheetColumn';
import { ISheetCellAddress } from '@/domain/sheets/interfaces/ISheetCell';
import { SheetRow } from './SheetRow';

interface SheetBodyProps<T> {
  data: T[];
  columns: ISheetColumn<T>[];
  rowIdField: keyof T;
  isEditing: (rowId: string, columnId: string) => boolean;
  isSelected: (rowId: string) => boolean;
  onRowClick: (rowId: string, isMulti: boolean, isRange: boolean) => void;
  editValue: any;
  isValid: boolean;
  errorMessage?: string;
  onStartEdit: (address: ISheetCellAddress, value: any) => void;
  onValueChange: (value: any) => void;
  onCommit: () => void;
  onCancel: () => void;
  onContextMenu?: (event: React.MouseEvent, row: T, columnId?: string) => void;
  disabledRowIds?: string[];
}

/**
 * Тело профессиональной таблицы
 */
export const SheetBody = <T extends Record<string, any>>({
  data,
  columns,
  rowIdField,
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
  disabledRowIds = []
}: SheetBodyProps<T>) => {
  return (
    <tbody className="divide-y divide-gray-100">
      {data.map((row, index) => {
        const rowId = String(row[rowIdField]);
        const isDisabled = disabledRowIds.includes(rowId);
        
        return (
          <SheetRow
            key={rowId}
            row={row}
            rowId={rowId}
            columns={columns}
            isEditing={isEditing}
            isSelected={isSelected(rowId)}
            isDisabled={isDisabled}
            onRowClick={(id, multi, range) => !isDisabled && onRowClick(id, multi, range)}
            editValue={editValue}
            isValid={isValid}
            errorMessage={errorMessage}
            onStartEdit={onStartEdit}
            onValueChange={onValueChange}
            onCommit={onCommit}
            onCancel={onCancel}
            onContextMenu={(e, r, cid) => !isDisabled && onContextMenu?.(e, r, cid)}
          />
        );
      })}
    </tbody>
  );
};


