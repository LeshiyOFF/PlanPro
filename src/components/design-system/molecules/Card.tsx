/**
 * Molecule Card - карточка с контентом
 * Следует SOLID принципам и Atomic Design
 */

import React from 'react'
import { cn } from '@/utils/cn'
import { BaseAtomicProps, ColorVariant } from '../atoms/types'

/**
 * Props для Card Molecule
 */
export interface CardProps extends BaseAtomicProps {
  variant?: 'default' | 'bordered' | 'elevated' | 'outlined';
  color?: ColorVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  header?: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
}

/**
 * Card (Molecule)
 * Контейнер для контента с опциональными элементами
 */
export const Card: React.FC<CardProps> = ({
  className = '',
  children,
  variant = 'default',
  padding = 'md',
  rounded = true,
  shadow = 'sm',
  header,
  footer,
  actions,
  testId,
}) => {
  const containerClasses = cn(
    'bg-white',
    {
      'border-2 border-gray-200': variant === 'bordered',
      'border-2 border-gray-300 shadow-md': variant === 'outlined',
      'shadow-lg border border-gray-200': variant === 'elevated',
      'border border-gray-200': variant === 'default',
    },
    rounded ? 'rounded-lg' : '',
    {
      'shadow-none': shadow === 'none',
      'shadow-sm': shadow === 'sm',
      'shadow-md': shadow === 'md',
      'shadow-lg': shadow === 'lg',
      'shadow-xl': shadow === 'xl',
    },
    className,
  )

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  }

  const headerClasses = cn(
    'px-4 py-3 border-b border-gray-200 font-medium',
    padding === 'none' ? 'px-0 py-2' : '',
    padding === 'sm' ? 'px-3 py-2' : '',
    padding === 'md' ? '' : '',
    padding === 'lg' ? 'px-6 py-4' : '',
    padding === 'xl' ? 'px-8 py-6' : '',
  )

  const contentClasses = cn(
    paddingClasses[padding],
    header && !footer && !actions ? 'rounded-b-lg' : '',
    !header && !footer && !actions && 'rounded-lg',
  )

  const footerClasses = cn(
    'px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg',
    padding === 'none' ? 'px-0 py-2' : '',
    padding === 'sm' ? 'px-3 py-2' : '',
    padding === 'md' ? '' : '',
    padding === 'lg' ? 'px-6 py-4' : '',
    padding === 'xl' ? 'px-8 py-6' : '',
  )

  const actionsClasses = cn(
    'px-4 py-3 border-t border-gray-200 rounded-b-lg flex justify-end space-x-2',
    padding === 'none' ? 'px-0 py-2' : '',
    padding === 'sm' ? 'px-3 py-2' : '',
    padding === 'md' ? '' : '',
    padding === 'lg' ? 'px-6 py-4' : '',
    padding === 'xl' ? 'px-8 py-6' : '',
  )

  return (
    <div className={containerClasses} data-testid={testId}>
      {header && (
        <div className={headerClasses}>
          {header}
        </div>
      )}

      <div className={contentClasses}>
        {children}
      </div>

      {actions && (
        <div className={actionsClasses}>
          {actions}
        </div>
      )}

      {footer && (
        <div className={footerClasses}>
          {footer}
        </div>
      )}
    </div>
  )
}

