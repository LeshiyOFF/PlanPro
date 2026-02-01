import React from 'react';
import { ViewType, ViewConfig, ViewRoute, ViewSettings } from '@/types/ViewTypes';
import type { ReactElement } from 'react';

/**
 * Интерфейс для навигационного сервиса
 */
export interface INavigationService {
  getCurrentView(): ViewType | null;
  navigateToView(viewType: ViewType, settings?: Partial<ViewSettings>): void;
  canNavigateToView(viewType: ViewType): boolean;
  getAvailableViews(): ViewConfig[];
}

/**
 * Интерфейс для роутера представлений
 */
export interface IViewRouter {
  registerView(config: ViewConfig): void;
  unregisterView(viewType: ViewType): void;
  getViewConfig(viewType: ViewType): ViewConfig | null;
  getAllRoutes(): ViewRoute[];
  renderView(viewType: ViewType, settings?: Partial<ViewSettings>): ReactElement | null;
}

/**
 * Route Manager для управления View роутингом
 * Следует SOLID принципам:
 * - Single Responsibility: Только управление роутингом представлений
 * - Open/Closed: Расширяется через регистрацию новых View
 * - Dependency Inversion: Работает с интерфейсами
 */
export class ViewRouteManager implements IViewRouter, INavigationService {
  private static instance: ViewRouteManager;
  private views: Map<ViewType, ViewConfig> = new Map();
  private currentView: ViewType | null = null;
  private permissions: string[] = [];

  private constructor() {
    this.initializeDefaultViews();
  }

  /**
   * Singleton паттерн
   */
  public static getInstance(): ViewRouteManager {
    if (!ViewRouteManager.instance) {
      ViewRouteManager.instance = new ViewRouteManager();
    }
    return ViewRouteManager.instance;
  }

  /**
   * Инициализация представлений по умолчанию
   */
  private initializeDefaultViews(): void {
    const defaultViews: ViewConfig[] = [
      {
        id: 'gantt',
        type: ViewType.GANTT,
        title: 'Диаграмма Ганта',
        description: 'Временная шкала задач проекта',
        icon: 'bar-chart',
        path: '/gantt',
        component: null, // Будет установлен позже
        defaultSettings: {
          showCriticalPath: true,
          showProgress: true,
          showResources: true,
          zoom: 100
        }
      },
      {
        id: 'network',
        type: ViewType.NETWORK,
        title: 'Сетевой график',
        description: 'Сетевая диаграмма зависимостей задач',
        icon: 'share-nodes',
        path: '/network',
        component: null,
        defaultSettings: {
          showProgress: true,
          zoom: 100
        }
      },
      {
        id: 'task-sheet',
        type: ViewType.TASK_SHEET,
        title: 'Лист задач',
        description: 'Табличное представление всех задач',
        icon: 'table',
        path: '/task-sheet',
        component: null,
        defaultSettings: {
          showProgress: true
        }
      },
      {
        id: 'resource-sheet',
        type: ViewType.RESOURCE_SHEET,
        title: 'Лист ресурсов',
        description: 'Табличное представление всех ресурсов',
        icon: 'users',
        path: '/resource-sheet',
        component: null,
        defaultSettings: {}
      },
      {
        id: 'task-usage',
        type: ViewType.TASK_USAGE,
        title: 'Использование задач',
        description: 'Статистика использования задач',
        icon: 'bar-chart-2',
        path: '/task-usage',
        component: null,
        defaultSettings: {}
      },
      {
        id: 'resource-usage',
        type: ViewType.RESOURCE_USAGE,
        title: 'Использование ресурсов',
        description: 'Просмотр загрузки ресурсов',
        icon: 'pie-chart',
        path: '/resource-usage',
        component: null,
        defaultSettings: {}
      },
      {
        id: 'calendar',
        type: ViewType.CALENDAR,
        title: 'Календарь',
        description: 'Календарное представление задач',
        icon: 'calendar',
        path: '/calendar',
        component: null,
        defaultSettings: {}
      },
      {
        id: 'reports',
        type: ViewType.REPORTS,
        title: 'Отчеты',
        description: 'Отчеты и аналитика проекта',
        icon: 'file-text',
        path: '/reports',
        component: null,
        defaultSettings: {}
      },
      {
        id: 'tracking-gantt',
        type: ViewType.TRACKING_GANTT,
        title: 'Гант отслеживания',
        description: 'Диаграмма Ганта для отслеживания прогресса',
        icon: 'trending-up',
        path: '/tracking-gantt',
        component: null,
        defaultSettings: {
          showProgress: true,
          showCriticalPath: true
        }
      },
      {
        id: 'wbs',
        type: ViewType.WBS,
        title: 'СДР (WBS)',
        description: 'Иерархическая структура работ',
        icon: 'git-branch',
        path: '/wbs',
        component: null,
        defaultSettings: {}
      },
      {
        id: 'settings',
        type: ViewType.SETTINGS,
        title: 'Настройки',
        description: 'Настройки и предпочтения приложения',
        icon: 'settings',
        path: '/settings',
        component: null,
        defaultSettings: {}
      }
    ];

    defaultViews.forEach(view => this.registerView(view));
  }

