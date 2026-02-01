/**
 * Типы значений ячеек таблицы.
 * Заменяет использование `any` для value в Sheet компонентах.
 */

/**
 * Примитивные типы значений ячейки
 */
export type CellValuePrimitive = string | number | Date | boolean | null;

/**
 * Объект длительности для DURATION полей
 */
export interface DurationValue {
  value: number;
  unit: 'days' | 'hours' | 'minutes';
  formatted: string;
}

/**
 * Объект WBS кода для иерархических структур
 */
export interface WbsValue {
  code: string;
  level: number;
  display: string;
}

/**
 * Комплексное значение ячейки
 */
export type CellValueComplex = DurationValue | WbsValue;

/**
 * Полный тип значения ячейки
 */
export type CellValue = CellValuePrimitive | CellValueComplex;

/**
 * Type guard для проверки DurationValue
 */
export function isDurationValue(value: unknown): value is DurationValue {
  return (
    value !== null &&
    typeof value === 'object' &&
    'value' in value &&
    'unit' in value &&
    typeof (value as DurationValue).value === 'number' &&
    ['days', 'hours', 'minutes'].includes((value as DurationValue).unit)
  );
}

/**
 * Type guard для проверки WbsValue
 */
export function isWbsValue(value: unknown): value is WbsValue {
  return (
    value !== null &&
    typeof value === 'object' &&
    'code' in value &&
    'level' in value &&
    typeof (value as WbsValue).code === 'string' &&
    typeof (value as WbsValue).level === 'number'
  );
}

/**
 * Type guard для примитивного значения
 */
export function isPrimitiveValue(value: unknown): value is CellValuePrimitive {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value instanceof Date
  );
}
