/**
 * Сервис для управления подсказками при первом использовании функций.
 * Использует localStorage для хранения состояния показанных подсказок.
 * 
 * Clean Architecture: Infrastructure Layer (Service)
 * SOLID: Single Responsibility - управление состоянием first-time hints
 * 
 * @version 1.0 - VB.11 First Time Hints
 */

const STORAGE_KEY_PREFIX = 'planpro_hint_shown_'

export class FirstTimeHintService {
  private static instance: FirstTimeHintService

  private constructor() {}

  /**
   * Получить единственный экземпляр сервиса (Singleton)
   */
  public static getInstance(): FirstTimeHintService {
    if (!FirstTimeHintService.instance) {
      FirstTimeHintService.instance = new FirstTimeHintService()
    }
    return FirstTimeHintService.instance
  }

  /**
   * Проверить, была ли уже показана подсказка для данного ключа
   */
  public isHintShown(hintKey: string): boolean {
    try {
      const key = `${STORAGE_KEY_PREFIX}${hintKey}`
      const value = localStorage.getItem(key)
      return value === 'true'
    } catch {
      return false
    }
  }

  /**
   * Отметить подсказку как показанную
   */
  public markHintAsShown(hintKey: string): void {
    try {
      const key = `${STORAGE_KEY_PREFIX}${hintKey}`
      localStorage.setItem(key, 'true')
    } catch (error) {
      console.error('[FirstTimeHintService] Failed to save hint state:', error)
    }
  }

  /**
   * Сбросить состояние подсказки (для тестирования или сброса настроек)
   */
  public resetHint(hintKey: string): void {
    try {
      const key = `${STORAGE_KEY_PREFIX}${hintKey}`
      localStorage.removeItem(key)
    } catch (error) {
      console.error('[FirstTimeHintService] Failed to reset hint state:', error)
    }
  }

  /**
   * Сбросить все подсказки
   */
  public resetAllHints(): void {
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(STORAGE_KEY_PREFIX)) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error('[FirstTimeHintService] Failed to reset all hints:', error)
    }
  }
}
