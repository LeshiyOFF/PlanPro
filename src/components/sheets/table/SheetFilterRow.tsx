import React from 'react';
import { ISheetColumn } from '@/domain/sheets/interfaces/ISheetColumn';
import { FilterOperator } from '@/domain/sheets/interfaces/IDataProcessing';

interface SheetFilterRowProps {
  columns: ISheetColumn[];
  onFilter: (columnId: string, operator: FilterOperator, value: any) => void;
}

/**
 * Строка фильтрации для профессиональной таблицы
 */
export const SheetFilterRow: React.FC<SheetFilterRowProps> = ({ columns, onFilter }) => {
  return (
    <tr className="bg-gray-50/50 border-b border-gray-100">
      {columns.map(column => (
        <td 
          key={`filter-${column.id}`} 
          className="px-1 py-1 border-r border-gray-200 last:border-r-0"
        >
          <input
            type="text"
            placeholder="Фильтр..."
            className="w-full px-2 py-0.5 text-[10px] border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary"
            onChange={(e) => onFilter(column.id, FilterOperator.CONTAINS, e.target.value)}
          />
        </td>
      ))}
    </tr>
  );
};


