import { ReactNode } from 'react';
import { ISheetColumn } from '@/domain/sheets/interfaces/ISheetColumn';
import { CellValue } from '@/types/sheet/CellValueTypes';
import type { JsonValue } from '@/types/json-types';

/**
 * Handle для внешнего управления таблицей
 */
export interface ProfessionalSheetHandle {
  exportToCSV: (filename?: string) => Promise<Blob>;
}

/**
 * Пропсы для универсального движка таблиц
 */
export interface ProfessionalSheetProps<T extends Record<string, JsonValue>> {
  data: T[];
  columns: ISheetColumn<T>[];
  rowIdField: keyof T;
  onDataChange?: (rowId: string, field: string, value: CellValue) => void;
  onBatchChange?: (rowIds: string[], field: string, value: CellValue) => void;
  onContextMenu?: (event: React.MouseEvent, row: T, columnId?: string) => void;
  onRowSelect?: (row: T) => void;
  onDeleteRows?: (rowIds: string[]) => void;
  disabledRowIds?: string[];
  className?: string;
}

/**
 * Извлечение чистого текста из React-элементов
 */
export function extractTextFromFormatted(value: ReactNode): string {
  if (value === null || value === undefined || typeof value === 'boolean') return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);

  if (Array.isArray(value)) {
    return value.map(extractTextFromFormatted).join('');
  }

  if (
    value &&
    typeof value === 'object' &&
    'props' in value &&
    value.props &&
    typeof value.props === 'object' &&
    'children' in value.props
  ) {
    return extractTextFromFormatted((value.props as { children?: ReactNode }).children);
  }

  return String(value);
}
