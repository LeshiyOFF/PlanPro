import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'

/**
 * Интерфейс для менеджера окон
 */
export interface IWindowManager {
  /** Показать splash сразу после app.whenReady (до запуска Java). */
  showSplash(): void
  createMainWindow(): void
  getMainWindow(): BrowserWindow | null
}

/**
 * Конфигурация главного окна
 */
export interface MainWindowConfig extends BrowserWindowConstructorOptions {
  width?: number
  height?: number
  webPreferences?: {
    nodeIntegration?: boolean
    contextIsolation?: boolean
    preload?: string
  }
}