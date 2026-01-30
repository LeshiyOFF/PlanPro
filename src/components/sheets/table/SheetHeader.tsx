import React from 'react';
import { ISheetColumn } from '@/domain/sheets/interfaces/ISheetColumn';
import { ISortRule, SortDirection } from '@/domain/sheets/interfaces/IDataProcessing';
import { ArrowUp, ArrowDown, HelpCircle } from 'lucide-react';
import { SafeTooltip, TooltipProvider } from '@/components/ui/Tooltip';

interface SheetHeaderProps {
  columns: ISheetColumn[];
  sortRules?: ISortRule[];
  onSort?: (columnId: string, multiSort: boolean) => void;
}

/**
 * Заголовок профессиональной таблицы
 */
export const SheetHeader: React.FC<SheetHeaderProps> = ({ 
  columns, 
  sortRules = [], 
  onSort 
}) => {
  const getSortIcon = (columnId: string) => {
    const rule = sortRules.find(r => r.columnId === columnId);
    if (!rule) return null;
    if (rule.direction === SortDirection.ASC) return <ArrowUp className="w-3 h-3 ml-1" />;
    if (rule.direction === SortDirection.DESC) return <ArrowDown className="w-3 h-3 ml-1" />;
    return null;
  };

  const handleHeaderClick = (e: React.MouseEvent, column: ISheetColumn) => {
    if (column.sortable && onSort) {
      onSort(column.field as string, e.ctrlKey || e.metaKey);
    }
  };

  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <TooltipProvider>
          {columns.map(column => (
            <th
              key={column.id}
              style={{ width: `${column.width}px` }}
              className={`px-1.5 py-1 text-left font-bold text-gray-500 border-r border-border/30 last:border-r-0 truncate transition-all uppercase text-[10px] tracking-wider group ${
                column.sortable ? 'cursor-pointer hover:bg-gray-100 hover:text-primary' : ''
              }`}
              title={column.tooltip ? undefined : column.title}
              onClick={(e) => handleHeaderClick(e, column)}
            >
              <div className="flex items-center">
                <span className="truncate">{column.title}</span>
                <div className="flex-shrink-0 min-w-[12px]">
                  {getSortIcon(column.field as string)}
                </div>
                {column.tooltip && (
                  <SafeTooltip content={column.tooltip} side="bottom">
                    <div className="ml-1 cursor-help text-slate-400 hover:text-primary transition-colors">
                      <HelpCircle className="w-3 h-3" />
                    </div>
                  </SafeTooltip>
                )}
              </div>
            </th>
          ))}
        </TooltipProvider>
      </tr>
    </thead>
  );
};


