/**
 * Интерфейсы для тестирования командной строки
 */
export interface CommandLineTestResult {
  /** Успешность теста */
  success: boolean;
  /** Сообщение об ошибке если есть */
  errorMessage?: string;
  /** Предупреждения */
  warnings?: string[];
  /** Результаты отдельных тестов */
  testResults: IndividualTestResult[];
  /** Общее время выполнения в миллисекундах */
  duration: number;
}

export interface IndividualTestResult {
  /** Название теста */
  testName: string;
  /** Успешность теста */
  success: boolean;
  /** Время выполнения в миллисекундах */
  duration: number;
  /** Дополнительная информация */
  details?: string;
  /** Сообщение об ошибке если есть */
  errorMessage?: string;
}

export interface CommandLineTestOptions {
  /** Путь к JAR файлу для тестирования */
  jarPath?: string;
  /** Тестировать системную Java */
  testSystemJava?: boolean;
  /** Тестировать embedded JRE */
  testEmbeddedJre?: boolean;
  /** Таймаут каждого теста в миллисекундах */
  testTimeout?: number;
  /** Подробный вывод */
  verbose?: boolean;
}