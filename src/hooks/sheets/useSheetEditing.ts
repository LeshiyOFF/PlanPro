import { useState, useCallback } from 'react'
import { ISheetCellAddress, ISheetEditState } from '@/domain/sheets/interfaces/ISheetCell'
import { IValidationResult } from '@/domain/sheets/interfaces/IValidation'
import { CellValue } from '@/types/sheet/CellValueTypes'

/**
 * Хук для управления логикой In-place редактирования.
 * Соответствует принципу Single Responsibility.
 */
export const useSheetEditing = (
  onCommit?: (rowId: string, columnId: string, value: CellValue) => void,
  validate?: (value: CellValue, columnId: string, rowId: string) => IValidationResult,
) => {
  const [editState, setEditState] = useState<ISheetEditState | null>(null)

  const startEditing = useCallback((address: ISheetCellAddress, value: CellValue) => {
    setEditState({
      address,
      originalValue: value,
      currentValue: value,
      isValid: true,
    })
  }, [])

  const updateEditValue = useCallback(
    (value: CellValue) => {
      if (!editState) return

      let validation: IValidationResult = { isValid: true }
      if (validate) {
        validation = validate(value, editState.address.columnId, editState.address.rowId)
      }

      setEditState((prev) =>
        prev
          ? {
            ...prev,
            currentValue: value,
            isValid: validation.isValid,
            errorMessage: validation.errorMessage,
          }
          : null,
      )
    },
    [editState, validate],
  )

  const commitEditing = useCallback(
    (explicitValue?: CellValue) => {
      if (editState && editState.isValid) {
        let finalValue: CellValue =
          explicitValue !== undefined ? explicitValue : editState.currentValue

        if (
          finalValue &&
          typeof finalValue === 'object' &&
          finalValue !== null &&
          'nativeEvent' in finalValue
        ) {
          finalValue = editState.currentValue
        }

        onCommit?.(editState.address.rowId, editState.address.columnId, finalValue)
        setEditState(null)
      }
    },
    [editState, onCommit],
  )

  const cancelEditing = useCallback(() => {
    setEditState(null)
  }, [])

  const isEditing = useCallback(
    (rowId: string, columnId: string) => {
      return editState?.address.rowId === rowId && editState?.address.columnId === columnId
    },
    [editState],
  )

  return {
    editState,
    startEditing,
    updateEditValue,
    commitEditing,
    cancelEditing,
    isEditing,
  }
}
