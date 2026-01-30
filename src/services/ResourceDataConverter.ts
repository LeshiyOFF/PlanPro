import type { Resource } from '@/types/resource-types';
import type { FrontendResourceData, CalendarSyncData } from '@/types/api/request-types';
import type { IWorkCalendar } from '@/domain/calendar/interfaces/IWorkCalendar';

/**
 * Сервис конвертации данных ресурсов между форматами.
 * 
 * V2.0 КРИТИЧЕСКИЕ ИЗМЕНЕНИЯ:
 * - Добавлена поддержка calendarData для передачи полных настроек календаря
 * - Это исправляет баг с потерей настроек кастомных календарей
 * 
 * Clean Architecture: Data Transfer (Interface Adapters Layer).
 * SOLID: Single Responsibility - только конвертация ресурсов.
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 */
export class ResourceDataConverter {
  
  /**
   * Конвертирует frontend Resource в формат для синхронизации с Core.
   * Включает полные данные календаря если это кастомный календарь.
   * 
   * @param resource ресурс для конвертации
   * @param calendars массив календарей для поиска данных
   */
  static frontendResourceToSync(
    resource: Resource, 
    calendars?: IWorkCalendar[]
  ): FrontendResourceData {
    const result: FrontendResourceData = {
      id: resource.id,
      name: resource.name || 'Unnamed Resource',
      type: resource.type || 'Work',
      maxUnits: resource.maxUnits || 1,
      standardRate: resource.standardRate || 0,
      overtimeRate: resource.overtimeRate || 0,
      costPerUse: resource.costPerUse || 0,
      calendarId: resource.calendarId,
      materialLabel: resource.materialLabel,
      email: resource.email,
      group: resource.group,
      available: resource.available ?? true
    };
    
    if (resource.calendarId && calendars) {
      const calendarData = ResourceDataConverter.findAndConvertCalendar(
        resource.calendarId, 
        calendars
      );
      if (calendarData) {
        result.calendarData = calendarData;
      }
    }
    
    return result;
  }
  
  /**
   * Конвертирует массив frontend resources в формат для синхронизации.
   * Включает полные данные календарей для кастомных календарей.
   * 
   * @param resources массив ресурсов
   * @param calendars массив календарей
   */
  static frontendResourcesToSync(
    resources: Resource[], 
    calendars?: IWorkCalendar[]
  ): FrontendResourceData[] {
    return resources.map(resource => 
      ResourceDataConverter.frontendResourceToSync(resource, calendars)
    );
  }
  
  /**
   * Находит календарь по ID и конвертирует в CalendarSyncData.
   * КРИТИЧЕСКОЕ: Включает только кастомные календари (custom_*).
   */
  private static findAndConvertCalendar(
    calendarId: string, 
    calendars: IWorkCalendar[]
  ): CalendarSyncData | undefined {
    if (!calendarId.startsWith('custom_')) {
      return undefined;
    }
    
    const calendar = calendars.find(c => c.id === calendarId);
    if (!calendar) {
      return undefined;
    }
    
    return ResourceDataConverter.workCalendarToSyncData(calendar);
  }
  
  /**
   * Конвертирует IWorkCalendar в CalendarSyncData для бэкенда.
   */
  static workCalendarToSyncData(calendar: IWorkCalendar): CalendarSyncData {
    const workingDays = ResourceDataConverter.extractWorkingDaysBooleans(calendar);
    const workingHours = ResourceDataConverter.extractWorkingHoursRanges(calendar);
    
    return {
      id: calendar.id,
      name: calendar.name,
      description: calendar.description,
      workingDays,
      workingHours,
      hoursPerDay: calendar.hoursPerDay,
      templateType: calendar.templateType
    };
  }
  
  /**
   * Извлекает массив boolean[] рабочих дней из IWorkCalendar.
   * Индексация: 0 = Вс, 1 = Пн, ..., 6 = Сб (соответствует Java Calendar).
   */
  private static extractWorkingDaysBooleans(calendar: IWorkCalendar): boolean[] {
    const result: boolean[] = [false, false, false, false, false, false, false];
    
    for (const day of calendar.workingDays) {
      if (day.dayOfWeek >= 0 && day.dayOfWeek < 7) {
        result[day.dayOfWeek] = day.isWorking;
      }
    }
    
    return result;
  }
  
  /**
   * Извлекает диапазоны рабочих часов из первого рабочего дня календаря.
   */
  private static extractWorkingHoursRanges(
    calendar: IWorkCalendar
  ): { from: number; to: number }[] {
    const workingDay = calendar.workingDays.find(d => d.isWorking && d.workingHours);
    
    if (!workingDay?.workingHours) {
      return [{ from: 8, to: 12 }, { from: 13, to: 17 }];
    }
    
    const startHour = ResourceDataConverter.parseHour(workingDay.workingHours.start);
    const endHour = ResourceDataConverter.parseHour(workingDay.workingHours.end);
    
    if (workingDay.workingHours.breakStart && workingDay.workingHours.breakEnd) {
      const breakStart = ResourceDataConverter.parseHour(workingDay.workingHours.breakStart);
      const breakEnd = ResourceDataConverter.parseHour(workingDay.workingHours.breakEnd);
      return [
        { from: startHour, to: breakStart },
        { from: breakEnd, to: endHour }
      ];
    }
    
    return [{ from: startHour, to: endHour }];
  }
  
  /**
   * Парсит строку времени "HH:mm" в число часов.
   */
  private static parseHour(timeStr: string): number {
    const [hours] = timeStr.split(':').map(Number);
    return hours || 0;
  }
}
