import { ViewMode } from 'gantt-task-react';
import i18next from 'i18next';
import { CalendarDateService } from '@/services/CalendarDateService';

/**
 * TimelineFormatService - Сервис для профессионального форматирования временной шкалы.
 * Обеспечивает адаптивное отображение меток в зависимости от ширины колонки и масштаба.
 */
export class TimelineFormatService {
  /**
   * Возвращает форматированную строку для верхней части заголовка (Месяц/Год)
   */
  public static formatTopHeader(date: Date, viewMode: ViewMode, columnWidth: number): string {
    const locale = i18next.language === 'ru' ? 'ru-RU' : 'en-US';
    
    if (viewMode === ViewMode.Month) {
      return date.toLocaleDateString(locale, { year: 'numeric' });
    }

    if (columnWidth < 50) {
      return date.toLocaleDateString(locale, { month: 'short', year: '2-digit' });
    }

    return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  }

  /**
   * Возвращает форматированную строку для нижней части заголовка (День/Неделя)
   */
  public static formatBottomHeader(date: Date, viewMode: ViewMode, columnWidth: number): string {
    const locale = i18next.language === 'ru' ? 'ru-RU' : 'en-US';

    switch (viewMode) {
      case ViewMode.Day:
        if (columnWidth < 30) return date.getDate().toString();
        if (columnWidth < 60) return date.toLocaleDateString(locale, { day: 'numeric', weekday: 'short' }).split(' ')[0];
        return date.toLocaleDateString(locale, { day: 'numeric', weekday: 'short' });

      case ViewMode.Week:
        const weekNumber = this.getWeekNumber(date);
        if (columnWidth < 40) return weekNumber.toString();
        if (columnWidth < 80) return `${i18next.t('units.weeks_short', { defaultValue: 'н.' })}${weekNumber}`;
        return `${i18next.t('units.weeks', { defaultValue: 'Нед.' })} ${weekNumber}`;

      case ViewMode.Month:
        if (columnWidth < 50) return date.toLocaleDateString(locale, { month: 'narrow' });
        if (columnWidth < 100) return date.toLocaleDateString(locale, { month: 'short' });
        return date.toLocaleDateString(locale, { month: 'long' });

      default:
        return date.getDate().toString();
    }
  }

  /**
   * Вычисляет номер недели в году (ISO-8601)
   */
  private static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * Генерирует интервалы для заголовка на основе задач и режима отображения.
   * Синхронизировано с библиотекой gantt-task-react: явно имитируем её логику
   * preStepsCount=1, чтобы заголовок идеально совпал с сеткой Ганта.
   */
  public static generateIntervals(startDate: Date, endDate: Date, viewMode: ViewMode) {
    const intervals: Date[] = [];
    let current = CalendarDateService.toLocalMidnight(new Date(startDate));

    // Имитация preStepsCount=1 библиотеки gantt-task-react
    if (viewMode === ViewMode.Day) {
      current.setDate(current.getDate() - 1);
    } else if (viewMode === ViewMode.Week) {
      current.setDate(current.getDate() - 7);
    } else if (viewMode === ViewMode.Month) {
      current.setMonth(current.getMonth() - 1);
    } else if (viewMode === ViewMode.Year) {
      current.setFullYear(current.getFullYear() - 1);
    } else if (viewMode === ViewMode.Hour) {
      current.setHours(current.getHours() - 1);
    }

    // Генерируем интервалы до конечной даты
    while (current <= endDate) {
      intervals.push(new Date(current));
      
      if (viewMode === ViewMode.Day) {
        current.setDate(current.getDate() + 1);
      } else if (viewMode === ViewMode.Week) {
        current.setDate(current.getDate() + 7);
      } else if (viewMode === ViewMode.Month) {
        current.setMonth(current.getMonth() + 1);
      } else if (viewMode === ViewMode.Year) {
        current.setFullYear(current.getFullYear() + 1);
      } else if (viewMode === ViewMode.Hour) {
        current.setHours(current.getHours() + 1);
      } else {
        current.setDate(current.getDate() + 1);
      }
    }

    return intervals;
  }
}
