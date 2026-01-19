
/**
 * Интерфейс бутстраппера приложения
 * Отвечает за управление цепочкой запуска всех компонентов
 */
export interface IAppBootstrapper {
  /**
   * Запуск процесса инициализации приложения
   */
  bootstrap(): Promise<void>;

  /**
   * Получение текущего состояния инициализации
   */
  getInitializationStatus(): BootstrappingStatus;
}

/**
 * Состояния процесса инициализации
 */
export enum BootstrappingStatus {
  IDLE = 'IDLE',
  STARTING_JAVA = 'STARTING_JAVA',
  WAITING_FOR_API = 'WAITING_FOR_API',
  READY = 'READY',
  FAILED = 'FAILED'
}

