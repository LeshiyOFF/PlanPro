/**
 * Organism DataTable - таблица данных с пагинацией и действиями
 * Следует SOLID принципам и Atomic Design
 * Полностью типизированный Generic компонент без any
 */

import { useState, useCallback } from 'react'
import { cn } from '@/utils/cn'
import { Card, ButtonGroup } from '../molecules'
import {
  ITableRowData,
  ITableColumn,
  IDataTableProps,
  IDataTableConfig,
  SortDirection,
  TableSize,
} from '@/types/table/IDataTableTypes'

export interface DataTableProps<TData extends ITableRowData> extends IDataTableProps<TData> {
  readonly size?: TableSize;
}

/**
 * DataTable (Organism)
 * Сложный компонент таблицы с множеством функций
 * Generic параметр TData обеспечивает полную типизацию
 */
export const DataTable = <TData extends ITableRowData>({
  className = '',
  data,
  columns,
  pagination,
  selectedRows = [],
  onRowSelect,
  onSort,
  onPageChange,
  onRowClick,
  onRowDoubleClick,
  config,
  size,
  testId,
}: DataTableProps<TData>) => {
  const mergedConfig: IDataTableConfig = {
    loading: config?.loading ?? false,
    selectable: config?.selectable ?? false,
    size: size ?? config?.size ?? 'md',
    emptyMessage: config?.emptyMessage ?? 'Нет данных для отображения',
    showPagination: config?.showPagination ?? true,
  }

  const [localSelected, setLocalSelected] = useState<ReadonlyArray<string | number>>(selectedRows)

  const handleRowSelect = useCallback((rowId: string | number) => {
    const newSelection = localSelected.includes(rowId)
      ? localSelected.filter(id => id !== rowId)
      : [...localSelected, rowId]

    setLocalSelected(newSelection)
    onRowSelect?.(newSelection)
  }, [localSelected, onRowSelect])

  const handleSelectAll = useCallback(() => {
    if (localSelected.length === data.length) {
      setLocalSelected([])
      onRowSelect?.([])
    } else {
      const allIds = data.map(row => row.id)
      setLocalSelected(allIds)
      onRowSelect?.(allIds)
    }
  }, [localSelected.length, data, onRowSelect])

  const handleSort = useCallback((column: ITableColumn<TData>) => {
    if (column.sortable !== false && onSort) {
      const direction: SortDirection = 'asc'
      onSort(column.key, direction)
    }
  }, [onSort])

  const sizeClasses: Record<TableSize, string> = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  if (mergedConfig.loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-slate-600">Загрузка...</span>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        {mergedConfig.emptyMessage}
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)} data-testid={testId}>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {mergedConfig.selectable && (
                  <th className="px-4 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={localSelected.length === data.length && data.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      'px-4 py-3 text-left font-semibold text-slate-700 uppercase tracking-wide',
                      sizeClasses[mergedConfig.size],
                      column.sortable && 'cursor-pointer hover:bg-slate-100 transition-colors',
                    )}
                    style={{ width: column.width }}
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.title}</span>
                      {column.sortable && (
                        <span className="text-slate-400 text-xs">⇅</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {data.map((row, rowIndex) => {
                const isSelected = localSelected.includes(row.id)
                return (
                  <tr
                    key={String(row.id)}
                    className={cn(
                      'hover:bg-slate-50 transition-colors cursor-pointer',
                      isSelected && 'bg-primary/10',
                    )}
                    onClick={() => onRowClick?.(row, rowIndex)}
                    onDoubleClick={() => onRowDoubleClick?.(row, rowIndex)}
                  >
                    {mergedConfig.selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleRowSelect(row.id)}
                          className="rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={cn(
                          'px-4 py-3 text-slate-700',
                          sizeClasses[mergedConfig.size],
                        )}
                      >
                        {column.render ?
                          column.render(row[column.key], row, rowIndex) :
                          String(row[column.key] ?? '')
                        }
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {mergedConfig.showPagination && pagination && (
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-600 font-medium">
                Показано {pagination.currentPage * pagination.itemsPerPage - pagination.itemsPerPage + 1}-
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} из{' '}
                {pagination.totalItems} записей
              </div>

              <ButtonGroup
                buttons={[
                  {
                    id: 'prev',
                    children: 'Назад',
                    color: 'secondary',
                    disabled: pagination.currentPage === 1,
                    onClick: () => onPageChange?.(pagination.currentPage - 1),
                  },
                  {
                    id: 'next',
                    children: 'Вперед',
                    color: 'secondary',
                    disabled: pagination.currentPage === pagination.totalPages,
                    onClick: () => onPageChange?.(pagination.currentPage + 1),
                  },
                ]}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

