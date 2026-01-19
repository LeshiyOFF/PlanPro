import { Task } from '@/store/project/interfaces';
import { CalendarMathService } from './CalendarMathService';
import { CalendarPreferences } from '@/types/Master_Functionality_Catalog';

/**
 * TaskLinkService - Сервис для управления связями между задачами.
 */
export class TaskLinkService {
  public static link(
    tasks: Task[], 
    sourceId: string, 
    targetId: string, 
    calendarPrefs: CalendarPreferences
  ): Task[] {
    const targetTask = tasks.find(t => t.id === targetId);
    if (!targetTask) return tasks;

    return tasks.map(task => {
      if (task.id === sourceId) {
        const preds = task.predecessors || [];
        if (preds.includes(targetId)) return task;
        
        const newStartDate = new Date(targetTask.endDate);
        newStartDate.setDate(newStartDate.getDate() + 1);
        
        const duration = CalendarMathService.calculateDuration(
          task.startDate, task.endDate, 'hours', calendarPrefs
        );
        
        const newEndDate = CalendarMathService.calculateFinishDate(
          newStartDate, duration, calendarPrefs
        );

        return { 
          ...task, 
          predecessors: [...preds, targetId],
          startDate: newStartDate,
          endDate: newEndDate
        };
      }
      return task;
    });
  }

  public static isValidPredecessor(tasks: Task[], taskId: string, potentialPredId: string): boolean {
    if (taskId === potentialPredId) return false;

    const checkCycle = (currentId: string, visited: Set<string>): boolean => {
      if (currentId === taskId) return true;
      if (visited.has(currentId)) return false;
      visited.add(currentId);

      const task = tasks.find(t => t.id === currentId);
      if (!task || !task.predecessors) return false;

      return task.predecessors.some(predId => checkCycle(predId, visited));
    };

    return !checkCycle(potentialPredId, new Set());
  }
}

