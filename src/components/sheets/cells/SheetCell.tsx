import React from 'react'
import { ISheetColumn, SheetColumnType } from '@/domain/sheets/interfaces/ISheetColumn'
import { ISheetCellAddress } from '@/domain/sheets/interfaces/ISheetCell'
import { CellValue } from '@/types/sheet/CellValueTypes'
import { CellEditorFactory } from '../editors/CellEditorFactory'
import { toPercent } from '@/utils/ProgressFormatter'

interface SheetCellProps<T> {
  rowId: string;
  column: ISheetColumn<T>;
  value: CellValue;
  isEditing: boolean;
  editValue: CellValue;
  isValid: boolean;
  errorMessage?: string;
  onStartEdit: (address: ISheetCellAddress, value: CellValue) => void;
  onValueChange: (value: CellValue) => void;
  onCommit: () => void;
  onCancel: () => void;
  onContextMenu?: (event: React.MouseEvent, row: T, columnId?: string) => void;
  row: T;
}

/**
 * Ячейка профессиональной таблицы.
 * Управляет переключением между режимом просмотра и редактирования.
 * Stage 8.20: Поддержка onCustomEdit для кастомных редакторов.
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
  row,
}: SheetCellProps<T>) => {
  const handleDoubleClick = () => {
    // Stage 8.20: Если задан onCustomEdit, используем его вместо inline-редактирования
    if (column.onCustomEdit) {
      column.onCustomEdit(row, column.id)
      return
    }

    // Stage 7.19: Поддержка функции-предиката для условного редактирования
    const isEditable = typeof column.editable === 'function'
      ? column.editable(row)
      : column.editable

    if (isEditable) {
      const editableValue: CellValue = column.type === SheetColumnType.PERCENT
        ? String(toPercent(Number(value) || 0))
        : value
      onStartEdit({ rowId, columnId: column.id }, editableValue)
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    if (onContextMenu) {
      e.stopPropagation()
      onContextMenu(e, row, column.id)
    }
  }

  const renderContent = () => {
    if (isEditing) {
      const Editor = CellEditorFactory.getEditor(column.type)
      return (
        <Editor
          value={editValue}
          onChange={onValueChange}
          onCommit={onCommit}
          onCancel={onCancel}
          isValid={isValid}
          errorMessage={errorMessage}
          options={column.options}
        />
      )
    }

    if (column.formatter) {
      return column.formatter(value, row)
    }

    const displayValue = value === null || value === undefined ? '' : String(value)
    return <span className="truncate">{displayValue}</span>
  }

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
  )
}


