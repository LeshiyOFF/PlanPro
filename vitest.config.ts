import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

/**
 * Конфигурация Vitest для модульного тестирования PlanPro.
 * Интегрирована с существующей структурой проекта и алиасами.
 *
 * @see https://vitest.dev/config/
 */
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@wamra/gantt-task-react': resolve(__dirname, 'src/lib/gantt-task-react'),
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@store': resolve(__dirname, 'src/store'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@domain': resolve(__dirname, 'src/domain'),
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'dist-app', 'release', 'electron'],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/domain/**/*.ts'],
      exclude: [
        'src/domain/**/__tests__/**',
        'src/domain/**/interfaces/**',
        'src/domain/**/entities/**',
        'src/domain/**/types.ts',
      ],
      thresholds: {
        lines: 60,
        branches: 50,
        functions: 60,
        statements: 60,
      },
    },

    testTimeout: 10000,
    hookTimeout: 10000,
    passWithNoTests: false,
  },

  define: {
    __IS_DEV__: JSON.stringify(true),
    __APP_VERSION__: JSON.stringify('1.0.0'),
  },
})
