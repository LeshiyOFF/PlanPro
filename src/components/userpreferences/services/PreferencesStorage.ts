import {
  IUserPreferences,
} from '../interfaces/UserPreferencesInterfaces'
import { getElectronAPI } from '@/utils/electronAPI'
import type { JsonObject } from '@/types/json-types'

/**
 * Хранилище настроек (Инфраструктурный слой)
 * Реализует мост к системному хранилищу Electron в Main процессе.
 * Следует SOLID принципам: Single Responsibility и Dependency Inversion.
 * Заменяет нестабильный localStorage на надежное файловое хранилище.
 */
export class PreferencesStorage {
  /**
   * Сохранение настроек через Electron IPC
   * @param preferences Объект всех настроек приложения
   */
  public static async save(preferences: IUserPreferences): Promise<void> {
    try {
      const api = getElectronAPI()
      if (api?.savePreferences) {
        const response = await api.savePreferences(preferences as JsonObject)
        if (!response.success) {
          throw new Error(response.error)
        }
      } else {
        // Fallback для веб-версии или Storybook (если применимо)
        localStorage.setItem('user_preferences', JSON.stringify(preferences))
      }
    } catch (error) {
      console.error('[PreferencesStorage] Failed to save preferences to file:', error)
    }
  }

  /**
   * Загрузка настроек через Electron IPC
   * @returns Частичный или полный объект настроек, либо null
   */
  public static async load(): Promise<Partial<IUserPreferences> | null> {
    try {
      const api = getElectronAPI()
      if (api?.loadPreferences) {
        const response = await api.loadPreferences()
        if (response.success && response.data) {
          return response.data as Partial<IUserPreferences>
        }

        // Если данных в файле нет, пробуем мигрировать из localStorage (однократно)
        const legacy = localStorage.getItem('user_preferences')
        if (legacy) {
          console.info('[PreferencesStorage] Migrating legacy settings from localStorage')
          return JSON.parse(legacy) as Partial<IUserPreferences>
        }

        return null
      }

      // Fallback для окружения без Electron
      const stored = localStorage.getItem('user_preferences')
      return stored ? (JSON.parse(stored) as Partial<IUserPreferences>) : null
    } catch (error) {
      console.warn('[PreferencesStorage] Failed to load preferences from file:', error)
      return null
    }
  }

  /**
   * Очистка настроек
   */
  public static async clear(): Promise<void> {
    try {
      const api = getElectronAPI()
      if (api?.savePreferences) {
        await api.savePreferences(null)
      }
      localStorage.removeItem('user_preferences')
    } catch (error) {
      console.error('[PreferencesStorage] Failed to clear preferences:', error)
    }
  }
}
