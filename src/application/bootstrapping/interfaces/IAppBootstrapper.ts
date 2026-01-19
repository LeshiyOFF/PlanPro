/**
 * Интерфейс сервиса инициализации приложения (Bootstrapping)
 * Следует SOLID: Interface Segregation Principle
 */
export interface IAppBootstrapper {
  /**
   * Возвращает начальный маршрут (путь) на основе настроек пользователя
   * @returns Путь (например, "/gantt" или "/reports")
   */
  getInitialRoute(): Promise<string>;
}

