import { IWorkCalendar, IWorkingDay, CalendarTemplateType } from '@/domain/calendar/interfaces/IWorkCalendar';

/**
 * DTO структура от Java API (соответствует CalendarDataDto.java).
 * 
 * V2.2: Добавлено поле hoursPerDay для корректной передачи с бэкенда.
 */
export interface CalendarDataFromApi {
  id: string;
  name: string;
  description?: string;
  type: string;
  workingDays: boolean[];
  workingHours: { from: number; to: number }[];
  hoursPerDay?: number;
  exceptions?: CalendarExceptionFromApi[];
}

export interface CalendarExceptionFromApi {
  date: string;
  working: boolean;
  from?: number;
  to?: number;
  name?: string;
}

/**
 * Конвертер данных календарей из Java API в формат фронтенда.
 * 
 * SOLID: Single Responsibility - только конвертация структур данных.
 * Clean Architecture: Service Layer - бизнес-логика преобразования.
 * 
 * V2.2 КРИТИЧЕСКИЕ ИЗМЕНЕНИЯ:
 * - Добавлена поддержка hoursPerDay из API (CalendarDataDto.java)
 * - Приоритет hoursPerDay из API, fallback на вычисление из workingHours
 * 
 * V2.1:
 * - mergeWorkingHoursRanges(): корректное объединение диапазонов
 * - Генерация description из данных календаря
 * 
 * @author ProjectLibre Team
 * @version 2.2.0
 */
export class CalendarDataConverter {
  
  /**
   * Конвертирует CalendarDataDto из Java API в IWorkCalendar для фронтенда.
   * 
   * V2.2: Использует hoursPerDay из API если передано,
   * иначе вычисляет из workingHours для обратной совместимости.
   */
  public static apiToFrontendCalendar(apiCalendar: CalendarDataFromApi): IWorkCalendar {
    const now = new Date();
    
    const workingDays = CalendarDataConverter.convertWorkingDays(
      apiCalendar.workingDays,
      apiCalendar.workingHours
    );
    
    const templateType = CalendarDataConverter.detectTemplateType(apiCalendar);
    
    // V2.2: Приоритет hoursPerDay из API, затем вычисление из workingHours
    const hoursPerDay = apiCalendar.hoursPerDay && apiCalendar.hoursPerDay > 0
      ? apiCalendar.hoursPerDay
      : CalendarDataConverter.calculateHoursPerDay(apiCalendar.workingHours);
    
    const workingDaysPerWeek = apiCalendar.workingDays.filter(Boolean).length;
    
    // V2.1: Генерируем description из данных, если не передан
    const description = apiCalendar.description || 
      CalendarDataConverter.generateDescription(apiCalendar.workingDays, hoursPerDay);
    
    console.log(`[CalendarDataConverter] Converting '${apiCalendar.name}': ` +
      `apiHoursPerDay=${apiCalendar.hoursPerDay}, calculated=${hoursPerDay}, ` +
      `workingHours=${JSON.stringify(apiCalendar.workingHours)}`);
    
    return {
      id: apiCalendar.id,
      name: apiCalendar.name,
      description,
      templateType,
      workingDays,
      exceptions: [],
      hoursPerDay,
      workingDaysPerWeek,
      isBase: apiCalendar.type === 'system',
      createdAt: now,
      updatedAt: now
    };
  }
  
  /**
   * Конвертирует массив boolean[] в IWorkingDay[].
   * 
   * V2.1: КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ - теперь корректно обрабатывает
   * несколько диапазонов рабочих часов (обеденный перерыв).
   */
  private static convertWorkingDays(
    workingDays: boolean[], 
    workingHours: { from: number; to: number }[]
  ): IWorkingDay[] {
    const result: IWorkingDay[] = [];
    
    // V2.1: Объединяем все диапазоны в единую структуру с возможным перерывом
    const mergedHours = CalendarDataConverter.mergeWorkingHoursRanges(workingHours);
    
    for (let i = 0; i < 7; i++) {
      const isWorking = workingDays[i] ?? false;
      
      const day: IWorkingDay = {
        dayOfWeek: i,
        isWorking
      };
      
      if (isWorking && mergedHours) {
        day.workingHours = mergedHours;
      }
      
      result.push(day);
    }
    
    return result;
  }
  
