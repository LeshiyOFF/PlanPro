import { BaseAction } from './BaseAction';
import { EventType } from '@/types/Master_Functionality_Catalog';
import { logger } from '@/utils/logger';
import { MainWindowDependencies } from './registry/BaseActionRegistry';

/**
 * Action для создания нового проекта
 */
export class NewProjectAction extends BaseAction {
  public readonly id = 'new-project';
  public readonly name = 'Новый проект';
  public readonly description = 'Создать новый проект';

  constructor(private dependencies: MainWindowDependencies) {
    super({ shortcut: 'Ctrl+N', icon: 'new' });
  }

  public canExecute(): boolean {
    return true;
  }

  public async execute(): Promise<void> {
    this.logAction(EventType.FILE_ACTION, { action: 'new' });
    const fileOps = this.dependencies.fileOperations;
    if (fileOps) {
      await fileOps.createNewProject();
    } else {
      const createProject = this.dependencies.projectProvider.createProject;
      if (createProject) {
        await createProject('');
      } else {
        logger.warning('NewProjectAction: ни fileOperations, ни createProject не доступны');
      }
    }
  }
}

/**
 * Action для открытия проекта
 */
export class OpenProjectAction extends BaseAction {
  public readonly id = 'open-project';
  public readonly name = 'Открыть проект';
  public readonly description = 'Открыть существующий проект';

  constructor(private dependencies: MainWindowDependencies) {
    super({ shortcut: 'Ctrl+O', icon: 'open' });
  }

  public canExecute(): boolean {
    return true;
  }

  public async execute(): Promise<void> {
    this.logAction(EventType.FILE_ACTION, { action: 'open' });
    if (this.dependencies.fileOperations) {
      await this.dependencies.fileOperations.openProject();
    } else {
      logger.info('Open project dialog requested (fallback)');
    }
  }
}

/**
 * Action для сохранения проекта
 */
export class SaveProjectAction extends BaseAction {
  public readonly id = 'save-project';
  public readonly name = 'Сохранить проект';
  public readonly description = 'Сохранить текущий проект';

  constructor(private dependencies: MainWindowDependencies) {
    super({ shortcut: 'Ctrl+S', icon: 'save' });
  }

  public canExecute(): boolean {
    return !!this.dependencies.projectProvider.currentProject || !!this.dependencies.fileOperations;
  }

  public async execute(): Promise<void> {
    this.logAction(EventType.FILE_ACTION, { action: 'save' });
    const fileOps = this.dependencies.fileOperations;
    if (fileOps?.saveProject) {
      await fileOps.saveProject();
    } else if (this.dependencies.projectProvider?.currentProject && this.dependencies.projectProvider?.saveProject) {
      await this.dependencies.projectProvider.saveProject(this.dependencies.projectProvider.currentProject);
    }
  }
}

/**
 * Action для сохранения проекта как...
 */
export class SaveProjectAsAction extends BaseAction {
  public readonly id = 'save-project-as';
  public readonly name = 'Сохранить проект как...';
  public readonly description = 'Сохранить текущий проект под новым именем';

  constructor(private dependencies: MainWindowDependencies) {
    super({ shortcut: 'F12', icon: 'save' });
  }

  public canExecute(): boolean {
    return !!this.dependencies.projectProvider.currentProject || !!this.dependencies.fileOperations;
  }

  public async execute(): Promise<void> {
    this.logAction(EventType.FILE_ACTION, { action: 'save-as' });
    if (this.dependencies.fileOperations) {
      await this.dependencies.fileOperations.saveProjectAs();
    }
  }
}

/**
 * Action для печати
 */
export class PrintAction extends BaseAction {
  public readonly id = 'print';
  public readonly name = 'Печать';
  public readonly description = 'Напечатать текущий вид';

  constructor() {
    super({ shortcut: 'Ctrl+P', icon: 'print' });
  }

  public canExecute(): boolean {
    return true;
  }

  public async execute(): Promise<void> {
    this.logAction(EventType.FILE_ACTION, { action: 'print' });
    window.print();
    logger.info('Print executed');
  }
}

