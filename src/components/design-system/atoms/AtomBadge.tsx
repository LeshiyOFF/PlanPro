/**
 * Atom Badge - базовый значок без логики
 * Следует SOLID принципам и Atomic Design
 */

import React from 'react';
import { cn } from '@/utils/cn';
import { BaseAtomicProps, ColorVariant, SizeVariant } from './types';

/**
 * Props для Atom Badge
 */
export interface AtomBadgeProps extends BaseAtomicProps {
  color?: ColorVariant;
  size?: SizeVariant;
  variant?: 'solid' | 'outline' | 'soft';
  rounded?: boolean;
}

/**
 * Базовый значок (Atom)
 * Не содержит бизнес-логики, только отображение
 */
export const AtomBadge: React.FC<AtomBadgeProps> = ({
  className = '',
  children,
  color = 'primary',
  size = 'sm',
  variant = 'solid',
  rounded = true,
  testId
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium';
  
  const variantClasses = {
    solid: {
      primary: 'bg-blue-600 text-white',
      secondary: 'bg-gray-600 text-white',
      success: 'bg-green-600 text-white',
      warning: 'bg-yellow-600 text-white',
      error: 'bg-red-600 text-white',
      info: 'bg-cyan-600 text-white',
      neutral: 'bg-gray-500 text-white'
    },
    outline: {
      primary: 'border-2 border-blue-600 text-primary bg-primary/10',
      secondary: 'border-2 border-gray-600 text-gray-600 bg-gray-50',
      success: 'border-2 border-green-600 text-green-600 bg-green-50',
      warning: 'border-2 border-yellow-600 text-yellow-600 bg-yellow-50',
      error: 'border-2 border-red-600 text-red-600 bg-red-50',
      info: 'border-2 border-cyan-600 text-cyan-600 bg-cyan-50',
      neutral: 'border-2 border-gray-500 text-gray-500 bg-gray-50'
    },
    soft: {
      primary: 'bg-slate-100 text-slate-800',
      secondary: 'bg-gray-100 text-gray-700',
      success: 'bg-green-100 text-green-700',
      warning: 'bg-yellow-100 text-yellow-700',
      error: 'bg-red-100 text-red-700',
      info: 'bg-cyan-100 text-cyan-700',
      neutral: 'bg-gray-50 text-gray-600'
    }
  };

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-sm',
    xl: 'px-5 py-2 text-base'
  };

  const roundedClasses = rounded ? 'rounded-full' : 'rounded-md';

  const combinedClassName = cn(
    baseClasses,
    variantClasses[variant]?.[color] || variantClasses.solid.primary,
    sizeClasses[size],
    roundedClasses,
    className
  );

  return (
    <span className={combinedClassName} data-testid={testId}>
      {children}
    </span>
  );
};
