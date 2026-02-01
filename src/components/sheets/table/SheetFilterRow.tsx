import React, { useState, useEffect } from 'react'
import { ISheetColumn } from '@/domain/sheets/interfaces/ISheetColumn'
import { FilterOperator } from '@/domain/sheets/interfaces/IDataProcessing'
import type { JsonValue } from '@/types/json-types'

/**
 * Значение фильтра
 */
export type FilterValue = string | number | Date | boolean | null;

interface SheetFilterRowProps {
  columns: ISheetColumn<Record<string, JsonValue>>[];
  onFilter: (columnId: string, operator: FilterOperator, value: FilterValue) => void;
}

/**
 * Строка фильтрации для профессиональной таблицы с поддержкой debounce.
 */
export const SheetFilterRow: React.FC<SheetFilterRowProps> = ({ columns, onFilter }) => {
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})

  const handleFilterChange = (columnId: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [columnId]: value }))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      Object.entries(filterValues).forEach(([id, val]) => {
        onFilter(id, FilterOperator.CONTAINS, val)
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [filterValues, onFilter])

  return (
    <tr className="bg-gray-50/50 border-b border-gray-100">
      {columns.map((column) => (
        <td
          key={`filter-${column.id}`}
          className="px-1 py-1 border-r border-gray-200 last:border-r-0"
        >
          <input
            type="text"
            value={filterValues[column.field] || ''}
            placeholder="Фильтр..."
            className="w-full px-2 py-0.5 text-[10px] border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary"
            onChange={(e) => handleFilterChange(column.field, e.target.value)}
          />
        </td>
      ))}
    </tr>
  )
}
