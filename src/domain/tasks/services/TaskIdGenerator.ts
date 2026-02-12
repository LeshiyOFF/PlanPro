/**
 * Сервис генерации уникальных ID для задач.
 * Обеспечивает единый формат во всех представлениях.
 * 
 * Clean Architecture: Domain Service
 * SOLID: Single Responsibility - только генерация ID
 * 
 * FIX: Генерация через max(existingIds) + 1 для предотвращения дублирования
 * после удаления задач.
 * 
 * @version 1.1.0
 */

/** Минимальный интерфейс задачи для генерации ID */
interface TaskWithId {
  id: string;
}

export class TaskIdGenerator {
  private static readonly PREFIX = 'TASK'
  
  /**
   * Находит максимальный числовой суффикс среди существующих ID задач.
   * @param existingTasks - массив существующих задач
   * @returns максимальный числовой суффикс или 0 если задач нет
   */
  private static findMaxNumber(existingTasks: ReadonlyArray<TaskWithId>): number {
    let maxNum = 0
    for (const task of existingTasks) {
      const num = this.extractNumber(task.id)
      if (num !== null && num > maxNum) {
        maxNum = num
      }
    }
    return maxNum
  }
  
  /**
   * Возвращает следующий номер для новой задачи (max + 1).
   * Используется для i18n шаблонов с placeholder {{number}}.
   * 
   * @param existingTasks - массив существующих задач
   * @returns следующий номер
   */
  public static getNextNumber(existingTasks: ReadonlyArray<TaskWithId>): number {
    return this.findMaxNumber(existingTasks) + 1
  }
  
  /**
   * Генерирует ID задачи в формате TASK1, TASK2, ...
   * Использует max(existingIds) + 1 для гарантии уникальности.
   * 
   * @param existingTasks - массив существующих задач с полем id
   * @returns уникальный ID, гарантированно не существующий в списке
   */
  public static generate(existingTasks: ReadonlyArray<TaskWithId>): string {
    const maxNum = this.findMaxNumber(existingTasks)
    return `${this.PREFIX}${maxNum + 1}`
  }
  
  /**
   * Проверяет соответствие ID стандартному формату.
   * @param id - ID для проверки
   * @returns true если формат корректный
   */
  public static isValid(id: string): boolean {
    return /^TASK\d+$/.test(id)
  }
  
  /**
   * Извлекает числовой порядок из ID.
   * @param id - ID задачи
   * @returns числовой порядок или null
   */
  public static extractNumber(id: string): number | null {
    const match = id.match(/^TASK(\d+)$/)
    return match ? parseInt(match[1], 10) : null
  }
  
  /**
   * Генерирует имя задачи по умолчанию.
   * Использует max(existingIds) + 1 для согласованности с ID.
   * 
   * @param existingTasks - массив существующих задач
   * @param prefix - локализованный префикс (например, "Новая задача")
   * @returns имя задачи
   */
  public static generateDefaultName(existingTasks: ReadonlyArray<TaskWithId>, prefix: string): string {
    const maxNum = this.findMaxNumber(existingTasks)
    return `${prefix} ${maxNum + 1}`
  }
}
