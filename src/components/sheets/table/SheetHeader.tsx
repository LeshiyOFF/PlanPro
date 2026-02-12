import React from 'react'
import { useTranslation } from 'react-i18next'
import { ISheetColumn } from '@/domain/sheets/interfaces/ISheetColumn'
import { ISortRule, SortDirection } from '@/domain/sheets/interfaces/IDataProcessing'
import { ArrowUp, ArrowDown, Filter, HelpCircle } from 'lucide-react'
import { SafeTooltip, TooltipProvider } from '@/components/ui/tooltip'
import type { JsonValue } from '@/types/json-types'

interface SheetHeaderProps {
  columns: ISheetColumn<Record<string, JsonValue>>[];
  sortRules?: ISortRule[];
  onSort?: (columnId: string, multiSort: boolean) => void;
}

/** Ключ подсказки при наведении на иконку фильтра в заголовке колонки. */
const SORT_FILTER_HINT_KEY = 'sheets.header_sort_filter_hint'

/**
 * Заголовок профессиональной таблицы.
 * Для сортируемых колонок: одна иконка — воронка (нет сортировки), стрелка вверх (ASC) или вниз (DESC).
 * Цикл по клику: воронка → ASC → DESC → воронка.
 */
export const SheetHeader: React.FC<SheetHeaderProps> = ({
  columns,
  sortRules = [],
  onSort,
}) => {
  const { t } = useTranslation()

  const getSortOrFilterIcon = (columnId: string) => {
    const rule = sortRules.find(r => r.columnId === columnId)
    if (rule?.direction === SortDirection.ASC) return <ArrowUp className="w-3.5 h-3.5 shrink-0" />
    if (rule?.direction === SortDirection.DESC) return <ArrowDown className="w-3.5 h-3.5 shrink-0" />
    return <Filter className="w-3.5 h-3.5 shrink-0" />
  }

  const handleHeaderClick = (e: React.MouseEvent, column: ISheetColumn<Record<string, JsonValue>>) => {
    if (column.sortable && onSort) {
      onSort(column.field, e.ctrlKey || e.metaKey)
    }
  }

  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <TooltipProvider>
          {columns.map(column => (
            <th
              key={column.id}
              style={{ width: `${column.width}px` }}
              className={`px-1.5 py-1 text-left font-bold text-gray-500 border-r border-border/30 last:border-r-0 truncate transition-all duration-200 uppercase text-[10px] tracking-wider group ${
                column.sortable ? 'cursor-pointer hover:bg-gray-100 hover:text-primary hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]' : ''
              }`}
              title={column.tooltip ? undefined : column.title}
              onClick={(e) => handleHeaderClick(e, column)}
            >
              <div className="flex items-center gap-0.5 min-w-0">
                <span className="truncate">{column.title}</span>
                {column.sortable && (
                  <SafeTooltip content={t(SORT_FILTER_HINT_KEY, { defaultValue: 'Нажмите для сортировки и фильтра' })} side="bottom">
                    <span className="flex items-center shrink-0 min-w-[14px] justify-center text-slate-400 group-hover:text-primary transition-colors" aria-hidden>
                      {getSortOrFilterIcon(column.field)}
                    </span>
                  </SafeTooltip>
                )}
                {column.tooltip && (
                  <SafeTooltip content={column.tooltip} side="bottom">
                    <div className="ml-0.5 cursor-help text-slate-400 hover:text-primary transition-colors shrink-0">
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
  )
}


