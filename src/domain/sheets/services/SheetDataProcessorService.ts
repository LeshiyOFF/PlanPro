import { ISortRule, SortDirection, IFilterRule, FilterOperator } from '../interfaces/IDataProcessing';

/**
 * Сервис для обработки данных таблицы (сортировка и фильтрация).
 * Соответствует принципу Single Responsibility.
 */
export class SheetDataProcessorService {
  /**
   * Применяет правила сортировки к данным.
   */
  public sort<T>(data: T[], rules: ISortRule[]): T[] {
    if (rules.length === 0) return [...data];

    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

    return [...data].sort((a, b) => {
      for (const rule of sortedRules) {
        if (rule.direction === SortDirection.NONE) continue;

        const valA = (a as any)[rule.columnId];
        const valB = (b as any)[rule.columnId];

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
  public filter<T>(data: T[], rules: IFilterRule[]): T[] {
    if (rules.length === 0) return data;

    return data.filter(item => {
      return rules.every(rule => this.matchesRule(item, rule));
    });
  }

  private matchesRule(item: any, rule: IFilterRule): boolean {
    const value = item[rule.columnId];
    const filterValue = rule.value;

    switch (rule.operator) {
      case FilterOperator.CONTAINS:
        return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
      case FilterOperator.EQUALS:
        return value === filterValue;
      case FilterOperator.STARTS_WITH:
        return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
      case FilterOperator.GREATER_THAN:
        return value > filterValue;
      case FilterOperator.LESS_THAN:
        return value < filterValue;
      default:
        return true;
    }
  }
}


