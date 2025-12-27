/**
 * Адаптер для консольного вывода
 * Абстрагирует console API для тестирования и production
 */
export class ConsoleAdapter {
  private static isProduction = false

  /**
   * Установка режима production
   */
  static setProduction(isProd: boolean): void {
    ConsoleAdapter.isProduction = isProd
  }

  /**
   * Логирование уровня debug
   */
  static debug(...args: unknown[]): void {
    if (!ConsoleAdapter.isProduction) {
      console.log(...args)
    }
  }

  /**
   * Логирование уровня info
   */
  static info(...args: unknown[]): void {
    console.log(...args)
  }

  /**
   * Логирование уровня warn
   */
  static warn(...args: unknown[]): void {
    console.warn(...args)
  }

  /**
   * Логирование уровня error
   */
  static error(...args: unknown[]): void {
    console.error(...args)
  }
}
