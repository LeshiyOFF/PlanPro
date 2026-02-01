/**
 * Хелпер для безопасного доступа к Electron API (preload).
 * В веб-сборке electronAPI отсутствует; вызовы через хелпер дают null и избегают TS18048/TS2722.
 */

import type { ElectronAPIWindow } from '@/types/window'

/**
 * Возвращает window.electronAPI или null, если API недоступно (веб, до инициализации).
 * Использовать везде вместо прямого window.electronAPI с ранним return при null.
 */
export function getElectronAPI(): ElectronAPIWindow | null {
  return window.electronAPI ?? null
}
