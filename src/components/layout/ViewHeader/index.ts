/**
 * ViewHeader Module
 * 
 * Unified Two-Tier Header System для всех представлений ProjectLibre.
 * Реализует современный паттерн вертикального разделения заголовка и действий.
 * 
 * Этап 7.23: Unified Two-Tier Header System
 * Версия: v8.13
 * Дата: 13.01.2026
 */

// Основные компоненты
export { ViewHeader } from './ViewHeader';
export { ActionBar } from './ActionBar';
export { TwoTierHeader } from './TwoTierHeader';

// TypeScript интерфейсы
export type {
  ViewHeaderProps,
  ActionButton,
  ActionBarProps,
  TwoTierHeaderProps
} from './ViewHeaderTypes';

