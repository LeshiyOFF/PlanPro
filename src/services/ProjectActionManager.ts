/**
 * Event Flow Action Manager
 * Следует SOLID принципам и управляет высокоуровневыми действиями
 */

import { eventDispatcher } from '@/services/EventDispatcher';
import { BaseEvent, EventType, ProjectEventData, TaskEventData, ResourceEventData } from '@/types/EventFlowTypes';

/**
 * Менеджер действий проекта
 * Реализует высокоуровневые операции с Event Flow
 */
export class ProjectActionManager {
  private static instance: ProjectActionManager;

  private constructor() {}

  public static getInstance(): ProjectActionManager {
    if (!ProjectActionManager.instance) {
      ProjectActionManager.instance = new ProjectActionManager();
    }
    return ProjectActionManager.instance;
  }

  /**
   * Создать новый проект
   */
  public createNewProject(projectData: any): void {
    const event: BaseEvent = {
      id: `project_new_${Date.now()}`,
      type: EventType.PROJECT_CREATED,
      timestamp: new Date(),
      source: 'ProjectActionManager',
      data: {
        projectId: this.generateId(),
        projectData,
        changes: ['project_created']
      } as ProjectEventData
    };

    eventDispatcher.dispatch(event);
  }

  /**
   * Открыть проект
   */
  public openProject(filePath: string): void {
    const event: BaseEvent = {
      id: `project_open_${Date.now()}`,
      type: EventType.PROJECT_OPENED,
      timestamp: new Date(),
      source: 'ProjectActionManager',
      data: {
        projectId: this.generateId(),
        filePath,
        changes: ['project_opened']
      } as ProjectEventData
    };

    eventDispatcher.dispatch(event);
  }

  /**
   * Сохранить проект
   */
  public saveProject(projectId: string, filePath?: string): void {
    const event: BaseEvent = {
      id: `project_save_${Date.now()}`,
      type: EventType.PROJECT_SAVED,
      timestamp: new Date(),
      source: 'ProjectActionManager',
      data: {
        projectId,
        filePath,
        changes: ['project_saved']
      } as ProjectEventData
    };

    eventDispatcher.dispatch(event);
  }

  /**
   * Создать новую задачу
   */
  public createTask(taskData: any): void {
    const event: BaseEvent = {
      id: `task_create_${Date.now()}`,
      type: EventType.TASK_CREATED,
      timestamp: new Date(),
      source: 'ProjectActionManager',
      data: {
        taskId: this.generateId(),
        taskData,
        newValues: taskData
      } as TaskEventData
    };

    eventDispatcher.dispatch(event);
  }

  /**
   * Обновить задачу
   */
  public updateTask(taskId: string, oldValues: any, newValues: any): void {
    const event: BaseEvent = {
      id: `task_update_${Date.now()}`,
      type: EventType.TASK_UPDATED,
      timestamp: new Date(),
      source: 'ProjectActionManager',
      data: {
        taskId,
        oldValues,
        newValues
      } as TaskEventData
    };

    eventDispatcher.dispatch(event);
  }

  /**
   * Удалить задачу
   */
  public deleteTask(taskId: string, taskData: any): void {
    const event: BaseEvent = {
      id: `task_delete_${Date.now()}`,
      type: EventType.TASK_DELETED,
      timestamp: new Date(),
      source: 'ProjectActionManager',
      data: {
        taskId,
        taskData
      } as TaskEventData
    };

    eventDispatcher.dispatch(event);
  }

  /**
   * Выбрать задачи
   */
  public selectTasks(taskIds: string[]): void {
    const event: BaseEvent = {
      id: `task_select_${Date.now()}`,
      type: EventType.TASK_SELECTED,
      timestamp: new Date(),
      source: 'ProjectActionManager',
      data: {
        selectedTasks: taskIds
      } as TaskEventData
    };

    eventDispatcher.dispatch(event);
  }

