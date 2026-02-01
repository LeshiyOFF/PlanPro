import { ISheetColumn, SheetColumnType } from '../interfaces/ISheetColumn';
import { formatDate } from '@/utils/formatUtils';
import { CellValue, isDurationValue } from '@/types/sheet/CellValueTypes';
import { ReactNode } from 'react';
import type { JsonValue } from '@/types/json-types';
import type { JsonValue } from '@/types/json-types';

/**
 * Типы для внутренних операций сервиса
 */
type RowData = Record<string, JsonValue>;

/**
 * Сервис для извлечения и форматирования значений ячеек.
 */
export class SheetValueService {
  public static getFilterableValue<T extends RowData>(
    item: T,
    column: ISheetColumn<T>
  ): string {
    const rawValue = column.valueGetter
      ? column.valueGetter(item)
      : (item[column.field as string] as CellValue);

    if (rawValue === null || rawValue === undefined) return '';

    let displayText = '';

    if (column.formatter) {
      try {
        const formatted = column.formatter(rawValue, item);
        displayText = this.extractTextFromFormatted(formatted);
      } catch (e) {
        console.warn(`Filtering: Failed to format value for column ${column.id}`, e);
        displayText = String(rawValue);
      }
    } else {
      displayText = this.formatValueByType(rawValue, column as ISheetColumn<RowData>);
    }

    const normalized = displayText.replace(/[\u00a0\s]+/g, ' ').trim();

    if (
      column.type === SheetColumnType.NUMBER ||
      column.type === SheetColumnType.PERCENT ||
      column.type === SheetColumnType.DURATION
    ) {
      const pureNumber = String(rawValue).replace(/[^\d.,]/g, '');
      return `${normalized} | ${pureNumber}`;
    }

    return normalized;
  }

  public static getSortableValue<T extends RowData>(
    item: T,
    column: ISheetColumn<T>
  ): string | number {
    const value = column.valueGetter
      ? column.valueGetter(item)
      : (item[column.field as string] as CellValue);

    if (value === null || value === undefined) {
      return column.type === SheetColumnType.NUMBER ||
        column.type === SheetColumnType.PERCENT ||
        column.type === SheetColumnType.DURATION
        ? -Infinity
        : '';
    }

    switch (column.type) {
      case SheetColumnType.DATE:
        return value instanceof Date ? value.getTime() : new Date(value as string).getTime();
      case SheetColumnType.NUMBER:
      case SheetColumnType.PERCENT:
        return Number(value);
      case SheetColumnType.DURATION:
        if (isDurationValue(value)) {
          return value.value;
        }
        return Number(value);
      default:
        return String(value).toLowerCase();
    }
  }

  private static formatValueByType(value: CellValue, column: ISheetColumn<RowData>): string {
    switch (column.type) {
      case SheetColumnType.DATE:
        return value != null ? formatDate(value as string | number | Date) : '';
      case SheetColumnType.PERCENT:
        return `${Math.round((Number(value) || 0) * 100)}%`;
      case SheetColumnType.SELECT:
        if (column.options) {
          const option = column.options.find((o) => o.value === value);
          return option ? option.label : String(value);
        }
        return String(value);
      default:
        return String(value);
    }
  }

  private static extractTextFromFormatted(value: ReactNode): string {
    if (value === null || value === undefined || typeof value === 'boolean') return '';
    if (typeof value === 'string' || typeof value === 'number') return String(value);

    if (Array.isArray(value)) {
      return value.map((v) => this.extractTextFromFormatted(v)).join('');
    }

    if (
      value &&
      typeof value === 'object' &&
      'props' in value &&
      value.props &&
      typeof value.props === 'object' &&
      'children' in value.props
    ) {
      return this.extractTextFromFormatted((value.props as { children?: ReactNode }).children);
    }

    return String(value);
  }
}
