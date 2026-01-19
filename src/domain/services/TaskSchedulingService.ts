import { Task } from '@/store/project/interfaces';
import { CalendarMathService } from './CalendarMathService';
import { CalendarPreferences } from '@/types/Master_Functionality_Catalog';

/**
 * TaskSchedulingService - Сервис для пересчета расписания задач.
 */
export class TaskSchedulingService {
  public static recalculateAll(tasks: Task[], calendarPrefs: CalendarPreferences): Task[] {
    return tasks.map(task => {
      if (task.milestone) return task;

      const currentDuration = CalendarMathService.calculateDuration(
        task.startDate, task.endDate, 'hours', calendarPrefs
      );

      const newEndDate = CalendarMathService.calculateFinishDate(
        task.startDate, currentDuration, calendarPrefs
      );

      return { ...task, endDate: newEndDate };
    });
  }

  public static prepareNewTask(
    task: Task, 
    lastTask: Task | undefined,
    schedulePrefs: any, 
    calendarPrefs: CalendarPreferences
  ): Task {
    const newTask = { ...task };
    if (schedulePrefs?.newTasksStartToday && !task.startDate) {
      newTask.startDate = new Date();
      newTask.endDate = CalendarMathService.calculateFinishDate(
        newTask.startDate, { value: 1, unit: 'days' }, calendarPrefs
      );
    }

    if (schedulePrefs?.autoLinkTasks && lastTask && !newTask.predecessors) {
      this.autoLink(newTask, lastTask, calendarPrefs);
    }

    return newTask;
  }

  private static autoLink(newTask: Task, lastTask: Task, calendarPrefs: CalendarPreferences): void {
    newTask.predecessors = [lastTask.id];
    const newStart = new Date(lastTask.endDate);
    newStart.setDate(newStart.getDate() + 1);
    
    const duration = CalendarMathService.calculateDuration(
      newTask.startDate || new Date(), 
      newTask.endDate || new Date(), 
      'hours', 
      calendarPrefs
    );

    newTask.startDate = newStart;
    newTask.endDate = CalendarMathService.calculateFinishDate(
      newStart, 
      duration.value > 0 ? duration : { value: calendarPrefs.hoursPerDay, unit: 'hours' }, 
      calendarPrefs
    );
  }
}
