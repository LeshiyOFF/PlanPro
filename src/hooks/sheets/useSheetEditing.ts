import { useState, useCallback } from 'react';
import { ISheetCellAddress, ISheetEditState } from '@/domain/sheets/interfaces/ISheetCell';
import { IValidationResult } from '@/domain/sheets/interfaces/IValidation';

/**
 * Хук для управления логикой In-place редактирования.
 * Соответствует принципу Single Responsibility.
 */
export const useSheetEditing = (
  onCommit?: (rowId: string, columnId: string, value: any) => void,
  validate?: (value: any, columnId: string, rowId: string) => IValidationResult
) => {
  const [editState, setEditState] = useState<ISheetEditState | null>(null);

  const startEditing = useCallback((address: ISheetCellAddress, value: any) => {
    setEditState({
      address,
      originalValue: value,
      currentValue: value,
      isValid: true
    });
  }, []);

  const updateEditValue = useCallback((value: any) => {
    if (!editState) return;

    let validation: IValidationResult = { isValid: true };
    if (validate) {
      validation = validate(value, editState.address.columnId, editState.address.rowId);
    }

    setEditState(prev => prev ? { 
      ...prev, 
      currentValue: value,
      isValid: validation.isValid,
      errorMessage: validation.errorMessage
    } : null);
  }, [editState, validate]);

  const commitEditing = useCallback(() => {
    if (editState && editState.isValid) {
      onCommit?.(editState.address.rowId, editState.address.columnId, editState.currentValue);
      setEditState(null);
    }
  }, [editState, onCommit]);

  const cancelEditing = useCallback(() => {
    setEditState(null);
  }, []);

  const isEditing = useCallback((rowId: string, columnId: string) => {
    return editState?.address.rowId === rowId && editState?.address.columnId === columnId;
  }, [editState]);

  return {
    editState,
    startEditing,
    updateEditValue,
    commitEditing,
    cancelEditing,
    isEditing
  };
};

