import { logger } from '@/utils/logger'
import type { JsonValue } from '@/types/json-types'

/**
 * Конфигурация настроек приложения
 */
export interface AppSettings {
  version: string;
  preferences: Record<string, JsonValue>;
  hotkeys: Record<string, string>;
  ui: Record<string, JsonValue>;
  timestamp: string;
}

/**
 * Сервис импорта и экспорта настроек
 * Управляет сохранением и загрузкой пользовательских настроек
 */
class SettingsImportExportService {
  private static instance: SettingsImportExportService
  private readonly SETTINGS_VERSION = '1.0.0'

  private constructor() {}

  static getInstance(): SettingsImportExportService {
    if (!SettingsImportExportService.instance) {
      SettingsImportExportService.instance = new SettingsImportExportService()
    }
    return SettingsImportExportService.instance
  }

  /**
   * Экспортирует настройки в JSON файл
   */
  async exportSettings(): Promise<void> {
    try {
      const settings = this.collectSettings()
      const json = JSON.stringify(settings, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `planpro-settings-${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      logger.dialog('Settings exported', { timestamp: settings.timestamp } as JsonValue, 'Settings')
    } catch (error) {
      logger.dialogError('Export failed', error instanceof Error ? error : String(error), 'Settings')
      throw error
    }
  }

  /**
   * Импортирует настройки из JSON файла
   */
  async importSettings(file: File): Promise<void> {
    try {
      const text = await file.text()
      const settings: AppSettings = JSON.parse(text)

      this.validateSettings(settings)
      this.applySettings(settings)

      logger.dialog('Settings imported', { version: settings.version } as JsonValue, 'Settings')
    } catch (error) {
      logger.dialogError('Import failed', error instanceof Error ? error : String(error), 'Settings')
      throw error
    }
  }

  /**
   * Собирает текущие настройки
   */
  private collectSettings(): AppSettings {
    const preferences: Record<string, JsonValue> = {}
    const hotkeys: Record<string, string> = {}
    const ui: Record<string, JsonValue> = {}

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key)
        if (value) {
          try {
            const parsed = JSON.parse(value)
            if (key.startsWith('hotkey_')) {
              hotkeys[key] = value
            } else if (key.startsWith('ui_')) {
              ui[key] = parsed
            } else {
              preferences[key] = parsed
            }
          } catch {
            preferences[key] = value
          }
        }
      }
    }

    return {
      version: this.SETTINGS_VERSION,
      preferences,
      hotkeys,
      ui,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Валидирует импортируемые настройки
   */
  private validateSettings(settings: AppSettings): void {
    if (!settings.version) {
      throw new Error('Invalid settings file: missing version')
    }
    if (!settings.timestamp) {
      throw new Error('Invalid settings file: missing timestamp')
    }
  }

  /**
   * Применяет импортированные настройки
   */
  private applySettings(settings: AppSettings): void {
    Object.entries(settings.preferences).forEach(([key, value]) => {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    })

    Object.entries(settings.hotkeys).forEach(([key, value]) => {
      localStorage.setItem(key, value)
    })

    Object.entries(settings.ui).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value))
    })

    window.location.reload()
  }

  /**
   * Сбрасывает настройки к значениям по умолчанию
   */
  resetToDefaults(): void {
    if (confirm('Вы уверены, что хотите сбросить все настройки?')) {
      localStorage.clear()
      logger.dialog('Settings reset to defaults', {}, 'Settings')
      window.location.reload()
    }
  }
}

export { SettingsImportExportService }
export const settingsImportExportService = SettingsImportExportService.getInstance()
