/**
 * Утилита для конвертации и нормализации units/maxUnits ресурсов.
 * 
 * СТАНДАРТ ФОРМАТА (v4.0):
 * - Внутренний формат: коэффициент (1.0 = 100%, 2.0 = 200%, 0.5 = 50%)
 * - Внешний формат (UI): процент (100, 200, 50)
 * - Java Core API: коэффициент (1.0 = 100%)
 * 
 * Этот конвертер обеспечивает единообразие во всех компонентах системы.
 * 
 * @version 4.0 - Централизованный конвертер для всего проекта
 */
export class ResourceUnitsConverter {
  
  /** Порог для определения формата: значения > 10 считаются процентами */
  private static readonly PERCENT_THRESHOLD = 10
  
  /** Значение по умолчанию: 100% в формате коэффициента */
  public static readonly DEFAULT_UNITS: number = 1.0
  
  /** Максимальное значение по умолчанию: 100% в формате коэффициента */
  public static readonly DEFAULT_MAX_UNITS: number = 1.0

  /**
   * Конвертирует значение в коэффициент (для внутренних вычислений).
   * Автоматически определяет исходный формат.
   * 
   * @param value Значение в любом формате (100 или 1.0)
   * @returns Коэффициент (1.0 = 100%)
   * 
   * @example
   * toCoefficient(100)  // → 1.0
   * toCoefficient(200)  // → 2.0
   * toCoefficient(1.0)  // → 1.0
   * toCoefficient(2.0)  // → 2.0
   */
  public static toCoefficient(value: number | undefined | null): number {
    if (value == null) {
      return ResourceUnitsConverter.DEFAULT_UNITS
    }
    
    // Значения > 10 интерпретируются как проценты
    if (value > ResourceUnitsConverter.PERCENT_THRESHOLD) {
      return value / 100
    }
    
    return value
  }

  /**
   * Конвертирует значение в проценты (для отображения в UI).
   * Автоматически определяет исходный формат.
   * 
   * @param value Значение в любом формате (100 или 1.0)
   * @returns Процент (100 = 100%)
   * 
   * @example
   * toPercent(1.0)   // → 100
   * toPercent(2.0)   // → 200
   * toPercent(100)   // → 100
   * toPercent(200)   // → 200
   */
  public static toPercent(value: number | undefined | null): number {
    if (value == null) {
      return ResourceUnitsConverter.DEFAULT_UNITS * 100
    }
    
    // Значения ≤ 10 интерпретируются как коэффициенты
    if (value <= ResourceUnitsConverter.PERCENT_THRESHOLD) {
      return Math.round(value * 100)
    }
    
    return Math.round(value)
  }

  /**
   * Проверяет, является ли значение коэффициентом (≤ 10).
   */
  public static isCoefficient(value: number): boolean {
    return value <= ResourceUnitsConverter.PERCENT_THRESHOLD
  }

  /**
   * Проверяет, является ли значение процентом (> 10).
   */
  public static isPercent(value: number): boolean {
    return value > ResourceUnitsConverter.PERCENT_THRESHOLD
  }

  /**
   * Сравнивает два значения с автоматической нормализацией.
   * Возвращает true если первое значение больше второго.
   * 
   * @param value1 Первое значение (любой формат)
   * @param value2 Второе значение (любой формат)
   * @returns true если value1 > value2 (в нормализованном виде)
   */
  public static isGreater(
    value1: number | undefined | null,
    value2: number | undefined | null,
  ): boolean {
    const coeff1 = ResourceUnitsConverter.toCoefficient(value1)
    const coeff2 = ResourceUnitsConverter.toCoefficient(value2)
    return coeff1 > coeff2
  }

  /**
   * Вычисляет разницу между двумя значениями в процентах.
   * Используется для отображения изменений в UI.
   * 
   * @param value1 Первое значение (любой формат)
   * @param value2 Второе значение (любой формат)
   * @returns Разница в процентах (value1 - value2)
   */
  public static differencePercent(
    value1: number | undefined | null,
    value2: number | undefined | null,
  ): number {
    const percent1 = ResourceUnitsConverter.toPercent(value1)
    const percent2 = ResourceUnitsConverter.toPercent(value2)
    return percent1 - percent2
  }

  /**
   * Нормализует ID ресурса к строке.
   * Решает проблему сравнения ID разных типов (number vs string).
   */
  public static normalizeResourceId(id: string | number | undefined | null): string {
    if (id == null) {
      return ''
    }
    return String(id)
  }
}
