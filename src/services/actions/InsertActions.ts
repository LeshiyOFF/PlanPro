import { BaseAction } from './BaseAction';
import type { UIEvent } from '@/types/Master_Functionality_Catalog';
import { EventType } from '@/types/Master_Functionality_Catalog';
import { logger } from '@/utils/logger';

/**
 * Action для создания новой задачи
 */
export class NewTaskAction extends BaseAction {
  public readonly id = 'new-task';
  public readonly name = 'Новая задача';
  public readonly description = 'Создать новую задачу';

  constructor(private projectProvider: any) {
    super({ shortcut: 'Ins', icon: 'task' });
  }

  public canExecute(): boolean {
    return !!this.projectProvider.currentProject;
  }

  public async execute(): Promise<void> {
    if (!this.canExecute()) {
      throw new Error('Нет активного проекта');
    }

    this.logAction(EventType.TASK_ACTION, { action: 'new-task' });
    // TODO: Implement new task creation
    logger.info('New task creation requested');
  }
}

/**
 * Action для создания нового ресурса
 */
export class NewResourceAction extends BaseAction {
  public readonly id = 'new-resource';
  public readonly name = 'Новый ресурс';
  public readonly description = 'Создать новый ресурс';

  constructor(private projectProvider: any) {
    super({ icon: 'resource' });
  }

  public canExecute(): boolean {
    return !!this.projectProvider.currentProject;
  }

  public async execute(): Promise<void> {
    if (!this.canExecute()) {
      throw new Error('Нет активного проекта');
    }

    this.logAction(EventType.RESOURCE_ACTION, { action: 'new-resource' });
    // TODO: Implement new resource creation
    logger.info('New resource creation requested');
  }
}
