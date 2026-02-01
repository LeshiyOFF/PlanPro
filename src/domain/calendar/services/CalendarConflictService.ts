import { Task, getTaskResourceIds } from '@/store/project/interfaces';
import { Resource } from '@/types/resource-types';
import { IWorkCalendar } from '../interfaces/IWorkCalendar';
import { CalendarTemplateService } from './CalendarTemplateService';

/**
 * Результат проверки календарного конфликта
 */
export interface CalendarConflictResult {
  hasConflict: boolean;
  conflictingResources: Array<{
    resourceId: string;
    resourceName: string;
    calendarName: string;
    reason: string;
  }>;
}

/**
 * Сервис проверки конфликтов рабочих календарей
 * Stage 8.20: Валидация назначений задач относительно графиков ресурсов
 */
export class CalendarConflictService {
  private static instance: CalendarConflictService;

  public static getInstance(): CalendarConflictService {
    if (!CalendarConflictService.instance) {
      CalendarConflictService.instance = new CalendarConflictService();
    }
    return CalendarConflictService.instance;
  }

  /**
   * Проверяет, есть ли конфликт между задачей и календарями назначенных ресурсов
   * 
   * @param task Задача для проверки
   * @param resources Все ресурсы проекта
   * @param calendars Все календари проекта
   * @returns Результат с описанием конфликтов
   */
  public checkTaskConflict(
    task: Task,
    resources: Resource[],
    calendars: IWorkCalendar[]
  ): CalendarConflictResult {
    // Если задача не имеет назначенных ресурсов или это summary/milestone - конфликта нет
    const resourceIds = getTaskResourceIds(task);
    if (resourceIds.length === 0 || task.isSummary || task.isMilestone) {
      return { hasConflict: false, conflictingResources: [] };
    }

    const conflictingResources: CalendarConflictResult['conflictingResources'] = [];
    const templateService = CalendarTemplateService.getInstance();

    // Проверяем каждого назначенного работника
    for (const resourceId of resourceIds) {
      const resource = resources.find(r => String(r.id) === resourceId);
      
      // Проверяем только ресурсы типа "Труд" (у них есть рабочие календари)
      if (!resource || resource.type !== 'Work') continue;

      const calendar = calendars.find(c => c.id === resource.calendarId);
      if (!calendar) continue;

      // Проверяем, есть ли хотя бы один нерабочий день в интервале задачи
      const hasNonWorkingDay = this.hasNonWorkingDaysInRange(
        task.startDate,
        task.endDate,
        calendar,
        templateService
      );

      if (hasNonWorkingDay) {
        conflictingResources.push({
          resourceId: resource.id,
          resourceName: resource.name,
          calendarName: calendar.name,
          reason: this.getConflictReason(task.startDate, task.endDate, calendar, templateService)
        });
      }
    }

    return {
      hasConflict: conflictingResources.length > 0,
      conflictingResources
    };
  }

  /**
   * Проверяет, есть ли нерабочие дни в интервале
   */
  private hasNonWorkingDaysInRange(
    startDate: Date,
    endDate: Date,
    calendar: IWorkCalendar,
    templateService: CalendarTemplateService
  ): boolean {
    const current = new Date(startDate);
    
    while (current <= endDate) {
      if (!templateService.isWorkingDay(calendar, current)) {
        return true;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return false;
  }

  /**
   * Генерирует человекочитаемое описание конфликта
   */
  private getConflictReason(
    _startDate: Date,
    _endDate: Date,
    calendar: IWorkCalendar,
    templateService: CalendarTemplateService
  ): string {
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const nonWorkingDays: string[] = [];
    
    // Stage 8.21: Анализируем типичную рабочую неделю (7 дней)
    // Это позволит показать все выходные дни, даже если задача короткая
    const baseDate = new Date(2024, 0, 1); // Понедельник
    for (let i = 0; i < 7; i++) {
      const testDate = new Date(baseDate);
      testDate.setDate(baseDate.getDate() + i);
      
      if (!templateService.isWorkingDay(calendar, testDate)) {
        nonWorkingDays.push(dayNames[testDate.getDay()]);
      }
    }

    if (nonWorkingDays.length === 0) return 'График не соответствует';
    if (nonWorkingDays.length === 7) return 'Все дни недели нерабочие';
    
    // Сортируем дни недели начиная с Пн (индекс 1)
    const sortedDays = nonWorkingDays.sort((a, b) => {
      const order = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
      return order.indexOf(a) - order.indexOf(b);
    });

    return `Выходные дни: ${sortedDays.join(', ')}`;
  }

  /**
   * Получить общее количество рабочих часов для задачи с учетом календаря ресурса
   */
  public getActualWorkingHours(
    task: Task,
    calendar: IWorkCalendar
  ): number {
    const templateService = CalendarTemplateService.getInstance();
    let totalHours = 0;

    const current = new Date(task.startDate);
    while (current <= task.endDate) {
      totalHours += templateService.getWorkingHours(calendar, current);
      current.setDate(current.getDate() + 1);
    }

    return totalHours;
  }
}
