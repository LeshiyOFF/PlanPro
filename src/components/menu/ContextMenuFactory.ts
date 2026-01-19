import { ContextMenuType, ContextMenuItem } from '@/providers/MenuProvider';
import { TaskResourceContextMenuFactory } from './TaskResourceContextMenuFactory';
import { ProjectGanttContextMenuFactory } from './ProjectGanttContextMenuFactory';

/**
 * Основная фабрика контекстных меню
 */
export class ContextMenuFactory {
  
  /**
   * Контекстное меню для задачи
   */
  static createTaskContextMenu(onAction: (action: string) => void): ContextMenuItem[] {
    return TaskResourceContextMenuFactory.createTaskContextMenu(onAction);
  }

  /**
   * Контекстное меню для ресурса
   */
  static createResourceContextMenu(onAction: (action: string) => void): ContextMenuItem[] {
    return TaskResourceContextMenuFactory.createResourceContextMenu(onAction);
  }

  /**
   * Контекстное меню для проекта
   */
  static createProjectContextMenu(onAction: (action: string) => void): ContextMenuItem[] {
    return ProjectGanttContextMenuFactory.createProjectContextMenu(onAction);
  }

  /**
   * Контекстное меню для диаграммы Ганта
   */
  static createGanttContextMenu(onAction: (action: string) => void): ContextMenuItem[] {
    return ProjectGanttContextMenuFactory.createGanttContextMenu(onAction);
  }

  /**
   * Получить меню по типу
   */
  static getMenuByType(
    type: ContextMenuType,
    onAction: (action: string) => void
  ): ContextMenuItem[] {
    switch (type) {
      case 'task':
        return this.createTaskContextMenu(onAction);
      case 'resource':
        return this.createResourceContextMenu(onAction);
      case 'project':
        return this.createProjectContextMenu(onAction);
      case 'gantt':
        return this.createGanttContextMenu(onAction);
      default:
        return [];
    }
  }
}
