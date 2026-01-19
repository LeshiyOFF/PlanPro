/**
 * Базовые интерфейсы для Atomic Design компонентов
 * Следует SOLID принципам
 */

import { ReactNode } from 'react';

// Базовые пропсы для всех atomic компонентов
export interface BaseAtomicProps {
  className?: string;
  children?: ReactNode;
  testId?: string;
}

// Цветовая схема
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

// Размеры компонентов
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Состояния компонентов
export type StateVariant = 'default' | 'hover' | 'active' | 'disabled' | 'loading';

// Варианты отображения
export type VariantType = 'solid' | 'outline' | 'ghost' | 'soft';

