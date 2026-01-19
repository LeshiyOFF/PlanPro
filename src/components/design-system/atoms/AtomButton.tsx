/**
 * Atom Button - базовая кнопка без логики
 * Следует SOLID принципам и Atomic Design
 */

import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { BaseAtomicProps, ColorVariant, SizeVariant, StateVariant, VariantType } from './types';

/**
 * Props для Atom Button
 */
export interface AtomButtonProps extends BaseAtomicProps {
  variant?: VariantType;
  color?: ColorVariant;
  size?: SizeVariant;
  state?: StateVariant;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
  title?: string;
}

/**
 * Базовая кнопка (Atom)
 * Не содержит бизнес-логики, только отображение
 */
export const AtomButton = forwardRef<HTMLButtonElement, AtomButtonProps>(
  (
    {
      className = '',
      children,
      variant = 'solid',
      color = 'primary',
      size = 'md',
      state = 'default',
      disabled = false,
      type = 'button',
      onClick,
      testId,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      'aria-expanded': ariaExpanded,
      'aria-pressed': ariaPressed,
      title,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variantClasses = {
      solid: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
        error: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        info: 'bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500',
        neutral: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-400'
      },
      outline: {
        primary: 'border-2 border-blue-600 text-primary hover:bg-primary/10 focus:ring-blue-500',
        secondary: 'border-2 border-gray-600 text-gray-600 hover:bg-gray-50 focus:ring-gray-500',
        success: 'border-2 border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500',
        warning: 'border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500',
        error: 'border-2 border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500',
        info: 'border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50 focus:ring-cyan-500',
        neutral: 'border-2 border-gray-500 text-gray-500 hover:bg-gray-50 focus:ring-gray-400'
      },
      ghost: {
        primary: 'text-primary hover:bg-slate-100 focus:ring-blue-500',
        secondary: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
        success: 'text-green-600 hover:bg-green-100 focus:ring-green-500',
        warning: 'text-yellow-600 hover:bg-yellow-100 focus:ring-yellow-500',
        error: 'text-red-600 hover:bg-red-100 focus:ring-red-500',
        info: 'text-cyan-600 hover:bg-cyan-100 focus:ring-cyan-500',
        neutral: 'text-gray-500 hover:bg-gray-100 focus:ring-gray-400'
      },
      soft: {
        primary: 'bg-slate-100 text-slate-800 hover:bg-blue-200 focus:ring-blue-500',
        secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
        success: 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500',
        warning: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 focus:ring-yellow-500',
        error: 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500',
        info: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 focus:ring-cyan-500',
        neutral: 'bg-gray-50 text-gray-600 hover:bg-gray-100 focus:ring-gray-400'
      }
    };

    const sizeClasses = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg'
    };

    const stateClasses = {
      default: '',
      hover: '',
      active: 'ring-2 ring-offset-2',
      disabled: 'opacity-50 cursor-not-allowed',
      loading: 'opacity-75 cursor-wait'
    };

    const combinedClassName = cn(
      baseClasses,
      variantClasses[variant]?.[color] || variantClasses.solid.primary,
      sizeClasses[size],
      stateClasses[disabled ? 'disabled' : state],
      disabled && 'cursor-not-allowed',
      className
    );

    return (
      <button
        ref={ref}
        className={combinedClassName}
        type={type}
        disabled={disabled}
        onClick={onClick}
        data-testid={testId}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-expanded={ariaExpanded}
        aria-pressed={ariaPressed}
        title={title}
        {...props}
      >
        {children}
      </button>
    );
  }
);

AtomButton.displayName = 'AtomButton';
