import { useState, useMemo, useCallback } from 'react'
import { ISortRule, IFilterRule, SortDirection, FilterOperator } from '@/domain/sheets/interfaces/IDataProcessing'
import { SheetDataProcessorService } from '@/domain/sheets/services/SheetDataProcessorService'
import { ISheetColumn } from '@/domain/sheets/interfaces/ISheetColumn'
import { CellValue } from '@/types/sheet/CellValueTypes'
import type { JsonValue } from '@/types/json-types'
import type { JsonValue } from '@/types/json-types'

/**
 * Хук для управления обработкой данных (сортировка, фильтрация).
 * Возвращает processedData того же типа T[].
 */
export const useSheetDataProcessor = <T extends Record<string, JsonValue>>(
  initialData: T[],
  columns: ISheetColumn<T>[],
) => {
  const [sortRules, setSortRules] = useState<ISortRule[]>([])
  const [filterRules, setFilterRules] = useState<IFilterRule[]>([])

  const processor = useMemo(() => new SheetDataProcessorService(), [])

  const processedData = useMemo((): T[] => {
    const filtered = processor.filter(initialData, filterRules, columns)
    return processor.sort(filtered, sortRules, columns)
  }, [initialData, sortRules, filterRules, processor, columns])

  const toggleSort = useCallback((columnId: string, multiSort: boolean) => {
    setSortRules(prev => {
      const existingRule = prev.find(r => r.columnId === columnId)
      let nextDirection = SortDirection.ASC

      if (existingRule) {
        if (existingRule.direction === SortDirection.ASC) nextDirection = SortDirection.DESC
        else if (existingRule.direction === SortDirection.DESC) nextDirection = SortDirection.NONE
      }

      const otherRules = multiSort ? prev.filter(r => r.columnId !== columnId) : []

      if (nextDirection === SortDirection.NONE) return otherRules

      return [...otherRules, {
        columnId,
        direction: nextDirection,
        priority: multiSort ? prev.length : 0,
      }]
    })
  }, [])

  const setFilter = useCallback((columnId: string, operator: FilterOperator, value: CellValue) => {
    setFilterRules(prev => {
      const filtered = prev.filter(r => r.columnId !== columnId)
      if (value === '' || value === null || value === undefined) return filtered
      return [...filtered, { columnId, operator, value }]
    })
  }, [])

  return {
    processedData,
    sortRules,
    filterRules,
    toggleSort,
    setFilter,
  }
}
