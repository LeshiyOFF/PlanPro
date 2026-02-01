import { Task } from '@/store/project/interfaces';
import { CalendarMathService } from './CalendarMathService';
import { CalendarPreferences, SchedulePreferences } from '@/types/Master_Functionality_Catalog';
import { CalendarDateService } from '@/services/CalendarDateService';
import { normalizeFraction } from '@/utils/ProgressFormatter';

/**
 * TaskSchedulingService - Сервис для пересчета расписания задач.
 */
export class TaskSchedulingService {
  public static recalculateAll(tasks: Task[], calendarPrefs: CalendarPreferences): Task[] {
    // 1. Сначала пересчитываем длительности обычных задач
    const updatedTasks = tasks.map(task => {
      if (task.isMilestone || task.isSummary) return task;

      const currentDuration = CalendarMathService.calculateDuration(
        task.startDate, task.endDate, 'hours', calendarPrefs
      );

      const newEndDate = CalendarMathService.calculateFinishDate(
        task.startDate, currentDuration, calendarPrefs
      );

      return { ...task, endDate: newEndDate };
    });

    // 2. Затем пересчитываем суммарные задачи (снизу вверх)
    return this.recalculateSummaryTasks(updatedTasks);
  }

  /**
   * Пересчитывает даты и прогресс для суммарных задач.
   * Defensive Programming: нормализует агрегированные даты к локальной полуночи.
   */
  public static recalculateSummaryTasks(tasks: Task[]): Task[] {
    const result = [...tasks];
    
    // Идем с конца в начало, чтобы сначала обработать глубокие уровни вложенности
    for (let i = result.length - 1; i >= 0; i--) {
      const task = result[i];
      if (!task.isSummary) continue;

      // Находим все прямые и косвенные подзадачи
      const subtasks: Task[] = [];
      for (let j = i + 1; j < result.length; j++) {
        if (result[j].level > task.level) {
          subtasks.push(result[j]);
        } else {
          break;
        }
      }

      if (subtasks.length > 0) {
        const startDates = subtasks.map(t => new Date(t.startDate).getTime());
        const endDates = subtasks.map(t => new Date(t.endDate).getTime());
        
        // Нормализуем агрегированные даты к локальной полуночи
        const minStart = CalendarDateService.toLocalMidnight(new Date(Math.min(...startDates)));
        const maxEnd = CalendarDateService.toLocalMidnight(new Date(Math.max(...endDates)));
        
        // Средний прогресс: игнорируем вехи (как в MS Project)
        // Вехи - это контрольные точки, а не работа, поэтому не учитываем их в прогрессе
        const nonMilestones = subtasks.filter(t => !t.isMilestone);
        let avgProgress = 0;
        
        if (nonMilestones.length > 0) {
          const totalProgress = nonMilestones.reduce((acc, t) => acc + (t.progress || 0), 0);
          // Используем normalizeFraction для устранения IEEE 754 артефактов
          // При делении (например, 0.84 / 3 = 0.2799999999...) нужна нормализация
          avgProgress = normalizeFraction(totalProgress / nonMilestones.length);
        }

        result[i] = {
          ...task,
          startDate: minStart,
          endDate: maxEnd,
          progress: avgProgress
        };
      }
    }
    
    return result;
  }

  /**
   * Подготавливает новую задачу с нормализацией дат (Defensive Programming).
   * ВСЕГДА нормализует даты к локальной полуночи, независимо от источника данных.
   * Это защищает от UTC-сдвигов при создании задач из любых View-компонентов.
   */
  public static prepareNewTask(
    task: Task,
    lastTask: Task | undefined,
    schedulePrefs: Partial<SchedulePreferences> | null | undefined,
    calendarPrefs: CalendarPreferences
  ): Task {
    const newTask = { ...task };
    
    // Defensive Programming: ВСЕГДА нормализуем startDate
    if (newTask.startDate) {
      // Если дата уже установлена (из View), нормализуем её к полуночи
      newTask.startDate = CalendarDateService.toLocalMidnight(newTask.startDate);
    } else if (schedulePrefs?.newTasksStartToday) {
      // Если даты нет, создаём новую с текущей датой
      newTask.startDate = CalendarDateService.toLocalMidnight(new Date());
    }
    
    // Defensive Programming: ВСЕГДА нормализуем endDate
    if (newTask.endDate) {
      // Если дата уже установлена (из View), нормализуем её к полуночи
      newTask.endDate = CalendarDateService.toLocalMidnight(newTask.endDate);
    } else if (newTask.startDate) {
      // Если даты нет, но есть startDate, рассчитываем endDate от startDate
      newTask.endDate = CalendarMathService.calculateFinishDate(
        newTask.startDate, { value: 1, unit: 'days' }, calendarPrefs
      );
    }

    if (schedulePrefs?.autoLinkTasks && lastTask && !newTask.predecessors) {
      this.autoLink(newTask, lastTask, calendarPrefs);
    }

    return newTask;
  }

  /**
   * Автоматически связывает новую задачу с предыдущей (Finish-to-Start).
   * Defensive Programming: нормализует все даты к локальной полуночи.
   */
  private static autoLink(newTask: Task, lastTask: Task, calendarPrefs: CalendarPreferences): void {
    newTask.predecessors = [lastTask.id];
    
    // Нормализуем дату окончания предыдущей задачи
    const lastEndNormalized = CalendarDateService.toLocalMidnight(lastTask.endDate);
    
    // Создаём новую дату начала (следующий день после окончания предыдущей задачи)
    const newStart = new Date(lastEndNormalized);
    newStart.setDate(newStart.getDate() + 1);
    
    const duration = CalendarMathService.calculateDuration(
      newTask.startDate || CalendarDateService.toLocalMidnight(new Date()), 
      newTask.endDate || CalendarDateService.toLocalMidnight(new Date()), 
      'hours', 
      calendarPrefs
    );

    // Устанавливаем нормализованные даты
    newTask.startDate = CalendarDateService.toLocalMidnight(newStart);
    newTask.endDate = CalendarMathService.calculateFinishDate(
      newTask.startDate, 
      duration.value > 0 ? duration : { value: calendarPrefs.hoursPerDay, unit: 'hours' }, 
      calendarPrefs
    );
  }
}

