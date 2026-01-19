/**
 * Результат группировки
 */
export interface IGroupResult<T> {
  key: string;
  value: any;
  items: T[];
  isExpanded: boolean;
}

/**
 * Сервис для группировки данных.
 */
export class SheetGroupingService {
  /**
   * Группирует плоский список по заданному полю.
   */
  public groupBy<T>(data: T[], field: string): IGroupResult<T>[] {
    if (!field) return [];

    const groups = new Map<any, T[]>();

    data.forEach(item => {
      const val = (item as any)[field];
      if (!groups.has(val)) {
        groups.set(val, []);
      }
      groups.get(val)!.push(item);
    });

    return Array.from(groups.entries()).map(([key, items]) => ({
      key: `${field}-${key}`,
      value: key,
      items,
      isExpanded: true
    }));
  }
}

