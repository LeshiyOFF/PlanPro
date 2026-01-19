import { GanttTimeline, GanttTimelineInterval } from '../canvas/interfaces/GanttCanvas';

/**
 * Сервис для управления данными временной шкалы (Timeline).
 * Соответствует SOLID: Single Responsibility Principle.
 */
export class GanttTimelineService {
  /**
   * Генерирует данные временной шкалы на основе диапазона дат и масштаба.
   */
  public static calculateTimeline(
    startDate: Date,
    endDate: Date,
    zoomLevel: number
  ): GanttTimeline {
    const intervals: GanttTimelineInterval[] = [];
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    
    const daysCount = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) || 30;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i <= daysCount; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      
      intervals.push({
        start: date,
        end: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        label: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
        x: i * 24,
        width: 24,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isToday: date.getTime() === today.getTime()
      });
    }

    return {
      startDate: start,
      endDate: end,
      unit: 'day',
      intervals,
      scale: zoomLevel
    };
  }
}


