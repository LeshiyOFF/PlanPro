import { Duration, CalendarPreferences } from '@/types/Master_Functionality_Catalog';

/**
 * Сервис для выполнения расчетов, связанных с календарем и длительностью.
 * Внедряет параметры hoursPerDay, hoursPerWeek и daysPerMonth в математику планирования.
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
}