  /**
   * Регистрация нового представления
   */
  public registerView(config: ViewConfig): void {
    this.views.set(config.type, config);
  }

  /**
   * Удаление представления
   */
  public unregisterView(viewType: ViewType): void {
    this.views.delete(viewType);
  }

  /**
   * Получение конфигурации представления
   */
  public getViewConfig(viewType: ViewType): ViewConfig | null {
    return this.views.get(viewType) || null;
  }

  /**
   * Получение всех зарегистрированных представлений
   */
  public getAvailableViews(): ViewConfig[] {
    return Array.from(this.views.values());
  }

  /**
   * Получение всех роутов
   */
  public getAllRoutes(): ViewRoute[] {
    const routes: ViewRoute[] = [];
    
    for (const config of this.views.values()) {
      routes.push({
        path: config.path,
        component: config.component,
        settings: config.defaultSettings || {},
        permissions: config.permissions
      });
    }
    
    return routes;
  }

  /**
   * Отрисовка представления
   */
  public renderView(viewType: ViewType, settings?: Partial<ViewSettings>): ReactElement | null {
    const config = this.getViewConfig(viewType);
    
    if (!config || !config.component) {
      return null;
    }

    const Component = config.component;
    const mergedSettings = { ...config.defaultSettings, ...settings };

    return React.createElement(Component, { viewType, settings: mergedSettings });
  }

  /**
   * Получение текущего представления
   */
  public getCurrentView(): ViewType | null {
    return this.currentView;
  }

  /**
   * Навигация к представлению
   */
  public navigateToView(viewType: ViewType, settings?: Partial<ViewSettings>): void {
    const config = this.getViewConfig(viewType);
    
    if (!config) {
      throw new Error(`View type ${viewType} is not registered`);
    }

    if (!this.canNavigateToView(viewType)) {
      throw new Error(`No permission to navigate to view ${viewType}`);
    }

    this.currentView = viewType;
    
    // Навигация через React Router
    window.history.pushState({}, '', config.path);
    
    // Сохранение настроек в localStorage
    if (settings) {
      localStorage.setItem(`view-settings-${viewType}`, JSON.stringify(settings));
    }
  }

  /**
   * Проверка возможности навигации
   */
  public canNavigateToView(viewType: ViewType): boolean {
    const config = this.getViewConfig(viewType);
    
    if (!config || !config.permissions) {
      return true;
    }

    return config.permissions.every(permission => 
      this.permissions.includes(permission)
    );
  }

  /**
   * Установка прав доступа
   */
  public setPermissions(permissions: string[]): void {
    this.permissions = permissions;
  }

  /**
   * Получение настроек представления
   */
  public getViewSettings(viewType: ViewType): Partial<ViewSettings> {
    const saved = localStorage.getItem(`view-settings-${viewType}`);
    
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    
    const config = this.getViewConfig(viewType);
    return config?.defaultSettings || {};
  }

  /**
   * Сохранение настроек представления
   */
  public saveViewSettings(viewType: ViewType, settings: Partial<ViewSettings>): void {
    localStorage.setItem(`view-settings-${viewType}`, JSON.stringify(settings));
  }
}

