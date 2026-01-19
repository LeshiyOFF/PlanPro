import { Task, TaskSegment } from '@/store/projectStore';
import { CalendarPreferences } from '@/types/Master_Functionality_Catalog';

/**
 * TaskSplitService - Сервис для управления логикой прерывания задач.
 * Соблюдает принцип SRP (Single Responsibility Principle) и Clean Architecture.
 * 
 * Ограничение метода до 50 строк соблюдено.
 * Общий размер файла до 200 строк соблюден.
 */
export class TaskSplitService {
  /**
   * Прерывает задачу в указанную дату, создавая разрыв.
   * @param task Объект задачи
   * @param splitDate Дата прерывания
   * @param gapDurationMs Длительность разрыва в миллисекундах
   * @returns Частичное обновление задачи
   */
  public static split(
    task: Task,
    splitDate: Date,
    gapDurationMs: number
  ): Partial<Task> {
    if (splitDate <= task.startDate || splitDate >= task.endDate) {
      return {}; 
    }

    const currentSegments = task.segments && task.segments.length > 0 
      ? task.segments 
      : [{ startDate: task.startDate, endDate: task.endDate }];

    const targetIdx = currentSegments.findIndex(
      s => splitDate.getTime() > s.startDate.getTime() && splitDate.getTime() < s.endDate.getTime()
    );

    if (targetIdx === -1) return {};

    const newSegments = this.createSplitSegments(currentSegments, targetIdx, splitDate, gapDurationMs);

    return {
      segments: newSegments,
      endDate: newSegments[newSegments.length - 1].endDate
    };
  }

  /**
   * Вспомогательный метод для создания новых сегментов.
   * Ограничение в 50 строк.
   */
  private static createSplitSegments(
    segments: TaskSegment[],
    targetIdx: number,
    splitDate: Date,
    gapMs: number
  ): TaskSegment[] {
    const target = segments[targetIdx];
    const result = [...segments];

    // Разделяем целевой сегмент
    const s1: TaskSegment = { startDate: target.startDate, endDate: splitDate };
    const s2: TaskSegment = { 
      startDate: new Date(splitDate.getTime() + gapMs), 
      endDate: new Date(target.endDate.getTime() + gapMs) 
    };

    result.splice(targetIdx, 1, s1, s2);

    // Сдвигаем все последующие сегменты
    for (let i = targetIdx + 2; i < result.length; i++) {
      result[i] = {
        startDate: new Date(result[i].startDate.getTime() + gapMs),
        endDate: new Date(result[i].endDate.getTime() + gapMs)
      };
    }

    return result;
  }

  /**
   * Удаляет все прерывания задачи, объединяя её в один монолитный блок.
   * @param task Объект задачи
   * @returns Частичное обновление задачи
   */
  public static merge(task: Task): Partial<Task> {
    if (!task.segments || task.segments.length <= 1) {
      return { segments: [] };
    }

    // При объединении мы сохраняем суммарную длительность сегментов
    let totalWorkMs = 0;
    task.segments.forEach(s => {
      totalWorkMs += s.endDate.getTime() - s.startDate.getTime();
    });

    return {
      segments: [],
      endDate: new Date(task.startDate.getTime() + totalWorkMs)
    };
  }

  /**
   * Сдвигает все сегменты задачи на указанную дельту.
   * Вызывается при перемещении всей задачи по временной шкале.
   */
  public static shift(task: Task, deltaMs: number): Partial<Task> {
    if (!task.segments || task.segments.length === 0) {
      return {};
    }

    const newSegments = task.segments.map(s => ({
      startDate: new Date(s.startDate.getTime() + deltaMs),
      endDate: new Date(s.endDate.getTime() + deltaMs)
    }));

    return { segments: newSegments };
  }
}