  /**
   * Создать ресурс
   */
  public createResource(resourceData: any): void {
    const event: BaseEvent = {
      id: `resource_create_${Date.now()}`,
      type: EventType.RESOURCE_CREATED,
      timestamp: new Date(),
      source: 'ProjectActionManager',
      data: {
        resourceId: this.generateId(),
        resourceData
      } as ResourceEventData
    };

    eventDispatcher.dispatch(event);
  }

  /**
   * Назначить ресурсы
   */
  public assignResources(taskId: string, assignments: any[]): void {
    const event: BaseEvent = {
      id: `resource_assign_${Date.now()}`,
      type: EventType.RESOURCE_ASSIGNED,
      timestamp: new Date(),
      source: 'ProjectActionManager',
      data: {
        taskId,
        assignments
      } as ResourceEventData
    };

    eventDispatcher.dispatch(event);
  }

  /**
   * Переключить вид
   */
  public switchView(viewType: string, settings?: any): void {
    const event: BaseEvent = {
      id: `view_switch_${Date.now()}`,
      type: EventType.VIEW_CHANGED,
      timestamp: new Date(),
      source: 'ProjectActionManager',
      data: {
        viewType,
        settings
      }
    };

    eventDispatcher.dispatch(event);
  }

  /**
   * Обновить масштаб
   */
  public updateZoom(zoomLevel: number): void {
    const event: BaseEvent = {
      id: `view_zoom_${Date.now()}`,
      type: EventType.VIEW_ZOOMED,
      timestamp: new Date(),
      source: 'ProjectActionManager',
      data: {
        zoomLevel
      }
    };

    eventDispatcher.dispatch(event);
  }

  /**
   * Показать уведомление
   */
  public showNotification(
    type: 'info' | 'success' | 'warning' | 'error',
    title: string,
    message: string,
    actions?: any[]
  ): void {
    const eventType = type === 'success' ? EventType.NOTIFICATION_SUCCESS :
                    type === 'error' ? EventType.NOTIFICATION_ERROR :
                    type === 'warning' ? EventType.NOTIFICATION_WARNING :
                    EventType.NOTIFICATION_INFO;

    const event: BaseEvent = {
      id: `notification_${type}_${Date.now()}`,
      type: eventType,
      timestamp: new Date(),
      source: 'ProjectActionManager',
      data: {
        title,
        message,
        actions
      }
    };

    eventDispatcher.dispatch(event);
  }

  /**
   * Запустить валидацию
   */
  public validateProject(projectId: string): void {
    const event: BaseEvent = {
      id: `validation_start_${Date.now()}`,
      type: EventType.VALIDATION_STARTED,
      timestamp: new Date(),
      source: 'ProjectActionManager',
      data: {
        projectId
      }
    };

    eventDispatcher.dispatch(event);

    // Имитация завершения валидации
    setTimeout(() => {
      const completionEvent: BaseEvent = {
        id: `validation_complete_${Date.now()}`,
        type: EventType.VALIDATION_COMPLETED,
        timestamp: new Date(),
        source: 'ProjectActionManager',
        data: {
          projectId,
          validationResult: {
            isValid: true,
            errors: [],
            warnings: []
          }
        }
      };

      eventDispatcher.dispatch(completionEvent);
    }, 1000);
  }

  /**
   * Выполнить действие меню
   */
  public executeMenuAction(menuItem: string, data?: any): void {
    const event: BaseEvent = {
      id: `menu_${menuItem}_${Date.now()}`,
      type: EventType.MENU_ACTION,
      timestamp: new Date(),
      source: 'ProjectActionManager',
      data: {
        menuItem,
        data
      }
    };

    eventDispatcher.dispatch(event);
  }

  /**
   * Обработать сочетание клавиш
   */
  public handleKeyboardShortcut(shortcut: string, data?: any): void {
    const event: BaseEvent = {
      id: `shortcut_${shortcut}_${Date.now()}`,
      type: EventType.UI_KEYBOARD_SHORTCUT,
      timestamp: new Date(),
      source: 'ProjectActionManager',
      data: {
        shortcut,
        data
      }
    };

    eventDispatcher.dispatch(event);
  }

  /**
   * Генерация уникального ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Экспорт синглтона
export const projectActionManager = ProjectActionManager.getInstance();

