import { GanttTaskRender } from '../interfaces/GanttCanvas';

/**
 * Task type validator for different Gantt task types
 * Validates GC001-GC006 task types
 */
export class GanttTaskTypeValidator {
  /**
   * Check if task has progress
   * GC003: Progress Display
   */
  static hasProgress(task: GanttTaskRender): boolean {
    return task.progress !== undefined && task.progress > 0;
  }

  /**
   * Check if task is a milestone
   * GC005: Milestone Display
   */
  static isMilestone(task: GanttTaskRender): boolean {
    return task.milestone === true || 
           task.type === 'milestone' || 
           (task.startDate && task.endDate && task.startDate.getTime() === task.endDate.getTime());
  }

  /**
   * Check if task is a summary task
   * GC006: Summary Task Display
   */
  static isSummaryTask(task: GanttTaskRender): boolean {
    return task.summary === true || 
           task.type === 'summary' || 
           (task.children && task.children.length > 0);
  }

  /**
   * Check if task is on critical path
   * GC004: Critical Path Highlight
   */
  static isCriticalPath(task: GanttTaskRender): boolean {
    return task.critical === true || 
           task.criticalPath === true;
  }
}

