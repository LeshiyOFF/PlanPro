import { BaseAction } from './BaseAction'
import { EventType } from '@/types/Master_Functionality_Catalog'
import { logger } from '@/utils/logger'
import { useProjectStore } from '@/store/projectStore'
import { createTaskFromView } from '@/store/project/interfaces'
import type { Resource } from '@/types/resource-types'

/**
 * Интерфейс для провайдера проекта
 */
interface ProjectProvider {
  currentProject: { id: string } | null;
}

/**
 * Action для создания новой задачи
 */
export class NewTaskAction extends BaseAction {
  public readonly id = 'new-task'
  public readonly name = 'Новая задача'
  public readonly description = 'Создать новую задачу'

  constructor(private projectProvider: ProjectProvider) {
    super({ shortcut: 'Ins', icon: 'task' })
  }

  public canExecute(): boolean {
    return !!this.projectProvider.currentProject
  }

  public async execute(): Promise<void> {
    if (!this.canExecute()) {
      throw new Error('Нет активного проекта')
    }

    this.logAction(EventType.TASK_ACTION, { action: 'new-task' })

    const start = new Date()
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
    const newTask = createTaskFromView({
      id: `task_${Date.now()}`,
      name: 'Новая задача',
      startDate: start,
      endDate: end,
      progress: 0,
    })
    newTask.isMilestone = false

    useProjectStore.getState().addTask(newTask)
    logger.info('New task created successfully')
  }
}

/**
 * Action для создания нового ресурса
 */
export class NewResourceAction extends BaseAction {
  public readonly id = 'new-resource'
  public readonly name = 'Новый ресурс'
  public readonly description = 'Создать новый ресурс'

  constructor(private projectProvider: ProjectProvider) {
    super({ icon: 'resource' })
  }

  public canExecute(): boolean {
    return !!this.projectProvider.currentProject
  }

  public async execute(): Promise<void> {
    if (!this.canExecute()) {
      throw new Error('Нет активного проекта')
    }

    this.logAction(EventType.RESOURCE_ACTION, { action: 'new-resource' })

    const newResource: Resource = {
      id: `resource_${Date.now()}`,
      name: 'Новый ресурс',
      type: 'Work',
      maxUnits: 100,
      standardRate: 0,
      overtimeRate: 0,
      costPerUse: 0,
    }

    useProjectStore.getState().addResource(newResource)
    logger.info('New resource created successfully')
  }
}
