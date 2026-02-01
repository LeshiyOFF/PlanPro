/**
 * Типизированные интерфейсы для DataTable компонента
 * Полностью Generic подход без any
 */

import { ReactNode } from 'react'
import type { JsonValue } from '../json-types'

/**
 * Базовый тип данных для таблицы
 * Требует наличия уникального идентификатора
 */
export interface ITableRowData {
  readonly id: string | number;
  [key: string]: JsonValue | undefined;
}

/**
 * Определение колонки таблицы
 */
export interface ITableColumn<TData extends ITableRowData> {
  readonly key: keyof TData;
  readonly title: string;
  readonly sortable?: boolean;
  readonly width?: string;
  readonly align?: 'left' | 'center' | 'right';
  readonly render?: (value: TData[keyof TData], row: TData, index: number) => ReactNode;
}

/**
 * Направление сортировки
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Состояние сортировки
 */
export interface ISortState<TData extends ITableRowData> {
  readonly column: keyof TData;
  readonly direction: SortDirection;
}

/**
 * Данные пагинации
 */
export interface IPaginationData {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly totalItems: number;
  readonly itemsPerPage: number;
}

/**
 * Размер таблицы
 */
export type TableSize = 'sm' | 'md' | 'lg';

/**
 * Колбэки таблицы
 */
export interface IDataTableCallbacks<TData extends ITableRowData> {
  readonly onRowSelect?: (rowIds: ReadonlyArray<string | number>) => void;
  readonly onSort?: (column: keyof TData, direction: SortDirection) => void;
  readonly onPageChange?: (page: number) => void;
  readonly onRowClick?: (row: TData, index: number) => void;
  readonly onRowDoubleClick?: (row: TData, index: number) => void;
}

/**
 * Конфигурация таблицы
 */
export interface IDataTableConfig {
  readonly loading: boolean;
  readonly selectable: boolean;
  readonly size: TableSize;
  readonly emptyMessage: string;
  readonly showPagination: boolean;
}

/**
 * Состояние выбора строк
 */
export interface ISelectionState {
  readonly selectedIds: ReadonlyArray<string | number>;
  readonly isAllSelected: boolean;
}

/**
 * Пропсы для DataTable
 */
export interface IDataTableProps<TData extends ITableRowData>
  extends IDataTableCallbacks<TData> {
  readonly data: ReadonlyArray<TData>;
  readonly columns: ReadonlyArray<ITableColumn<TData>>;
  readonly pagination?: IPaginationData;
  readonly selectedRows?: ReadonlyArray<string | number>;
  readonly config?: Partial<IDataTableConfig>;
  readonly className?: string;
  readonly testId?: string;
}

/**
 * Результат рендеринга ячейки
 */
export type CellRenderResult = ReactNode;

/**
 * Функция рендеринга ячейки
 */
export type CellRenderer<TData extends ITableRowData> = (
  value: TData[keyof TData],
  row: TData,
  index: number
) => CellRenderResult;