  /**
   * Объединяет массив диапазонов рабочих часов в единую структуру IWorkingDay['workingHours'].
   * 
   * КРИТИЧЕСКОЕ: Исправляет баг с потерей второго диапазона при загрузке календаря.
   * Если между диапазонами есть разрыв - определяет его как обеденный перерыв.
   * 
   * Примеры:
   * - [{from: 9, to: 18}] → {start: "09:00", end: "18:00"}
   * - [{from: 9, to: 13}, {from: 14, to: 18}] → {start: "09:00", end: "18:00", breakStart: "13:00", breakEnd: "14:00"}
   * 
   * @param ranges массив диапазонов рабочих часов от API
   * @returns объединённая структура рабочих часов или null
   */
  private static mergeWorkingHoursRanges(
    ranges: { from: number; to: number }[]
  ): IWorkingDay['workingHours'] | null {
    // Дефолт если нет данных
    if (!ranges || ranges.length === 0) {
      return { start: '09:00', end: '18:00' };
    }
    
    // Фильтруем невалидные диапазоны
    const validRanges = ranges.filter(r => r && r.from >= 0 && r.to > r.from);
    if (validRanges.length === 0) {
      return { start: '09:00', end: '18:00' };
    }
    
    // Сортируем по времени начала
    const sorted = [...validRanges].sort((a, b) => a.from - b.from);
    
    const firstRange = sorted[0];
    const lastRange = sorted[sorted.length - 1];
    
    const result: IWorkingDay['workingHours'] = {
      start: CalendarDataConverter.formatHour(firstRange.from),
      end: CalendarDataConverter.formatHour(lastRange.to)
    };
    
    // Если два диапазона - ищем разрыв (перерыв между ними)
    if (sorted.length === 2) {
      const gap = sorted[1].from - sorted[0].to;
      if (gap > 0) {
        result.breakStart = CalendarDataConverter.formatHour(sorted[0].to);
        result.breakEnd = CalendarDataConverter.formatHour(sorted[1].from);
      }
    } else if (sorted.length > 2) {
      // Для 3+ диапазонов: берём первый разрыв как основной перерыв
      // Это edge case для ночных смен или нестандартных графиков
      console.warn(`[CalendarDataConverter] ${sorted.length} working hour ranges detected, using first gap as break`);
      const gap = sorted[1].from - sorted[0].to;
      if (gap > 0) {
        result.breakStart = CalendarDataConverter.formatHour(sorted[0].to);
        result.breakEnd = CalendarDataConverter.formatHour(sorted[1].from);
      }
    }
    
    return result;
  }
  
  /**
   * Генерирует описание календаря на основе его настроек.
   * Используется когда description не передан с бэкенда.
   */
  private static generateDescription(workingDays: boolean[], hoursPerDay: number): string {
    const workingDaysCount = workingDays.filter(Boolean).length;
    
    if (workingDaysCount === 7) {
      return `Круглосуточный: ${hoursPerDay}ч/дн, 7 дней`;
    }
    
    // Проверяем стандартную пятидневку (Пн-Пт)
    if (workingDaysCount === 5 && !workingDays[0] && !workingDays[6]) {
      return `Офисный: ${hoursPerDay}ч/дн, Пн-Пт`;
    }
    
    return `Кастомный: ${hoursPerDay}ч/дн, ${workingDaysCount}/7`;
  }
  
  /**
   * Определяет тип шаблона по ID календаря.
   */
  private static detectTemplateType(calendar: CalendarDataFromApi): CalendarTemplateType {
    const id = calendar.id.toLowerCase();
    
    if (id === 'standard') return CalendarTemplateType.STANDARD;
    if (id === '24_7') return CalendarTemplateType.TWENTY_FOUR_SEVEN;
    if (id === 'night_shift') return CalendarTemplateType.NIGHT_SHIFT;
    
    return CalendarTemplateType.CUSTOM;
  }
  
  /**
   * Вычисляет количество рабочих часов в день.
   */
  private static calculateHoursPerDay(workingHours: { from: number; to: number }[]): number {
    if (!workingHours || workingHours.length === 0) return 8;
    
    let totalHours = 0;
    for (const range of workingHours) {
      totalHours += range.to - range.from;
    }
    return totalHours > 0 ? totalHours : 8;
  }
  
  /**
   * Форматирует час в строку "HH:mm".
   */
  private static formatHour(hour: number): string {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
  
  /**
   * Конвертирует массив CalendarDataDto[] из Java API.
   * Фильтрует системные календари (они уже есть в store).
   */
  public static apiToFrontendCalendars(
    apiCalendars: CalendarDataFromApi[],
    existingCalendarIds: string[]
  ): IWorkCalendar[] {
    if (!apiCalendars || apiCalendars.length === 0) {
      return [];
    }
    
    return apiCalendars
      .filter(cal => !existingCalendarIds.includes(cal.id))
      .filter(cal => cal.type !== 'system')
      .map(cal => CalendarDataConverter.apiToFrontendCalendar(cal));
  }
}
