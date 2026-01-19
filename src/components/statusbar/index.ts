/**
 * Экспорт всех компонентов модуля StatusBar
 * Следует принципу единственной ответственности
 */

// Основные компоненты
export { StatusBar } from './StatusBar';
export { StatusBarContainer } from './StatusBarContainer';

// Интерфейсы и типы
export * from './interfaces/StatusBarInterfaces';

// Сервисы
export { StatusBarService } from './services/StatusBarService';

// Хуки
export { useStatusBar, useStatusBarState } from './hooks/useStatusBar';

// Секции
export * from './sections';

