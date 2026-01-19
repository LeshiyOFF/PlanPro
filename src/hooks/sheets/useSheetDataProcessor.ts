import { useState, useMemo, useCallback } from 'react';
import { ISortRule, IFilterRule, SortDirection } from '@/domain/sheets/interfaces/IDataProcessing';
import { SheetDataProcessorService } from '@/domain/sheets/services/SheetDataProcessorService';

/**
 * Хук для управления обработкой данных (сортировка, фильтрация).
 */
export const useSheetDataProcessor = <T>(initialData: T[]) => {
  const [sortRules, setSortRules] = useState<ISortRule[]>([]);
  const [filterRules, setFilterRules] = useState<IFilterRule[]>([]);
  
  const processor = useMemo(() => new SheetDataProcessorService(), []);

  const processedData = useMemo(() => {
    let result = processor.filter(initialData, filterRules);
    result = processor.sort(result, sortRules);
    return result;
  }, [initialData, sortRules, filterRules, processor]);

  const toggleSort = useCallback((columnId: string, multiSort: boolean) => {
    setSortRules(prev => {
      const existingRule = prev.find(r => r.columnId === columnId);
      let nextDirection = SortDirection.ASC;

      if (existingRule) {
        if (existingRule.direction === SortDirection.ASC) nextDirection = SortDirection.DESC;
        else if (existingRule.direction === SortDirection.DESC) nextDirection = SortDirection.NONE;
      }

      const otherRules = multiSort ? prev.filter(r => r.columnId !== columnId) : [];
      
      if (nextDirection === SortDirection.NONE) return otherRules;

      return [...otherRules, { 
        columnId, 
        direction: nextDirection, 
        priority: multiSort ? prev.length : 0 
      }];
    });
  }, []);

  const setFilter = useCallback((columnId: string, operator: any, value: any) => {
    setFilterRules(prev => {
      const filtered = prev.filter(r => r.columnId !== columnId);
      if (value === '' || value === null || value === undefined) return filtered;
      return [...filtered, { columnId, operator, value }];
    });
  }, []);

  return {
    processedData,
    sortRules,
    filterRules,
    toggleSort,
    setFilter
  };
};

