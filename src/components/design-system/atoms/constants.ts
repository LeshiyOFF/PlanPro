/**
 * Константы для Design System компонентов
 * Решают проблему t.color.test is not a function в Storybook
 */

// Цветовые константы вместо union types
export const COLORS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary', 
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info',
  NEUTRAL: 'neutral'
} as const;

export type ColorType = typeof COLORS[keyof typeof COLORS];

// Константы вариантов
export const VARIANTS = {
  SOLID: 'solid',
  OUTLINE: 'outline', 
  GHOST: 'ghost',
  SOFT: 'soft'
} as const;

export type VariantType = typeof VARIANTS[keyof typeof VARIANTS];

// Константы размеров
export const SIZES = {
  XS: 'xs',
  SM: 'sm', 
  MD: 'md',
  LG: 'lg',
  XL: 'xl'
} as const;

export type SizeType = typeof SIZES[keyof typeof SIZES];

// Константы состояний
export const STATES = {
  DEFAULT: 'default',
  HOVER: 'hover',
  ACTIVE: 'active', 
  DISABLED: 'disabled',
  LOADING: 'loading'
} as const;

export type StateType = typeof STATES[keyof typeof STATES];

