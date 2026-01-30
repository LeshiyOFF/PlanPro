import { Task } from '@/store/project/interfaces';

/**
 * TaskHierarchyService - Сервис управления структурой работ (WBS).
 * 
 * ПРИНЦИП ИЕРАРХИЧЕСКОЙ ЦЕПНОСТИ:
 * 1. Прыжок вправо (Indent): Задача всегда становится "ребенком" той задачи, 
 *    которая стоит непосредственно над ней.
 * 2. Ограничение уровня: Уровень задачи не может превышать (уровень соседа сверху + 1).
 *    Нельзя создать "внучку", если нет прямого "родителя".
 * 3. Пошаговый выход (Outdent): Поднимает задачу на один уровень иерархии вверх, 
 *    делая её "сестрой" её текущего родителя.
 */
export class TaskHierarchyService {
  public static indent(tasks: Task[], taskId: string): Task[] {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex <= 0) return tasks;

    const task = tasks[taskIndex];
    const prevTask = tasks[taskIndex - 1];

    if (task.level > prevTask.level) return tasks;

    const subtaskIndices = this.getSubtaskIndices(tasks, taskIndex, task.level);

    const newTasks = tasks.map((t, idx) => {
      // Сама задача и её подзадачи переходят на уровень ниже предыдущей задачи (+1)
      if (idx === taskIndex || subtaskIndices.includes(idx)) {
        const levelDiff = (prevTask.level + 1) - task.level;
        return { ...t, level: t.level + levelDiff };
      }
      return t;
    });

    // Пересчитываем флаги summary для всех задач
    return this.refreshSummaryFlags(newTasks);
  }

  public static outdent(tasks: Task[], taskId: string): Task[] {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return tasks;

    const task = tasks[taskIndex];
    if (task.level <= 1) return tasks;

    const subtaskIndices = this.getSubtaskIndices(tasks, taskIndex, task.level);

    const newTasks = tasks.map((t, idx) => {
      if (idx === taskIndex || subtaskIndices.includes(idx)) {
        return { ...t, level: t.level - 1 };
      }
      return t;
    });

    // Пересчитываем флаги summary для всех задач
    return this.refreshSummaryFlags(newTasks);
  }

  /**
   * Пересчитывает флаги summary для всех задач на основе их уровней
   */
  public static refreshSummaryFlags(tasks: Task[]): Task[] {
    return tasks.map((task, idx) => {
      const hasSubtasks = idx < tasks.length - 1 && tasks[idx + 1].level > task.level;
      return { ...task, summary: hasSubtasks };
    });
  }

  private static getSubtaskIndices(tasks: Task[], parentIdx: number, parentLevel: number): number[] {
    const indices: number[] = [];
    for (let i = parentIdx + 1; i < tasks.length; i++) {
      if (tasks[i].level > parentLevel) {
        indices.push(i);
      } else {
        break;
      }
    }
    return indices;
  }
}

