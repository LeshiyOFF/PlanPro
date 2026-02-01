/**
 * Сервис для отслеживания последнего открытого проекта.
 * Использует localStorage для persistence между сессиями.
 *
 * Принцип SRP: отвечает только за хранение пути последнего проекта.
 */
export class LastProjectService {
  private static readonly STORAGE_KEY = 'projectlibre_last_project'

  private static instance: LastProjectService

  private constructor() {}

  /**
   * Получить singleton-инстанс сервиса.
   */
  public static getInstance(): LastProjectService {
    if (!LastProjectService.instance) {
      LastProjectService.instance = new LastProjectService()
    }
    return LastProjectService.instance
  }

  /**
   * Сохранить путь к последнему открытому проекту.
   * @param filePath - Абсолютный путь к файлу проекта
   */
  public setLastProject(filePath: string): void {
    if (!filePath || filePath.trim().length === 0) {
      console.warn('[LastProjectService] Empty filePath provided, ignoring')
      return
    }

    try {
      localStorage.setItem(LastProjectService.STORAGE_KEY, filePath)
      console.log('[LastProjectService] Saved last project:', filePath)
    } catch (error) {
      console.error('[LastProjectService] Failed to save:', error)
    }
  }

  /**
   * Алиас для setLastProject (для консистентности API).
   * @param filePath - Абсолютный путь к файлу проекта
   */
  public saveLastProject(filePath: string): void {
    this.setLastProject(filePath)
  }

  /**
   * Получить путь к последнему открытому проекту.
   * @returns Путь к файлу или null, если не найден
   */
  public getLastProject(): string | null {
    try {
      const path = localStorage.getItem(LastProjectService.STORAGE_KEY)
      if (path) {
        console.log('[LastProjectService] Retrieved last project:', path)
      }
      return path
    } catch (error) {
      console.error('[LastProjectService] Failed to retrieve:', error)
      return null
    }
  }

  /**
   * Очистить информацию о последнем проекте.
   */
  public clearLastProject(): void {
    try {
      localStorage.removeItem(LastProjectService.STORAGE_KEY)
      console.log('[LastProjectService] Cleared last project')
    } catch (error) {
      console.error('[LastProjectService] Failed to clear:', error)
    }
  }

  /**
   * Проверить, есть ли сохраненный последний проект.
   */
  public hasLastProject(): boolean {
    return this.getLastProject() !== null
  }
}

