import { logger } from '@/utils/logger'
import { useProjectStore } from '@/store/projectStore'
import { selectionService } from './SelectionService'
import { TaskIdGenerator } from '@/domain/tasks/services/TaskIdGenerator'

/**
 * Тип контекстного действия
 */
export type ContextActionType =
  | 'task-edit' | 'task-delete' | 'task-duplicate' | 'task-info'
  | 'resource-edit' | 'resource-delete' | 'resource-assign' | 'resource-info'
  | 'project-save' | 'project-export' | 'project-info'
  | 'gantt-zoom-in' | 'gantt-zoom-out' | 'gantt-fit';

/**
 * Сервис обработки контекстных действий
 * Централизует логику контекстных меню
 */
class ContextActionService {
  private static instance: ContextActionService

  private constructor() {}

  static getInstance(): ContextActionService {
    if (!ContextActionService.instance) {
      ContextActionService.instance = new ContextActionService()
    }
    return ContextActionService.instance
  }

  /**
   * Выполняет контекстное действие
   */
  async executeAction(action: ContextActionType): Promise<void> {
    logger.dialog('Context action', { action }, 'ContextMenu')

    try {
      if (action.startsWith('task-')) {
        await this.handleTaskAction(action)
      } else if (action.startsWith('resource-')) {
        await this.handleResourceAction(action)
      } else if (action.startsWith('project-')) {
        await this.handleProjectAction(action)
      } else if (action.startsWith('gantt-')) {
        await this.handleGanttAction(action)
      }
    } catch (error) {
      logger.dialogError('Context action failed', error instanceof Error ? error : String(error), 'ContextMenu')
    }
  }

  /**
   * Обрабатывает действия с задачами
   */
  private async handleTaskAction(action: string): Promise<void> {
    const selection = selectionService.getSelection()
    const store = useProjectStore.getState()

    switch (action) {
      case 'task-edit':
        if (selection.ids.length > 0) {
          window.dispatchEvent(new CustomEvent('task:edit', { detail: { taskId: selection.ids[0] } }))
        }
        break
      case 'task-delete':
        if (selection.ids.length > 0) {
          selection.ids.forEach(id => store.deleteTask(id))
        }
        break
      case 'task-duplicate':
        if (selection.ids.length > 0) {
          const task = store.tasks.find(t => t.id === selection.ids[0])
          if (task) {
            const newId = TaskIdGenerator.generate(store.tasks)
            store.addTask({ ...task, id: newId, name: `${task.name} (копия)` })
          }
        }
        break
      case 'task-info':
        if (selection.ids.length > 0) {
          window.dispatchEvent(new CustomEvent('task:show-info', { detail: { taskId: selection.ids[0] } }))
        }
        break
    }
  }

  /**
   * Обрабатывает действия с ресурсами
   */
  private async handleResourceAction(action: string): Promise<void> {
    const selection = selectionService.getSelection()
    const store = useProjectStore.getState()

    switch (action) {
      case 'resource-edit':
        if (selection.ids.length > 0) {
          window.dispatchEvent(new CustomEvent('resource:edit', { detail: { resourceId: selection.ids[0] } }))
        }
        break
      case 'resource-delete':
        if (selection.ids.length > 0) {
          selection.ids.forEach(id => store.deleteResource(id))
        }
        break
      case 'resource-assign':
        if (selection.ids.length > 0) {
          window.dispatchEvent(new CustomEvent('resource:assign', { detail: { resourceId: selection.ids[0] } }))
        }
        break
      case 'resource-info':
        if (selection.ids.length > 0) {
          window.dispatchEvent(new CustomEvent('resource:show-info', { detail: { resourceId: selection.ids[0] } }))
        }
        break
    }
  }

  /**
   * Обрабатывает действия с проектом
   */
  private async handleProjectAction(action: string): Promise<void> {
    switch (action) {
      case 'project-save':
        window.dispatchEvent(new CustomEvent('file:save'))
        break
      case 'project-export':
        window.dispatchEvent(new CustomEvent('file:export'))
        break
      case 'project-info':
        window.dispatchEvent(new CustomEvent('project:show-info'))
        break
    }
  }

  /**
   * Обрабатывает действия с диаграммой Ганта
   */
  private async handleGanttAction(action: string): Promise<void> {
    switch (action) {
      case 'gantt-zoom-in':
        window.dispatchEvent(new CustomEvent('gantt:zoom-in'))
        break
      case 'gantt-zoom-out':
        window.dispatchEvent(new CustomEvent('gantt:zoom-out'))
        break
      case 'gantt-fit':
        window.dispatchEvent(new CustomEvent('gantt:fit-to-width'))
        break
    }
  }
}

export { ContextActionService }
export const contextActionService = ContextActionService.getInstance()
