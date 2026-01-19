import { ReactNode } from 'react';

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
 * Интерфейс конфигурации колонки профессиональной таблицы
 * Stage 7.19: editable теперь поддерживает функцию-предикат для условного редактирования
 */
export interface ISheetColumn<T = any> {
  id: string;
  field: keyof T | string;
  title: string;
  width: number;
  type: SheetColumnType;
  // Stage 7.19: editable может быть boolean или функцией для условной логики
  editable: boolean | ((row: T) => boolean);
  visible: boolean;
  sortable: boolean;
  resizable: boolean;
  
  // Кастомный рендерер для режима просмотра
  formatter?: (value: any, row: T) => ReactNode;
  
  // Опции для типа SELECT
  options?: Array<{ label: string; value: any }>;
  
  // Группировка
  group?: string;
}


