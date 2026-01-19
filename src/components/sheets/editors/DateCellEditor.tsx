import React, { KeyboardEvent, useEffect, useRef } from 'react';
import { ICellEditorProps } from './ICellEditorProps';
import { format, parse } from 'date-fns';

/**
 * Редактор дат для ячеек таблицы.
 * Использует нативный календарь для максимальной совместимости и производительности в таблице.
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

  // Преобразуем входящее значение (Date или ISO строку) в формат yyyy-MM-dd для input type="date"
  const getInputValue = (val: any): string => {
    if (!val) return '';
    const date = new Date(val);
    if (isNaN(date.getTime())) return '';
    return format(date, 'yyyy-MM-dd');
  };

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
    
    // Парсим введенную дату. Мы сохраняем локальное время, чтобы избежать сдвигов.
    const date = parse(newVal, 'yyyy-MM-dd', new Date());
    if (!isNaN(date.getTime())) {
      // Устанавливаем время в начало дня для startDate и конец дня для endDate
      // Но здесь мы просто передаем объект Date, а TaskSheet решит что с ним делать
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
    // Форсируем открытие нативного календаря при клике
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
        onBlur={onCommit}
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

