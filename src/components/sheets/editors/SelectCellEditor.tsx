import React, { KeyboardEvent } from 'react'
import { CellValue } from '@/types/sheet/CellValueTypes'
import { ICellEditorProps } from './ICellEditorProps'

/**
 * Редактор ячеек типа SELECT (выпадающий список)
 * Stage 8.14: Реализация выбора из списка без возможности ручного ввода
 */
export const SelectCellEditor: React.FC<ICellEditorProps> = ({
  value,
  onChange,
  onCommit,
  onCancel,
  autoFocus = true,
  isValid = true,
  errorMessage,
  options = [],
}) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      onCommit()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  const selectValue = typeof value === 'string' || typeof value === 'number' ? value : ''
  return (
    <div className="relative w-full h-full">
      <select
        className={`h-full w-full px-1 py-0 min-h-0 border-none rounded-none focus:outline-none focus:ring-1 text-[11px] bg-white ${
          isValid ? 'focus:ring-primary' : 'focus:ring-destructive bg-destructive/10'
        }`}
        value={selectValue}
        onChange={(e) => {
          const newValue: CellValue = e.target.value
          onChange(newValue)
          onCommit(newValue)
        }}
        onBlur={() => {
          if (typeof value !== 'object') {
            onCommit()
          }
        }}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
      >
        <option value="" disabled>Выберите...</option>
        {options.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
      {!isValid && errorMessage && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-destructive text-destructive-foreground text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
          {errorMessage}
        </div>
      )}
    </div>
  )
}
