import { ReactNode } from 'react';
import { CellValue } from '@/types/sheet/CellValueTypes';
import type { JsonValue } from '@/types/json-types';

/**
 * Типы данных ячеек таблицы
 */
export enum SheetColumnType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  SELECT = 'select',
  PERCENT = 'percent',
  DURATION = 'duration',
  WBS = 'wbs'
}

/**
 * Опция выбора для колонки SELECT
 */
export interface SheetColumnOption {
  label: string;
  value: CellValue;
}

/**
 * Интерфейс конфигурации колонки профессиональной таблицы.
 */
export interface ISheetColumn<T = Record<string, JsonValue>> {
  id: string;
  field: keyof T | string;
  title: string;
  width: number;
  type: SheetColumnType;
  editable: boolean | ((row: T) => boolean);
  visible: boolean;
  sortable: boolean;
  resizable: boolean;
  formatter?: (value: CellValue, row: T) => ReactNode;
  options?: SheetColumnOption[];
  group?: string;
  tooltip?: string;
  valueGetter?: (row: T) => CellValue;
  onCustomEdit?: (row: T, columnId: string) => void;
}
