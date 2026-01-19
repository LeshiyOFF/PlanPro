import React, { KeyboardEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { ICellEditorProps } from './ICellEditorProps';

/**
 * Редактор текстовых ячеек
 */
export const TextCellEditor: React.FC<ICellEditorProps> = ({
  value,
  onChange,
  onCommit,
  onCancel,
  autoFocus = true,
  isValid = true,
  errorMessage
}) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      onCommit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="relative w-full h-full">
      <Input
        className={`h-full w-full px-2 py-0 min-h-0 border-none rounded-none focus-visible:ring-1 ${
          isValid ? 'focus-visible:ring-primary' : 'focus-visible:ring-destructive bg-destructive/10'
        }`}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onCommit}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
      />
      {!isValid && errorMessage && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-destructive text-destructive-foreground text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
          {errorMessage}
        </div>
      )}
    </div>
  );
};


