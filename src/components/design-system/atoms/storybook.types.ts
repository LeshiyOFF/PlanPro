/**
 * Storybook-совместимые типы для controls
 * Эти типы специально созданы для решения проблемы t.color.test
 */

export const StorybookColorOptions = {
  primary: 'primary',
  secondary: 'secondary', 
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
  neutral: 'neutral'
} as const;

export type StorybookColorOption = typeof StorybookColorOptions[keyof typeof StorybookColorOptions];

export const StorybookSizeOptions = {
  xs: 'xs',
  sm: 'sm', 
  md: 'md',
  lg: 'lg',
  xl: 'xl'
} as const;

export type StorybookSizeOption = typeof StorybookSizeOptions[keyof typeof StorybookSizeOptions];

export const StorybookVariantOptions = {
  solid: 'solid',
  outline: 'outline',
  ghost: 'ghost', 
  soft: 'soft'
} as const;

export type StorybookVariantOption = typeof StorybookVariantOptions[keyof typeof StorybookVariantOptions];

export const StorybookStateOptions = {
  default: 'default',
  hover: 'hover',
  active: 'active',
  disabled: 'disabled',
  loading: 'loading'
} as const;

export type StorybookStateOption = typeof StorybookStateOptions[keyof typeof StorybookStateOptions];

