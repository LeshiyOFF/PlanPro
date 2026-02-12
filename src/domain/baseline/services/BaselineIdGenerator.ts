/**
 * Сервис генерации уникальных ID для baseline'ов.
 * Обеспечивает единый формат во всех представлениях.
 *
 * Clean Architecture: Domain Service
 * SOLID: Single Responsibility - только генерация ID baseline
 *
 * Генерация через max(existingIds) + 1 для предотвращения дублирования
 * после удаления baseline'ов.
 *
 * @version 1.0.0
 */

/** Минимальный интерфейс baseline для генерации ID */
interface BaselineWithId {
  id: string;
}

export class BaselineIdGenerator {
  private static readonly PREFIX = 'BL-'

  /**
   * Извлекает числовой порядок из ID baseline.
   * Поддерживает форматы: BL-001, BL-1, BL001
   *
   * @param id - ID baseline
   * @returns числовой порядок или null
   */
  public static extractNumber(id: string): number | null {
    const match = id.match(/^BL-?(\d+)$/i)
    return match ? parseInt(match[1], 10) : null
  }

  /**
   * Находит максимальный числовой суффикс среди существующих ID baseline'ов.
   * @param existingBaselines - массив существующих baseline'ов
   * @returns максимальный числовой суффикс или 0 если baseline'ов нет
   */
  private static findMaxNumber(existingBaselines: ReadonlyArray<BaselineWithId>): number {
    let maxNum = 0
    for (const baseline of existingBaselines) {
      const num = this.extractNumber(baseline.id)
      if (num !== null && num > maxNum) {
        maxNum = num
      }
    }
    return maxNum
  }

  /**
   * Генерирует ID baseline в формате BL-001, BL-002...
   * Использует max(existingIds) + 1 для гарантии уникальности.
   *
   * @param existingBaselines - массив существующих baseline'ов с полем id
   * @returns уникальный ID, гарантированно не существующий в списке
   */
  public static generate(existingBaselines: ReadonlyArray<BaselineWithId>): string {
    const maxNum = this.findMaxNumber(existingBaselines)
    const nextNum = maxNum + 1
    return `${this.PREFIX}${String(nextNum).padStart(3, '0')}`
  }

  /**
   * Проверяет соответствие ID стандартному формату.
   * @param id - ID для проверки
   * @returns true если формат корректный
   */
  public static isValid(id: string): boolean {
    return /^BL-?\d+$/i.test(id)
  }

  /**
   * Генерирует имя baseline по умолчанию.
   * Использует max(existingIds) + 1 для согласованности с ID.
   *
   * @param existingBaselines - массив существующих baseline'ов
   * @param prefix - локализованный префикс (например, "Baseline")
   * @returns имя baseline
   */
  public static generateDefaultName(
    existingBaselines: ReadonlyArray<BaselineWithId>,
    prefix: string,
  ): string {
    const maxNum = this.findMaxNumber(existingBaselines)
    return `${prefix} ${maxNum + 1}`
  }
}
