/**
 * Organism DataTable - таблица данных с пагинацией и действиями
 * Следует SOLID принципам и Atomic Design
 */

import React, { useState, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { AtomBadge, AtomButton } from '../atoms';
import { Card, ButtonGroup } from '../molecules';
import { BaseAtomicProps } from '../atoms/types';

/**
 * Типы для DataTable
 */
export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

/**
 * Props для DataTable Organism
 */
export interface DataTableProps<T = any> extends BaseAtomicProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: PaginationData;
  selectable?: boolean;
  selectedRows?: number[];
  onRowSelect?: (rowIds: number[]) => void;
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T, index: number) => void;
  emptyMessage?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * DataTable (Organism)
 * Сложный компонент таблицы с множеством функций
 */
export const DataTable = <T extends Record<string, any>>({
  className = '',
  data,
  columns,
  loading = false,
  pagination,
  selectable = false,
  selectedRows = [],
  onRowSelect,
  onSort,
  onPageChange,
  onRowClick,
  emptyMessage = 'No data available',
  size = 'md',
  testId
}: DataTableProps<T>) => {
  const [localSelected, setLocalSelected] = useState<number[]>(selectedRows);

  const handleRowSelect = useCallback((rowIndex: number) => {
    const newSelection = localSelected.includes(rowIndex)
      ? localSelected.filter(i => i !== rowIndex)
      : [...localSelected, rowIndex];
    
    setLocalSelected(newSelection);
    onRowSelect?.(newSelection);
  }, [localSelected, onRowSelect]);

  const handleSelectAll = useCallback(() => {
    if (localSelected.length === data.length) {
      setLocalSelected([]);
      onRowSelect?.([]);
    } else {
      setLocalSelected(data.map((_, index) => index));
      onRowSelect?.(data.map((_, index) => index));
    }
  }, [localSelected.length, data, onRowSelect]);

  const handleSort = useCallback((column: TableColumn<T>) => {
    if (column.sortable && onSort) {
      const direction = 'asc'; // Здесь можно хранить состояние сортировки
      onSort(column.key, direction);
    }
  }, [onSort]);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)} data-testid={testId}>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {selectable && (
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={localSelected.length === data.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary focus:ring-blue-500"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      'px-4 py-3 text-left font-medium text-gray-700',
                      sizeClasses[size],
                      column.sortable && 'cursor-pointer hover:bg-gray-100'
                    )}
                    style={{ width: column.width }}
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center">
                      {column.title}
                      {column.sortable && (
                        <span className="ml-1 text-gray-400">⇅</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    'hover:bg-gray-50 transition-colors cursor-pointer',
                    localSelected.includes(rowIndex) && 'bg-primary/10'
                  )}
                  onClick={() => onRowClick?.(row, rowIndex)}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={localSelected.includes(rowIndex)}
                        onChange={() => handleRowSelect(rowIndex)}
                        className="rounded border-gray-300 text-primary focus:ring-blue-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={String(column.key)} className={cn('px-4 py-3', sizeClasses[size])}>
                      {column.render ? 
                        column.render(row[column.key], row, rowIndex) : 
                        String(row[column.key] || '')
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {pagination.currentPage * pagination.itemsPerPage - pagination.itemsPerPage + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} results
              </div>
              
              <ButtonGroup
                buttons={[
                  {
                    id: 'prev',
                    children: 'Previous',
                    color: 'secondary',
                    disabled: pagination.currentPage === 1,
                    onClick: () => onPageChange?.(pagination.currentPage - 1)
                  },
                  {
                    id: 'next',
                    children: 'Next',
                    color: 'secondary',
                    disabled: pagination.currentPage === pagination.totalPages,
                    onClick: () => onPageChange?.(pagination.currentPage + 1)
                  }
                ]}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

