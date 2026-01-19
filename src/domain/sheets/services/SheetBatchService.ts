/**
 * Интерфейс пакетной операции
 */
export interface IBatchUpdate<T> {
  ids: string[];
  field: string;
  value: any;
}

/**
 * Сервис для выполнения пакетных операций над данными таблицы.
 */
export class SheetBatchService {
  /**
   * Применяет обновление к списку идентификаторов.
   */
  public applyUpdate<T>(
    ids: string[],
    field: string,
    value: any,
    onUpdate: (id: string, field: string, value: any) => void
  ): void {
    if (!ids || ids.length === 0) return;
    
    ids.forEach(id => {
      onUpdate(id, field, value);
    });
  }
}


