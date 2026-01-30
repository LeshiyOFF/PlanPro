import { ViewMode } from 'gantt-task-react';
import { CalendarDateService } from './CalendarDateService';
import { Task } from '@/store/project/interfaces';

/**
 * GanttNavigationService - Сервис для расчета навигации и позиционирования.
 * Реализует "Индексную стратегию" для надежной навигации независимо от DST и часовых поясов.
 */
export class GanttNavigationService {
  /**
   * Проверяет, есть ли задачи, пересекающиеся с указанной датой.
   */
  public static hasTasksAtDate(date: Date, tasks: Task[]): boolean {
    if (!tasks || tasks.length === 0) return false;
    
    const target = CalendarDateService.toLocalMidnight(date).getTime();
    
    return tasks.some(task => {
      // Игнорируем филлеры
      if ((task as any).isFiller) return false;
      
      const start = CalendarDateService.toLocalMidnight(task.startDate).getTime();
      const end = CalendarDateService.toLocalMidnight(task.endDate).getTime();
      
      // Задача есть на дату, если таргет попадает в диапазон [start, end]
      return target >= start && target <= end;
    });
  }

  /**
   * Вычисляет индекс шага (колонки) для заданной даты относительно начала проекта.
   */
  public static dateToStepIndex(date: Date, projectStart: Date, viewMode: ViewMode): number {
    const start = CalendarDateService.toLocalMidnight(projectStart);
    const target = CalendarDateService.toLocalMidnight(date);

    let index = 0;
    switch (viewMode) {
      case ViewMode.Hour:
        index = Math.floor((target.getTime() - start.getTime()) / (1000 * 60 * 60));
        break;
      case ViewMode.Day:
        index = CalendarDateService.getCalendarDaysDiff(start, target);
        break;
      case ViewMode.Week:
        index = Math.floor(CalendarDateService.getCalendarDaysDiff(start, target) / 7);
        break;
      case ViewMode.Month:
        index = (target.getFullYear() - start.getFullYear()) * 12 + (target.getMonth() - start.getMonth());
        break;
      case ViewMode.Year:
        index = target.getFullYear() - start.getFullYear();
        break;
      default:
        index = CalendarDateService.getCalendarDaysDiff(start, target);
    }

    console.log(`[GanttNavigationService] dateToStepIndex:`, {
      target: target.toLocaleDateString(),
      start: start.toLocaleDateString(),
      viewMode,
      index
    });

    return index;
  }

  /**
   * Вычисляет позицию прокрутки (px) на основе индекса шага и ширины колонки.
   * Учитывает Mirror Strategy (preStepsCount = 1) и может центрировать дату.
   */
  public static calculateScrollPosition(
    stepIndex: number, 
    columnWidth: number, 
    containerWidth: number = 0
  ): number {
    // ВАЖНО: Прибавляем 1 к индексу, так как библиотека всегда добавляет один пустой шаг слева (preStepsCount=1)
    const effectiveIndex = stepIndex + 1;
    let pos = effectiveIndex * columnWidth;

    // Мягкое центрирование: если ширина контейнера известна, ставим дату с отступом 20% от левого края,
    // чтобы пользователь видел контекст "до".
    if (containerWidth > 0) {
      const offset = containerWidth * 0.2;
      pos = Math.max(0, pos - offset);
    }
    
    console.log(`[GanttNavigationService] calculateScrollPosition:`, {
      stepIndex,
      columnWidth,
      effectiveIndex,
      containerWidth,
      pos
    });

    return pos;
  }

  /**
   * Находит ID ближайшей задачи к указанной дате.
   * Полезно для точной навигации по DOM-элементам.
   */
  public static findNearestTaskId(date: Date, tasks: Task[]): string | null {
    if (!tasks || tasks.length === 0) return null;

    const targetTime = date.getTime();
    let nearestTask: Task | null = null;
    let minDiff = Infinity;

    for (const task of tasks) {
      if ((task as any).isFiller) continue;
      
      const taskStart = new Date(task.startDate).getTime();
      const diff = Math.abs(taskStart - targetTime);
      
      if (diff < minDiff) {
        minDiff = diff;
        nearestTask = task;
      }
    }

    // Возвращаем задачу только если она в пределах "разумной" близости (например, 30 дней)
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    return (nearestTask && minDiff < thirtyDaysMs) ? nearestTask.id : null;
  }

  /**
   * Вычисляет индексы видимых колонок для виртуализации.
   */
  public static getVisibleRangeIndices(
    scrollLeft: number,
    containerWidth: number,
    columnWidth: number,
    totalCount: number
  ) {
    const buffer = 5; // Количество колонок буфера по краям
    const startIndex = Math.max(0, Math.floor(scrollLeft / columnWidth) - buffer);
    const endIndex = Math.min(totalCount, Math.ceil((scrollLeft + containerWidth) / columnWidth) + buffer);
    
    return { startIndex, endIndex };
  }

  /**
   * Проверяет безопасность прыжка по дате и рекомендует режим отображения.
   */
  public static checkNavigationSafety(targetDate: Date, viewMode: ViewMode): {
    isSafe: boolean;
    recommendation?: ViewMode;
  } {
    const diffYears = Math.abs(targetDate.getFullYear() - new Date().getFullYear());
    
    if (diffYears > 2 && viewMode === ViewMode.Day) {
      return { isSafe: false, recommendation: ViewMode.Month };
    }
    
    return { isSafe: true };
  }

  /**
   * Вычисляет следующее положение прокрутки для навигационных кнопок.
   */
  public static calculateNextScroll(
    direction: 'left' | 'right',
    currentScroll: number,
    stepSize: number
  ): number {
    const multiplier = direction === 'left' ? -1 : 1;
    return Math.max(0, currentScroll + (stepSize * multiplier));
  }
}
