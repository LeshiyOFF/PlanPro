import { GanttTaskRender } from '../interfaces/GanttCanvas';

/**
 * Color scheme provider for Gantt task bars
 * GC002: Task Bar Colors
 */
export class GanttTaskColorProvider {
  /**
   * Get task bar fill color
   */
  static getTaskBarColor(task: GanttTaskRender): string {
    if (task.selected) {
      return task.color || '#0056b3';
    }
    
    if (task.milestone === true || task.type === 'milestone') {
      return '#ff6b6b'; // Красный для вех
    }
    
    if (task.summary === true || task.type === 'summary') {
      return '#6c757d'; // Серый для суммарных задач
    }
    
    if (task.critical === true || task.criticalPath === true) {
      return '#dc3545'; // Красный для критического пути
    }
    
    return task.color || '#28a745'; // Зеленый по умолчанию
  }

  /**
   * Get task bar border color
   */
  static getTaskBarBorderColor(task: GanttTaskRender): string {
    if (task.selected) {
      return '#003d7a'; // Темно-синий для выбранных
    }
    
    if (task.critical === true || task.criticalPath === true) {
      return '#721c24'; // Темно-красный для критического пути
    }
    
    return '#495057'; // Стандартный серый
  }

  /**
   * Get progress bar color
   */
  static getProgressColor(task: GanttTaskRender): string {
    if (task.critical === true || task.criticalPath === true) {
      return 'rgba(255, 193, 7, 0.7)'; // Желтый для критического пути
    }
    
    return 'rgba(40, 167, 69, 0.8)'; // Зеленый по умолчанию
  }

  /**
   * Adjust color opacity
   */
  static adjustColor(color: string, opacity: number): string {
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  }
}
