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
 * Stage 7.19: editable поддерживает функцию-предикат для условного редактирования
 * Stage 8.20: onCustomEdit для кастомного редактирования (например, multi-select)
 */
export interface ISheetColumn<T = any> {
  id: string;
  field: keyof T | string;
  title: string;
  width: number;
  type: SheetColumnType;
  /** Редактируемость: boolean или функция-предикат */
  editable: boolean | ((row: T) => boolean);
  visible: boolean;
  sortable: boolean;
  resizable: boolean;
  
  /** Кастомный рендерер для режима просмотра */
  formatter?: (value: any, row: T) => ReactNode;
  
  /** Опции для типа SELECT */
  options?: Array<{ label: string; value: any }>;
  
  /** Группировка */
  group?: string;

  /** Подсказка при наведении на заголовок */
  tooltip?: string;

  /** Функция для получения значения (для вычисляемых полей) */
  valueGetter?: (row: T) => any;

  /** 
   * Callback для кастомного редактирования при двойном клике.
   * Если задан, вызывается вместо стандартного inline-редактирования.
   * Используется для сложных редакторов (multi-select, popup и т.д.)
   */
  onCustomEdit?: (row: T, columnId: string) => void;
}


