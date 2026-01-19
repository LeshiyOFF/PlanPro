import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Конфигурация Vite для ProjectLibre Electron приложения
 * Оптимизирована для производительности и разработки
 */
export default defineConfig({
  plugins: [react()],
  
  // Базовый путь для Electron (относительный путь для корректной загрузки ресурсов)
  base: './',
  
  // Настройка путей для(alias) для чистых импортов
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@store': resolve(__dirname, 'src/store'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  },

  // Настройки сервера разработки
  server: {
    port: 5173,
    host: 'localhost',
    strictPort: true,
    cors: true
  },

  // Настройки сборки
  build: {
    outDir: process.env.VITE_OUT_DIR || 'dist-app',
    emptyOutDir: true,
    sourcemap: true,
    
    // Оптимизация для Electron
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        format: 'es',
        manualChunks: {
          // Разделение vendor зависимостей
          vendor: ['react', 'react-dom', 'react-router-dom'],
          
          // Разделение UI компонентов
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast'
          ],
          
          // Утилиты и хелперы
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority'],
          
          // Иконки
          icons: ['lucide-react']
        }
      }
    },
    
    // Оптимизация размеров
    chunkSizeWarningLimit: 1000,
    
    // Target для Electron
    target: 'es2022',
    minify: 'esbuild'
  },

  // Определения глобальных переменных
  define: {
    __IS_DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      'process.env.VITE_BUILD_TARGET': JSON.stringify(process.env.VITE_BUILD_TARGET || 'web'),
      global: 'globalThis'
  },

  // CSS конфигурация
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer')
      ]
    }
  },

  // Оптимизация зависимостей
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      'clsx',
      'tailwind-merge',
      'class-variance-authority',
      'lucide-react'
    ]
  },

  // Переменные окружения
  envPrefix: 'VITE_',

  // Предпросмотр
  preview: {
    port: 4173,
    host: 'localhost'
  }
});