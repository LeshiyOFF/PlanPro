import { ISortRule, SortDirection, IFilterRule, FilterOperator } from '../interfaces/IDataProcessing';
import { ISheetColumn } from '../interfaces/ISheetColumn';
import { SheetValueService } from './SheetValueService';

/**
 * Сервис для обработки данных таблицы (сортировка и фильтрация).
 * Соответствует принципу Single Responsibility.
 */
export class SheetDataProcessorService {
  /**
   * Применяет правила сортировки к данным.
   */
  public sort<T>(data: T[], rules: ISortRule[], columns: ISheetColumn<T>[]): T[] {
    if (rules.length === 0) return [...data];

    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

    return [...data].sort((a, b) => {
      for (const rule of sortedRules) {
        if (rule.direction === SortDirection.NONE) continue;

        const column = columns.find(c => c.field === rule.columnId || c.id === rule.columnId);
        if (!column) continue;

        const valA = SheetValueService.getSortableValue(a, column);
        const valB = SheetValueService.getSortableValue(b, column);

        if (valA === valB) continue;

        const comparison = valA > valB ? 1 : -1;
        return rule.direction === SortDirection.ASC ? comparison : -comparison;
      }
      return 0;
    });
  }

  /**
   * Применяет правила фильтрации к данным.
   */
  public filter<T>(data: T[], rules: IFilterRule[], columns: ISheetColumn<T>[]): T[] {
    if (rules.length === 0) return data;

    return data.filter(item => {
      return rules.every(rule => this.matchesRule(item, rule, columns));
    });
  }

  private matchesRule(item: any, rule: IFilterRule, columns: ISheetColumn[]): boolean {
    const column = columns.find(c => c.field === rule.columnId || c.id === rule.columnId);
    if (!column) return true;

    const displayValue = SheetValueService.getFilterableValue(item, column).toLowerCase();
    const filterValue = String(rule.value).toLowerCase();

    // Если фильтр пустой - совпадает
    if (filterValue === '') return true;

    switch (rule.operator) {
      case FilterOperator.CONTAINS:
        return displayValue.includes(filterValue);
      case FilterOperator.EQUALS:
        return displayValue === filterValue;
      case FilterOperator.STARTS_WITH:
        return displayValue.startsWith(filterValue);
      default:
        return true;
    }
  }
}


