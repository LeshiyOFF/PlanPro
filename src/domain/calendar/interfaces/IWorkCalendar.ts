/**
 * Интерфейсы для системы рабочих календарей
 * Реализует логику графиков работы ресурсов (5/2, 2/2, 3/1, вахты и т.д.)
 * Stage 8.15: Эталонная реализация календарной системы
 */

/**
 * Рабочий день недели
 */
export interface IWorkingDay {
  /** День недели (0 = Воскресенье, 1 = Понедельник, ..., 6 = Суббота) */
  dayOfWeek: number;
  
  /** Является ли день рабочим */
  isWorking: boolean;
  
  /** Рабочие часы в этот день (если рабочий) */
  workingHours?: {
    start: string; // Формат "HH:mm" (например, "09:00")
    end: string;   // Формат "HH:mm" (например, "18:00")
    breakStart?: string; // Перерыв (опционально)
    breakEnd?: string;
  };
}

import { CalendarException } from '@/types/calendar-types';

/**
 * Исключение (Exception) в календаре
 * Используется для праздников, отпусков, особых дат
 * Реэкспорт унифицированного типа для domain-слоя
 */
export type ICalendarException = CalendarException;

/**
 * Рабочий календарь
 */
export interface IWorkCalendar {
  /** Уникальный идентификатор */
  id: string;
  
  /** Название календаря */
  name: string;
  
  /** Описание/комментарий */
  description?: string;
  
  /** Шаблон графика (для быстрого определения типа) */
  templateType: CalendarTemplateType;
  
  /** Рабочие дни недели (базовое расписание) */
  workingDays: IWorkingDay[];
  
  /** Исключения (праздники, отпуска, особые даты) */
  exceptions: ICalendarException[];
  
  /** Часов в рабочем дне (по умолчанию) */
  hoursPerDay: number;
  
  /** Рабочих дней в неделе (средняя, для статистики) */
  workingDaysPerWeek: number;
  
  /** Является ли базовым (нельзя удалить) */
  isBase: boolean;
  
  /** Дата создания */
  createdAt: Date;
  
  /** Последнее изменение */
  updatedAt: Date;
}

/**
 * Типы шаблонов календарей
 */
export enum CalendarTemplateType {
  /** Стандартный офис: 5/2, 8ч/дн, Пн-Пт */
  STANDARD = 'standard',
  
  /** Круглосуточная работа: 24/7 */
  TWENTY_FOUR_SEVEN = '24_7',
  
  /** Ночная смена: 5/2, 8ч ночи */
  NIGHT_SHIFT = 'night_shift',
  
  /** График 2 через 2 */
  TWO_TWO = '2_2',
  
  /** График 3 через 1 */
  THREE_ONE = '3_1',
  
  /** График 4 через 3 */
  FOUR_THREE = '4_3',
  
  /** Вахта 15 через 15 */
  SHIFT_FIFTEEN = '15_15',
  
  /** Вахта 30 через 30 */
  SHIFT_THIRTY = '30_30',
  
  /** Шестидневка: 6/1, Вс выходной */
  SIX_DAYS = '6_1',
  
  /** Пользовательский (созданный вручную) */
  CUSTOM = 'custom'
}

/**
 * Шаблон для быстрого создания календарей
 */
export interface ICalendarTemplate {
  type: CalendarTemplateType;
  name: string;
  description: string;
  shortDescription: string; // Краткое описание для списка (например, "8ч/дн, 5/2")
  hoursPerDay: number;
  workingDaysPerWeek: number;
  workingDays: IWorkingDay[];
  defaultWorkTime: {
    start: string;
    end: string;
  };
}
