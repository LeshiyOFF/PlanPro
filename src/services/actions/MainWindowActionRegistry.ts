import { getActionManager } from './ActionManager';
import {
  MainWindowDependencies,
  ProjectProviderPort,
  NavigationProviderPort,
  AppStorePort
} from './registry/BaseActionRegistry';
import { FileActionRegistry } from './registry/FileActionRegistry';
import { EditActionRegistry } from './registry/EditActionRegistry';
import { ViewActionRegistry } from './registry/ViewActionRegistry';
import { InsertActionRegistry, ToolsActionRegistry } from './registry/InsertAndToolsRegistry';
import { ActionRegistryValidator } from './registry/ActionRegistryValidator';
import { logger } from '@/utils/logger';

/**
 * Сервис для регистрации действий MainWindow
 * Следует SOLID принципам:
 * - Single Responsibility: Только регистрация действий MainWindow
 * - Dependency Injection: Принимает зависимости через конструктор
 */
export class MainWindowActionRegistry {
  private actionManager = getActionManager();
  private validator: ActionRegistryValidator;

  // Реестры категорий
  private fileRegistry: FileActionRegistry;
  private editRegistry: EditActionRegistry;
  private viewRegistry: ViewActionRegistry;
  private insertRegistry: InsertActionRegistry;
  private toolsRegistry: ToolsActionRegistry;

  constructor(dependencies: MainWindowDependencies) {
    this.validator = new ActionRegistryValidator(this.actionManager);
    
    // Инициализация реестров
    this.fileRegistry = new FileActionRegistry(this.actionManager, dependencies);
    this.editRegistry = new EditActionRegistry(this.actionManager, dependencies);
    this.viewRegistry = new ViewActionRegistry(this.actionManager, dependencies);
    this.insertRegistry = new InsertActionRegistry(this.actionManager, dependencies);
    this.toolsRegistry = new ToolsActionRegistry(this.actionManager, dependencies);
  }

  /**
   * Регистрация всех действий MainWindow
   */
  public registerAllActions(): void {
    this.fileRegistry.registerAllActions();
    this.editRegistry.registerAllActions();
    this.viewRegistry.registerAllActions();
    this.insertRegistry.registerAllActions();
    this.toolsRegistry.registerAllActions();

    logger.info('All MainWindow actions registered successfully');
  }

  /**
   * Удаление всех действий MainWindow
   */
  public unregisterAllActions(): void {
    this.fileRegistry.unregisterAllActions();
    this.editRegistry.unregisterAllActions();
    this.viewRegistry.unregisterAllActions();
    this.insertRegistry.unregisterAllActions();
    this.toolsRegistry.unregisterAllActions();

    logger.info('All MainWindow actions unregistered');
  }

  /**
   * Перерегистрация всех действий
   */
  public reregisterAllActions(): void {
    this.unregisterAllActions();
    this.registerAllActions();
  }

  /**
   * Получение статистики регистрации
   */
  public getRegistrationStats() {
    return this.validator.getRegistrationStats();
  }

  /**
   * Валидация регистрации
   */
  public validateRegistration() {
    return this.validator.validateRegistration();
  }
}

/**
 * Фабрика для создания и инициализации регистраций
 */
export class MainWindowActionRegistryFactory {
  /**
   * Создание и инициализация регистраций с зависимостями
   */
  static createAndInitialize(dependencies: MainWindowDependencies): MainWindowActionRegistry {
    const registry = new MainWindowActionRegistry(dependencies);
    registry.registerAllActions();
    
    // Валидация регистрации
    const validation = registry.validateRegistration();
    if (!validation.isValid) {
      logger.error('MainWindow action registration validation failed:', validation.errors);
      throw new Error(`Action registration validation failed: ${validation.errors.join(', ')}`);
    }
    
    if (validation.warnings.length > 0) {
      logger.warn('MainWindow action registration warnings:', validation.warnings);
    }
    
    return registry;
  }

  /**
   * Получение зависимостей из провайдеров
   */
  static extractDependencies(
    projectProvider: ProjectProviderPort,
    appStore: AppStorePort,
    navigationProvider: NavigationProviderPort
  ): MainWindowDependencies {
    return {
      projectProvider,
      appStore,
      navigationProvider
    };
  }
}

