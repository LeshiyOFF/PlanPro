/**
 * Направление сортировки
 */
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
  NONE = 'none'
}

/**
 * Определение правила сортировки
 */
export interface ISortRule {
  columnId: string;
  direction: SortDirection;
  priority: number;
}

/**
 * Типы фильтрации
 */
export enum FilterOperator {
  CONTAINS = 'contains',
  EQUALS = 'equals',
  STARTS_WITH = 'starts_with',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  BETWEEN = 'between'
}

/**
 * Определение правила фильтрации
 */
export interface IFilterRule {
  columnId: string;
  operator: FilterOperator;
  value: any;
}

/**
 * Результат обработки данных (сортировка + фильтрация)
 */
export interface IDataProcessorResult<T> {
  processedData: T[];
  activeSortRules: ISortRule[];
  activeFilterRules: IFilterRule[];
}


