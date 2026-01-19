import React, { useMemo } from 'react';
import { ISheetColumn } from '@/domain/sheets/interfaces/ISheetColumn';
import { useSheetEditing } from '@/hooks/sheets/useSheetEditing';
import { useSheetSelection } from '@/hooks/sheets/useSheetSelection';
import { useSheetDataProcessor } from '@/hooks/sheets/useSheetDataProcessor';
import { SheetValidationService } from '@/domain/sheets/services/SheetValidationService';
import { SheetBatchService } from '@/domain/sheets/services/SheetBatchService';
import { SheetHeader } from './SheetHeader';
import { SheetBody } from './SheetBody';
import { SheetFilterRow } from './SheetFilterRow';
import { FilterOperator } from '@/domain/sheets/interfaces/IDataProcessing';

/**
 * Пропсы для универсального движка таблиц
 */
export interface ProfessionalSheetProps<T> {
  data: T[];
  columns: ISheetColumn<T>[];
  rowIdField: keyof T;
  onDataChange?: (rowId: string, field: string, value: any) => void;
  onBatchChange?: (rowIds: string[], field: string, value: any) => void;
  onContextMenu?: (event: React.MouseEvent, row: T, columnId?: string) => void;
  onRowSelect?: (row: T) => void;
  onDeleteRows?: (rowIds: string[]) => void;
  disabledRowIds?: string[];
  className?: string;
}

/**
 * Professional Sheet - Универсальный движок таблиц.
 * Поддерживает иерархию, in-place редактирование и кастомные колонки.
 * Соответствует SOLID и принципам чистой архитектуры.
 */
export const ProfessionalSheet = <T extends Record<string, any>>({
  data,
  columns,
  rowIdField,
  onDataChange,
  onBatchChange,
  onContextMenu,
  onRowSelect,
  onDeleteRows,
  disabledRowIds = [],
  className = ''
}: ProfessionalSheetProps<T>) => {
  const validationService = useMemo(() => new SheetValidationService(), []);
  const batchService = useMemo(() => new SheetBatchService(), []);
  
  const {
    processedData,
    sortRules,
    filterRules,
    toggleSort,
    setFilter
  } = useSheetDataProcessor(data);

  const allIds = useMemo(() => processedData.map(r => String(r[rowIdField])), [processedData, rowIdField]);
  
  const {
    selectedIds,
    isSelected,
    toggleSelection,
    clearSelection
  } = useSheetSelection(allIds);

  const handleValidate = (value: any, columnId: string, rowId: string) => {
    const column = columns.find(c => c.id === columnId);
    const row = data.find(r => String(r[rowIdField]) === rowId);
    
    if (!column) return { isValid: true };
    
    return validationService.validate(value, column.type, column.field as string, row);
  };

  const {
    editState,
    startEditing,
    updateEditValue,
    commitEditing,
    cancelEditing,
    isEditing
  } = useSheetEditing(
    (rowId, columnId, value) => {
      const column = columns.find(c => c.id === columnId);
      if (!column) return;

      if (selectedIds.length > 1 && selectedIds.includes(rowId)) {
        // Пакетное обновление
        if (onBatchChange) {
          onBatchChange(selectedIds, column.field as string, value);
        } else if (onDataChange) {
          batchService.applyUpdate(selectedIds, column.field as string, value, onDataChange);
        }
      } else if (onDataChange) {
        onDataChange(rowId, column.field as string, value);
      }
    },
    handleValidate
  );

  const visibleColumns = useMemo(() => 
    columns.filter(c => c.visible), 
  [columns]);

  const handleRowClick = (rowId: string, event: React.MouseEvent) => {
    toggleSelection(rowId, event);
    const row = data.find(r => String(r[rowIdField]) === rowId);
    if (row && onRowSelect) {
      onRowSelect(row);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Delete' && selectedIds.length > 0 && onDeleteRows) {
      onDeleteRows(selectedIds);
    }
  };

  return (
    <div 
      className={`professional-sheet flex flex-col h-full bg-white border border-gray-200 rounded-md overflow-hidden ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0} // Делаем div фокусируемым для получения событий клавиатуры
    >
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full border-collapse table-fixed text-xs select-none min-w-max">
          <SheetHeader 
            columns={visibleColumns} 
            sortRules={sortRules}
            onSort={toggleSort}
          />
          <thead className="bg-gray-50">
            <SheetFilterRow 
              columns={visibleColumns} 
              onFilter={setFilter} 
            />
          </thead>
          <SheetBody
            data={processedData}
            columns={visibleColumns}
            rowIdField={rowIdField}
            isEditing={isEditing}
            isSelected={isSelected}
            onRowClick={handleRowClick}
            editValue={editState?.currentValue}
            isValid={editState?.isValid ?? true}
            errorMessage={editState?.errorMessage}
            onStartEdit={startEditing}
            onValueChange={updateEditValue}
            onCommit={commitEditing}
            onCancel={cancelEditing}
            onContextMenu={onContextMenu}
            disabledRowIds={disabledRowIds}
          />
        </table>
      </div>
    </div>
  );
};


