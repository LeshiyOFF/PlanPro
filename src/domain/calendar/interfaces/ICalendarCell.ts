import { ICalendarEvent } from './ICalendarEvent';

/**
 * Интерфейс ячейки календаря (дня)
 */
export interface ICalendarCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  events: ICalendarEvent[];
}


