import { 
  IUserPreferences
} from '../interfaces/UserPreferencesInterfaces';

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
      if (window.electronAPI && window.electronAPI.savePreferences) {
        const response = await window.electronAPI.savePreferences(preferences);
        if (!response.success) {
          throw new Error(response.error);
        }
      } else {
        // Fallback для веб-версии или Storybook (если применимо)
        localStorage.setItem('user_preferences', JSON.stringify(preferences));
      }
    } catch (error) {
      console.error('[PreferencesStorage] Failed to save preferences to file:', error);
    }
  }

  /**
   * Загрузка настроек через Electron IPC
   * @returns Частичный или полный объект настроек, либо null
   */
  public static async load(): Promise<Partial<IUserPreferences> | null> {
    try {
      if (window.electronAPI && window.electronAPI.loadPreferences) {
        const response = await window.electronAPI.loadPreferences();
        if (response.success && response.data) {
          return response.data as Partial<IUserPreferences>;
        }
        
        // Если данных в файле нет, пробуем мигрировать из localStorage (однократно)
        const legacy = localStorage.getItem('user_preferences');
        if (legacy) {
          console.info('[PreferencesStorage] Migrating legacy settings from localStorage');
          return JSON.parse(legacy);
        }
        
        return null;
      }

      // Fallback для окружения без Electron
      const stored = localStorage.getItem('user_preferences');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('[PreferencesStorage] Failed to load preferences from file:', error);
      return null;
    }
  }

  /**
   * Очистка настроек
   */
  public static async clear(): Promise<void> {
    try {
      if (window.electronAPI && window.electronAPI.savePreferences) {
        await window.electronAPI.savePreferences(null);
      }
      localStorage.removeItem('user_preferences');
    } catch (error) {
      console.error('[PreferencesStorage] Failed to clear preferences:', error);
    }
  }
}
