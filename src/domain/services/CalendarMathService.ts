import { Duration, CalendarPreferences } from '@/types/Master_Functionality_Catalog';
import { IWorkCalendar } from '@/domain/calendar/interfaces/IWorkCalendar';
import { CalendarTemplateService } from '@/domain/calendar/services/CalendarTemplateService';

/**
 * Сервис для выполнения расчетов, связанных с календарем и длительностью.
 * Внедряет параметры hoursPerDay, hoursPerWeek и daysPerMonth в математику планирования.
 * Stage 8.15: Расширен для работы с IWorkCalendar (индивидуальные графики ресурсов)
 * Следует принципам SOLID (SRP) и Clean Architecture.
 */
export class CalendarMathService {
  /**
   * Преобразует длительность из одних единиц в другие с учетом настроек календаря.
   * 
   * @param duration Исходная длительность
   * @param toUnit Целевые единицы измерения
   * @param prefs Настройки календаря
   * @returns Новая длительность в целевых единицах
   */
  public static convertDuration(
    duration: Duration,
    toUnit: Duration['unit'],
    prefs: CalendarPreferences
  ): Duration {
    if (duration.unit === toUnit) return duration;

    // Сначала переводим всё в базовую единицу - миллисекунды
    const ms = this.durationToMs(duration, prefs);
    
    // Затем переводим из миллисекунд в целевую единицу
    const newValue = this.msToUnit(ms, toUnit, prefs);

    return {
      value: newValue,
      unit: toUnit
    };
  }

  /**
   * Рассчитывает дату окончания на основе даты начала и длительности.
   */
  public static calculateFinishDate(
    startDate: Date,
    duration: Duration,
    prefs: CalendarPreferences
  ): Date {
    const ms = this.durationToMs(duration, prefs);
    return new Date(startDate.getTime() + ms);
  }

  /**
   * Рассчитывает длительность между двумя датами.
   */
  public static calculateDuration(
    startDate: Date,
    endDate: Date,
    unit: Duration['unit'],
    prefs: CalendarPreferences
  ): Duration {
    const ms = endDate.getTime() - startDate.getTime();
    const value = this.msToUnit(ms, unit, prefs);
    
    return {
      value,
      unit
    };
  }

  /**
   * Вспомогательный метод: перевод длительности в миллисекунды.
   */
  private static durationToMs(duration: Duration, prefs: CalendarPreferences): number {
    const { value, unit } = duration;
    const { hoursPerDay, hoursPerWeek, daysPerMonth } = prefs;

    switch (unit) {
      case 'milliseconds': return value;
      case 'seconds': return value * 1000;
      case 'minutes': return value * 60 * 1000;
      case 'hours': return value * 60 * 60 * 1000;
      case 'days': return value * hoursPerDay * 60 * 60 * 1000;
      case 'weeks': return value * hoursPerWeek * 60 * 60 * 1000;
      case 'months': return value * daysPerMonth * hoursPerDay * 60 * 60 * 1000;
      default: return value;
    }
  }

  /**
   * Вспомогательный метод: перевод из миллисекунд в указанную единицу.
   */
  private static msToUnit(ms: number, unit: Duration['unit'], prefs: CalendarPreferences): number {
    const { hoursPerDay, hoursPerWeek, daysPerMonth } = prefs;
    const hourMs = 60 * 60 * 1000;

    switch (unit) {
      case 'milliseconds': return ms;
      case 'seconds': return ms / 1000;
      case 'minutes': return ms / (60 * 1000);
      case 'hours': return ms / hourMs;
      case 'days': return ms / (hoursPerDay * hourMs);
      case 'weeks': return ms / (hoursPerWeek * hourMs);
      case 'months': return ms / (daysPerMonth * hoursPerDay * hourMs);
      default: return ms;
    }
  }

  /**
   * Рассчитывает длительность между двумя датами с учетом конкретного рабочего календаря
   * Stage 8.15: Точный расчет с учетом рабочих/выходных дней
   * 
   * @param startDate Дата начала
   * @param endDate Дата окончания
   * @param calendar Рабочий календарь ресурса
   * @param unit Единица измерения результата
   * @returns Длительность в рабочих днях/часах
   */
  public static calculateDurationWithCalendar(
    startDate: Date,
    endDate: Date,
    calendar: IWorkCalendar,
    unit: Duration['unit']
  ): Duration {
    const templateService = CalendarTemplateService.getInstance();
    let totalWorkingHours = 0;
    
    // Перебираем все дни в диапазоне
    const current = new Date(startDate);
    while (current <= endDate) {
      const hours = templateService.getWorkingHours(calendar, current);
      totalWorkingHours += hours;
      current.setDate(current.getDate() + 1);
    }

    // Преобразуем часы в нужные единицы
    let value: number;
    switch (unit) {
      case 'hours':
        value = totalWorkingHours;
        break;
      case 'days':
        value = totalWorkingHours / calendar.hoursPerDay;
        break;
      case 'weeks':
        value = totalWorkingHours / (calendar.hoursPerDay * calendar.workingDaysPerWeek);
        break;
      case 'months':
        value = totalWorkingHours / (calendar.hoursPerDay * calendar.workingDaysPerWeek * 4.33); // Среднее кол-во недель в месяце
        break;
      default:
        value = totalWorkingHours;
    }

    return { value, unit };
  }

  /**
   * Рассчитывает дату окончания на основе даты начала, длительности и календаря
   * Stage 8.15: Точное планирование с пропуском выходных
   * 
   * @param startDate Дата начала
   * @param duration Длительность работы
   * @param calendar Рабочий календарь
   * @returns Дата окончания (с учетом только рабочих дней)
   */
  public static calculateFinishDateWithCalendar(
    startDate: Date,
    duration: Duration,
    calendar: IWorkCalendar
  ): Date {
    const templateService = CalendarTemplateService.getInstance();
    
    // Переводим длительность в часы
    let remainingHours = duration.value;
    if (duration.unit === 'days') {
      remainingHours = duration.value * calendar.hoursPerDay;
    } else if (duration.unit === 'weeks') {
      remainingHours = duration.value * calendar.hoursPerDay * calendar.workingDaysPerWeek;
    }

    // Идем вперед по рабочим дням, вычитая часы
    const current = new Date(startDate);
    while (remainingHours > 0) {
      const hours = templateService.getWorkingHours(calendar, current);
      remainingHours -= hours;
      if (remainingHours > 0) {
        current.setDate(current.getDate() + 1);
      }
    }

    return current;
  }
}

