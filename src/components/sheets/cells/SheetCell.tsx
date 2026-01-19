import React from 'react';
import { ISheetColumn } from '@/domain/sheets/interfaces/ISheetColumn';
import { ISheetCellAddress } from '@/domain/sheets/interfaces/ISheetCell';
import { CellEditorFactory } from '../editors/CellEditorFactory';

interface SheetCellProps<T> {
  rowId: string;
  column: ISheetColumn<T>;
  value: any;
  isEditing: boolean;
  editValue: any;
  isValid: boolean;
  errorMessage?: string;
  onStartEdit: (address: ISheetCellAddress, value: any) => void;
  onValueChange: (value: any) => void;
  onCommit: () => void;
  onCancel: () => void;
  onContextMenu?: (event: React.MouseEvent, row: T, columnId?: string) => void;
  row: T;
}

/**
 * Ячейка профессиональной таблицы.
 * Управляет переключением между режимом просмотра и редактирования.
 */
export const SheetCell = <T,>({
  rowId,
  column,
  value,
  isEditing,
  editValue,
  isValid,
  errorMessage,
  onStartEdit,
  onValueChange,
  onCommit,
  onCancel,
  onContextMenu,
  row
}: SheetCellProps<T>) => {
  const handleDoubleClick = () => {
    // Stage 7.19: Поддержка функции-предиката для условного редактирования
    const isEditable = typeof column.editable === 'function' 
      ? column.editable(row) 
      : column.editable;
    
    if (isEditable) {
      onStartEdit({ rowId, columnId: column.id }, value);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (onContextMenu) {
      e.stopPropagation();
      onContextMenu(e, row, column.id);
    }
  };

  const renderContent = () => {
    if (isEditing) {
      const Editor = CellEditorFactory.getEditor(column.type);
      return (
        <Editor
          value={editValue}
          onChange={onValueChange}
          onCommit={onCommit}
          onCancel={onCancel}
          isValid={isValid}
          errorMessage={errorMessage}
        />
      );
    }

    if (column.formatter) {
      return column.formatter(value, row);
    }

    return <span className="truncate">{String(value ?? '')}</span>;
  };

  return (
    <td
      className={`px-1.5 py-0.5 border-r border-border/30 last:border-r-0 h-9 ${
        isEditing ? 'p-0 ring-1 ring-inset ring-primary z-10' : ''
      }`}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      {renderContent()}
    </td>
  );
};

