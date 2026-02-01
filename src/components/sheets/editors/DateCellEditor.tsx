import React, { KeyboardEvent, useEffect, useRef } from 'react';
import { ICellEditorProps } from './ICellEditorProps';
import { format, parse } from 'date-fns';
import { CellValue } from '@/types/sheet/CellValueTypes';

/**
 * Преобразует значение в формат для input type="date"
 */
function getInputValue(val: CellValue): string {
  if (!val) return '';
  const date = new Date(val as string | Date);
  if (isNaN(date.getTime())) return '';
  return format(date, 'yyyy-MM-dd');
}

/**
 * Редактор дат для ячеек таблицы.
 */
export const DateCellEditor: React.FC<ICellEditorProps> = ({
  value,
  onChange,
  onCommit,
  onCancel,
  autoFocus = true,
  isValid = true,
  errorMessage
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    if (!newVal) {
      onChange(null);
      return;
    }

    const date = parse(newVal, 'yyyy-MM-dd', new Date());
    if (!isNaN(date.getTime())) {
      onChange(date);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      onCommit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    if (e.currentTarget.showPicker) {
      try {
        e.currentTarget.showPicker();
      } catch (err) {
        console.error('Error showing picker:', err);
      }
    }
  };

  return (
    <div className="relative w-full h-full flex items-center bg-white">
      <input
        ref={inputRef}
        type="date"
        className={`h-full w-full px-2 py-0 min-h-0 border-none rounded-none outline-none focus:ring-1 text-[11px] font-sans appearance-none ${
          isValid ? 'focus:ring-primary' : 'focus:ring-destructive bg-destructive/10'
        }`}
        value={getInputValue(value)}
        onChange={handleChange}
        onBlur={() => onCommit()}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
      />
      {!isValid && errorMessage && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-destructive text-destructive-foreground text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
