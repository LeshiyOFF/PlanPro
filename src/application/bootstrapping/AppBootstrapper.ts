import { IAppBootstrapper } from './interfaces/IAppBootstrapper';
import { UserPreferencesService } from '@/components/userpreferences/services/UserPreferencesService';
import { ViewRouteManager } from '@/services/ViewRouteManager';
import { ViewType } from '@/types/ViewTypes';

/**
 * Сервис инициализации приложения (Bootstrapping)
 * Реализует логику определения начального состояния приложения при запуске.
 * Следует SOLID принципам:
 * - Single Responsibility: Только логика начальной загрузки.
 * - Dependency Inversion: Зависит от сервисов через их инстансы.
 * - Clean Architecture: Находится в слое Application.
 */
export class AppBootstrapper implements IAppBootstrapper {
  private readonly preferencesService: UserPreferencesService;
  private readonly routeManager: ViewRouteManager;

  constructor() {
    this.preferencesService = UserPreferencesService.getInstance();
    this.routeManager = ViewRouteManager.getInstance();
  }

  /**
   * Определяет начальный маршрут на основе настроек пользователя.
   * Если настройка отсутствует или представление не зарегистрировано, 
   * возвращает маршрут по умолчанию (Gantt).
   * 
   * @returns Путь для редиректа при старте
   */
  public async getInitialRoute(): Promise<string> {
    try {
      await this.preferencesService.ensureInitialized();
      const preferences = this.preferencesService.getGeneralPreferences();
      const defaultViewType = preferences.defaultView || ViewType.GANTT;
      
      // Получаем конфигурацию для выбранного представления
      const viewConfig = this.routeManager.getViewConfig(defaultViewType);
      
      // Если представление найдено, возвращаем его путь
      if (viewConfig && viewConfig.path) {
        return viewConfig.path;
      }
    } catch (error) {
      // В случае ошибки возвращаем базовый путь
      console.warn('[AppBootstrapper] Failed to determine default view, falling back to Gantt', error);
    }

    return '/gantt';
  }
}

