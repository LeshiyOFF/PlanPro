import { ISortRule, SortDirection, IFilterRule, FilterOperator } from '../interfaces/IDataProcessing';
import { ISheetColumn } from '../interfaces/ISheetColumn';
import { SheetValueService } from './SheetValueService';
import type { JsonValue } from '@/types/json-types';
import type { JsonValue } from '@/types/json-types';

type RowData = Record<string, JsonValue>;

/**
 * Сервис для обработки данных таблицы (сортировка и фильтрация).
 * Соответствует принципу Single Responsibility.
 */
export class SheetDataProcessorService {
  public sort<T extends RowData>(data: T[], rules: ISortRule[], columns: ISheetColumn<T>[]): T[] {
    if (rules.length === 0) return [...data];

    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

    return [...data].sort((a, b) => {
      for (const rule of sortedRules) {
        if (rule.direction === SortDirection.NONE) continue;

        const column = columns.find((c) => c.field === rule.columnId || c.id === rule.columnId);
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

  public filter<T extends RowData>(data: T[], rules: IFilterRule[], columns: ISheetColumn<T>[]): T[] {
    if (rules.length === 0) return data;

    return data.filter((item) => {
      return rules.every((rule) => this.matchesRule(item, rule, columns));
    });
  }

  private matchesRule<T extends RowData>(
    item: T,
    rule: IFilterRule,
    columns: ISheetColumn<T>[]
  ): boolean {
    const column = columns.find((c) => c.field === rule.columnId || c.id === rule.columnId);
    if (!column) return true;

    const displayValue = SheetValueService.getFilterableValue(item, column).toLowerCase();
    const filterValue = String(rule.value).toLowerCase();

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
