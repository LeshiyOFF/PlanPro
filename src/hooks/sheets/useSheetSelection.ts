import { useState, useCallback } from 'react';
import { ISheetSelectionState } from '@/domain/sheets/interfaces/ISheetSelection';

/**
 * Хук для управления множественным выбором строк.
 * Поддерживает Ctrl/Cmd для одиночного выбора и Shift для диапазона.
 */
export const useSheetSelection = (allIds: string[]) => {
  const [selection, setSelection] = useState<ISheetSelectionState>({
    selectedIds: new Set<string>(),
    lastSelectedId: null
  });

  const toggleSelection = useCallback((id: string, isMulti: boolean, isRange: boolean) => {
    setSelection(prev => {
      const newSelected = new Set(isMulti ? prev.selectedIds : []);
      
      if (isRange && prev.lastSelectedId) {
        const startIdx = allIds.indexOf(prev.lastSelectedId);
        const endIdx = allIds.indexOf(id);
        const range = allIds.slice(Math.min(startIdx, endIdx), Math.max(startIdx, endIdx) + 1);
        range.forEach(rangeId => newSelected.add(rangeId));
      } else if (isMulti && newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }

      return {
        selectedIds: newSelected,
        lastSelectedId: id
      };
    });
  }, [allIds]);

  const clearSelection = useCallback(() => {
    setSelection({ selectedIds: new Set(), lastSelectedId: null });
  }, []);

  const isSelected = useCallback((id: string) => {
    return selection.selectedIds.has(id);
  }, [selection.selectedIds]);

  return {
    selectedIds: Array.from(selection.selectedIds),
    isSelected,
    toggleSelection,
    clearSelection
  };
};


