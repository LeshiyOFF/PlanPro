import { Task } from '@/store/project/interfaces';

/**
 * TaskHierarchyService - Сервис для управления иерархией задач (Indent/Outdent).
 */
export class TaskHierarchyService {
  public static indent(tasks: Task[], taskId: string): Task[] {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex <= 0) return tasks;

    const task = tasks[taskIndex];
    const prevTask = tasks[taskIndex - 1];

    if (task.level > prevTask.level) return tasks;

    const subtaskIndices = this.getSubtaskIndices(tasks, taskIndex, task.level);

    return tasks.map((t, idx) => {
      if (idx === taskIndex || subtaskIndices.includes(idx)) {
        return { ...t, level: t.level + 1 };
      }
      return t;
    });
  }

  public static outdent(tasks: Task[], taskId: string): Task[] {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return tasks;

    const task = tasks[taskIndex];
    if (task.level <= 1) return tasks;

    const subtaskIndices = this.getSubtaskIndices(tasks, taskIndex, task.level);

    return tasks.map((t, idx) => {
      if (idx === taskIndex || subtaskIndices.includes(idx)) {
        return { ...t, level: t.level - 1 };
      }
      return t;
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

