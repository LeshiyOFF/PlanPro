/**
 * Сервис генерации уникальных ID для ресурсов.
 * Обеспечивает единый формат во всех представлениях.
 * 
 * Clean Architecture: Domain Service
 * SOLID: Single Responsibility - только генерация ID ресурсов
 * 
 * FIX: Генерация через max(existingIds) + 1 для предотвращения дублирования
 * после удаления ресурсов.
 * 
 * @version 1.0.0
 */

/** Минимальный интерфейс ресурса для генерации ID */
interface ResourceWithId {
  id: string;
}

export class ResourceIdGenerator {
  private static readonly PREFIX = 'RES-'
  
  /**
   * Извлекает числовой порядок из ID ресурса.
   * Поддерживает форматы: RES-001, RES-1, RES001
   * 
   * @param id - ID ресурса
   * @returns числовой порядок или null
   */
  public static extractNumber(id: string): number | null {
    // Поддержка форматов: RES-001, RES-1, RES001
    const match = id.match(/^RES-?(\d+)$/i)
    return match ? parseInt(match[1], 10) : null
  }
  
  /**
   * Находит максимальный числовой суффикс среди существующих ID ресурсов.
   * @param existingResources - массив существующих ресурсов
   * @returns максимальный числовой суффикс или 0 если ресурсов нет
   */
  private static findMaxNumber(existingResources: ReadonlyArray<ResourceWithId>): number {
    let maxNum = 0
    for (const resource of existingResources) {
      const num = this.extractNumber(resource.id)
      if (num !== null && num > maxNum) {
        maxNum = num
      }
    }
    return maxNum
  }
  
  /**
   * Генерирует ID ресурса в формате RES-001, RES-002, ...
   * Использует max(existingIds) + 1 для гарантии уникальности.
   * 
   * @param existingResources - массив существующих ресурсов с полем id
   * @returns уникальный ID, гарантированно не существующий в списке
   */
  public static generate(existingResources: ReadonlyArray<ResourceWithId>): string {
    const maxNum = this.findMaxNumber(existingResources)
    const nextNum = maxNum + 1
    return `${this.PREFIX}${String(nextNum).padStart(3, '0')}`
  }
  
  /**
   * Проверяет соответствие ID стандартному формату.
   * @param id - ID для проверки
   * @returns true если формат корректный
   */
  public static isValid(id: string): boolean {
    return /^RES-?\d+$/i.test(id)
  }
  
  /**
   * Генерирует имя ресурса по умолчанию.
   * Использует max(existingIds) + 1 для согласованности с ID.
   * 
   * @param existingResources - массив существующих ресурсов
   * @param prefix - локализованный префикс (например, "Новый ресурс")
   * @returns имя ресурса
   */
  public static generateDefaultName(existingResources: ReadonlyArray<ResourceWithId>, prefix: string): string {
    const maxNum = this.findMaxNumber(existingResources)
    return `${prefix} ${maxNum + 1}`
  }
}
