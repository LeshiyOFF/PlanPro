/**
 * Интерфейс для зависимостей MainWindow
 */
export interface MainWindowDependencies {
  projectProvider: any;
  appStore: any;
  navigationProvider: any;
  fileOperations?: {
    createNewProject: () => Promise<void>;
    openProject: () => Promise<void>;
    saveProject: () => Promise<void>;
    saveProjectAs: () => Promise<void>;
  };
}

/**
 * Базовый класс для регистрации действий
 */
export abstract class BaseActionRegistry {
  protected actionManager: any;
  protected dependencies: MainWindowDependencies;

  constructor(actionManager: any, dependencies: MainWindowDependencies) {
    this.actionManager = actionManager;
    this.dependencies = dependencies;
  }

  /**
   * Регистрация всех действий
   */
  public abstract registerAllActions(): void;

  /**
   * Удаление всех действий
   */
  public unregisterAllActions(): void {
    const allActions = this.actionManager.getAllActions();
    
    allActions.forEach(action => {
      this.actionManager.unregisterAction(action.id);
    });
  }

  /**
   * Перерегистрация всех действий
   */
  public reregisterAllActions(): void {
    this.unregisterAllActions();
    this.registerAllActions();
  }
}

