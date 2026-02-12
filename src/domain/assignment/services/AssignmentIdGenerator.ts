/**
 * Сервис генерации уникальных ID для назначений ресурсов на задачи.
 * Обеспечивает единый формат во всех представлениях.
 *
 * Clean Architecture: Domain Service
 * SOLID: Single Responsibility - только генерация ID назначений
 *
 * Использует детерминированный подход: ID формируется на основе
 * taskId и resourceId, что гарантирует уникальность и предотвращает
 * дублирование назначений.
 *
 * @version 1.0.0
 */

export class AssignmentIdGenerator {
  private static readonly PREFIX = 'ASSIGN-'

  /**
   * Генерирует ID назначения на основе taskId и resourceId.
   * Формат: ASSIGN-{taskId}-{resourceId}
   *
   * Детерминированный подход обеспечивает:
   * - Гарантированную уникальность для пары задача-ресурс
   * - Защиту от дублирования назначений
   * - Возможность восстановления связей из ID
   *
   * @param taskId - ID задачи
   * @param resourceId - ID ресурса
   * @returns уникальный ID назначения
   */
  public static generate(taskId: string, resourceId: string): string {
    const normalizedTaskId = this.normalizeId(taskId)
    const normalizedResourceId = this.normalizeId(resourceId)
    return `${this.PREFIX}${normalizedTaskId}-${normalizedResourceId}`
  }

  /**
   * Нормализует ID для использования в составном ключе.
   * Заменяет неалфавитно-цифровые символы на подчёркивание.
   *
   * @param id - исходный ID
   * @returns нормализованный ID
   */
  private static normalizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9]/g, '_')
  }

  /**
   * Проверяет соответствие ID стандартному формату.
   * @param id - ID для проверки
   * @returns true если формат корректный
   */
  public static isValid(id: string): boolean {
    return /^ASSIGN-.+-.+$/.test(id)
  }

  /**
   * Извлекает taskId из ID назначения.
   * @param id - ID назначения
   * @returns taskId или null если формат некорректный
   */
  public static extractTaskId(id: string): string | null {
    const match = id.match(/^ASSIGN-(.+)-(.+)$/)
    return match ? match[1] : null
  }

  /**
   * Извлекает resourceId из ID назначения.
   * @param id - ID назначения
   * @returns resourceId или null если формат некорректный
   */
  public static extractResourceId(id: string): string | null {
    const match = id.match(/^ASSIGN-(.+)-(.+)$/)
    return match ? match[2] : null
  }
}
