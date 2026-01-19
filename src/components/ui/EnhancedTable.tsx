/**
 * Enhanced Table с Event Flow интеграцией
 * Следует SOLID принципам и паттернам Event Flow
 */

import React, { forwardRef, useCallback, useMemo } from 'react';
import {
  Table as ShadcnTable,
  TableBody as ShadcnTableBody,
  TableCell as ShadcnTableCell,
  TableHead as ShadcnTableHead,
  TableHeader as ShadcnTableHeader,
  TableRow as ShadcnTableRow
} from '@/components/ui/Table';
import { useEventFlow } from '@/providers/EventFlowContext';
import { BaseEvent, EventType } from '@/types/EventFlowTypes';

/**
 * Props для EnhancedTable
 */
export interface EnhancedTableProps {
  data: any[];
  columns: Array<{
    key: string;
    title: string;
    sortable?: boolean;
    width?: string;
    render?: (value: any, row: any, index: number) => React.ReactNode;
  }>;
  eventType?: EventType;
  eventData?: any;
  eventSource?: string;
  onEventDispatched?: (event: BaseEvent) => void;
  onRowSelect?: (row: any, index: number) => void;
  onCellEdit?: (row: any, column: string, value: any) => void;
  onContextMenu?: (event: React.MouseEvent, row: any, index: number) => void;
  selectedRows?: number[];
  editable?: boolean;
  className?: string;
}

/**
 * Enhanced Table компонент с Event Flow поддержкой
 * Диспетчеризирует события при выборе и редактировании
 */
export const EnhancedTable = forwardRef<HTMLTableElement, EnhancedTableProps>(
  (
    {
      data,
      columns,
      eventType,
      eventData,
      eventSource = 'EnhancedTable',
      onEventDispatched,
      onRowSelect,
      onCellEdit,
      onContextMenu,
      selectedRows = [],
      editable = false,
      className = ''
    },
    ref
  ) => {
    const { dispatch } = useEventFlow();

    const dispatchEvent = useCallback(
      (type: EventType, additionalData?: any) => {
        if (eventType) {
          const flowEvent: BaseEvent = {
            id: `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            timestamp: new Date(),
            source: eventSource,
            data: {
              ...eventData,
              ...additionalData
            }
          };

          dispatch(flowEvent);
          onEventDispatched?.(flowEvent);
        }
      },
      [eventType, eventData, eventSource, dispatch, onEventDispatched]
    );

    const handleRowClick = useCallback(
      (row: any, index: number) => (event: React.MouseEvent) => {
        const isSelected = selectedRows.includes(index);

        dispatchEvent(EventType.TASK_SELECTED, {
          row,
          index,
          isSelected,
          selectedRows: isSelected 
            ? selectedRows.filter(i => i !== index)
            : [...selectedRows, index]
        });

        onRowSelect?.(row, index);
      },
      [selectedRows, dispatchEvent, onRowSelect]
    );

    const handleCellEdit = useCallback(
      (row: any, column: string, value: any, index: number) => {
        const oldValue = row[column];

        dispatchEvent(EventType.TASK_UPDATED, {
          row,
          column,
          oldValue,
          newValue: value,
          index
        });

        onCellEdit?.(row, column, value);
      },
      [dispatchEvent, onCellEdit]
    );

    const handleSort = useCallback(
      (column: string) => {
        dispatchEvent(EventType.VIEW_CHANGED, {
          action: 'sort',
          column,
          sortOrder: 'asc' // Здесь можно хранить состояние сортировки
        });
      },
      [dispatchEvent]
    );

    const renderCell = useCallback(
      (row: any, column: any, rowIndex: number) => {
        const value = row[column.key];
        const cellKey = `${column.key}-${rowIndex}`;

        if (editable && column.editable !== false) {
          return (
            <EditableCell
              key={cellKey}
              value={value}
              onChange={(newValue) => handleCellEdit(row, column.key, newValue, rowIndex)}
            />
          );
        }

        if (column.render) {
          return column.render(value, row, rowIndex);
        }

        return value;
      },
      [editable, handleCellEdit]
    );

    const memoizedData = useMemo(() => data, [data]);

    return (
      <div className={`enhanced-table-container ${className}`}>
        <ShadcnTable ref={ref}>
          <ShadcnTableHeader>
            <ShadcnTableRow>
              {columns.map((column) => (
                <ShadcnTableHead 
                  key={column.key} 
                  style={{ width: column.width }}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                  className={column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''}
                >
                  {column.title}
                  {column.sortable && (
                    <span className="ml-1 text-gray-400">⇅</span>
                  )}
                </ShadcnTableHead>
              ))}
            </ShadcnTableRow>
          </ShadcnTableHeader>
          <ShadcnTableBody>
            {memoizedData.map((row, index) => (
              <ShadcnTableRow
                key={index}
                onClick={handleRowClick(row, index)}
                onContextMenu={onContextMenu ? (e) => onContextMenu(e, row, index) : undefined}
                className={`cursor-pointer transition-colors ${
                  selectedRows.includes(index) 
                    ? 'bg-primary/10 border-primary/20' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {columns.map((column) => (
                  <ShadcnTableCell key={`${column.key}-${index}`}>
                    {renderCell(row, column, index)}
                  </ShadcnTableCell>
                ))}
              </ShadcnTableRow>
            ))}
          </ShadcnTableBody>
        </ShadcnTable>
      </div>
    );
  }
);

EnhancedTable.displayName = 'EnhancedTable';

/**
 * Редактируемая ячейка для таблицы
 */
interface EditableCellProps {
  value: any;
  onChange: (value: any) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({ value, onChange }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onChange(editValue);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleBlur();
    } else if (event.key === 'Escape') {
      setIsEditing(false);
      setEditValue(value);
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full px-2 py-1 border rounded"
        autoFocus
      />
    );
  }

  return (
    <div 
      onDoubleClick={handleDoubleClick}
      className="px-2 py-1 min-h-[32px] flex items-center"
    >
      {value}
    </div>
  );
};

