import { Task } from '@/store/projectStore';
import { ICalendarCell } from '../interfaces/ICalendarCell';
import { ICalendarEvent } from '../interfaces/ICalendarEvent';

/**
 * Сервис для работы с календарной логикой
 */
export class CalendarService {
  /**
   * Генерирует массив дней для отображения в сетке месяца
   */
  public generateMonthDays(year: number, month: number, tasks: Task[]): ICalendarCell[] {
    const days: ICalendarCell[] = [];
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Определяем начало сетки (может захватывать конец предыдущего месяца)
    // 0 - Воскресенье, 1 - Понедельник. Сделаем неделю с Понедельника.
    let startOffset = firstDayOfMonth.getDay() - 1;
    if (startOffset === -1) startOffset = 6; // Если воскресенье
    
    const startDate = new Date(year, month, 1 - startOffset);
    
    // Генерируем ровно 42 дня (6 недель по 7 дней) для стабильной сетки
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = currentDate.getMonth() === month;
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const today = new Date();
      const isToday = currentDate.getDate() === today.getDate() && 
                      currentDate.getMonth() === today.getMonth() && 
                      currentDate.getFullYear() === today.getFullYear();
      
      const dayEvents = this.getEventsForDate(currentDate, tasks);
      
      days.push({
        date: currentDate,
        isCurrentMonth,
        isToday,
        isWeekend,
        events: dayEvents
      });
    }
    
    return days;
  }

  /**
   * Находит задачи, которые пересекаются с указанной датой
   */
  private getEventsForDate(date: Date, tasks: Task[]): ICalendarEvent[] {
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));
    
    return tasks
      .filter(task => {
        const taskStart = new Date(task.startDate);
        const taskEnd = new Date(task.endDate);
        // Задача пересекается с днем, если она началась не позже конца дня 
        // и закончилась не раньше начала дня
        return taskStart <= dayEnd && taskEnd >= dayStart;
      })
      .map(task => ({
        id: task.id,
        title: task.name,
        startDate: new Date(task.startDate),
        endDate: new Date(task.endDate),
        color: task.color || '#3b82f6',
        progress: task.progress,
        isMilestone: task.milestone || false,
        isCritical: task.critical || false,
        originalTask: task
      }));
  }

  /**
   * Возвращает название месяца на русском
   */
  public getMonthName(month: number): string {
    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return months[month];
  }
}

