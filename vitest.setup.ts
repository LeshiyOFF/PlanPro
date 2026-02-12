/**
 * Глобальная настройка Vitest для PlanPro.
 * Выполняется перед каждым тестовым файлом.
 */
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Очистка DOM после каждого теста
afterEach(() => {
  cleanup()
})

// Мокирование crypto.randomUUID для тестового окружения
if (typeof crypto === 'undefined') {
  let counter = 0
  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  globalThis.crypto = {
    randomUUID: () => `test-uuid-${++counter}`,
  } as Crypto
}

// Мокирование window.matchMedia (нужно для некоторых UI компонентов)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Мокирование ResizeObserver
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Мокирование IntersectionObserver
globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
