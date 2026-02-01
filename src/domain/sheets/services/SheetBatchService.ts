import { CellValue } from '@/types/sheet/CellValueTypes';

/**
 * Интерфейс пакетной операции
 */
export interface IBatchUpdate {
  ids: string[];
  field: string;
  value: CellValue;
}

/**
 * Callback для обновления одного значения
 */
export type UpdateCallback = (id: string, field: string, value: CellValue) => void;

/**
 * Сервис для выполнения пакетных операций над данными таблицы.
 */
export class SheetBatchService {
  public applyUpdate(
    ids: string[],
    field: string,
    value: CellValue,
    onUpdate: UpdateCallback
  ): void {
    if (!ids || ids.length === 0) return;

    ids.forEach((id) => {
      onUpdate(id, field, value);
    });
  }

  public createBatchUpdate(ids: string[], field: string, value: CellValue): IBatchUpdate {
    return { ids, field, value };
  }
}
