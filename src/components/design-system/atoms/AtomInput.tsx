/**
 * Atom Input - базовое поле ввода без логики
 * Следует SOLID принципам и Atomic Design
 */

import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { BaseAtomicProps, SizeVariant, StateVariant } from './types';

/**
 * Props для Atom Input
 */
export interface AtomInputProps extends BaseAtomicProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  size?: SizeVariant;
  state?: StateVariant;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
  'aria-invalid'?: boolean;
  title?: string;
}

/**
 * Базовый input (Atom)
 * Не содержит бизнес-логики, только отображение
 */
export const AtomInput = forwardRef<HTMLInputElement, AtomInputProps>(
  (
    {
      className = '',
      type = 'text',
      placeholder,
      value,
      defaultValue,
      size = 'md',
      state = 'default',
      disabled = false,
      required = false,
      error = false,
      helperText,
      leftIcon,
      rightIcon,
      onChange,
      onFocus,
      onBlur,
      testId,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      'aria-required': ariaRequired,
      'aria-invalid': ariaInvalid,
      title,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'flex border rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const stateClasses = {
      default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      hover: 'border-gray-400 focus:border-blue-500 focus:ring-blue-500',
      active: 'border-blue-600 focus:border-blue-600 focus:ring-blue-600',
      disabled: 'border-gray-200 bg-gray-50 cursor-not-allowed',
      loading: 'border-blue-400 bg-primary/10'
    };

    const errorClasses = error 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50'
      : stateClasses[state];

    const sizeClasses = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg'
    };

    const inputClasses = cn(
      baseClasses,
      errorClasses,
      sizeClasses[size],
      disabled && 'bg-gray-50 cursor-not-allowed',
      'w-full',
      className
    );

    const containerClasses = cn(
      'relative',
      error && 'text-red-600'
    );

    const iconClasses = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
      xl: 'w-6 h-6'
    };

    return (
      <div className={containerClasses}>
        <div className="relative flex items-center">
          {leftIcon && (
            <div className={cn('absolute left-3 flex items-center text-gray-400', iconClasses[size])}>
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            required={required}
            className={cn(
              inputClasses,
              leftIcon && 'pl-10',
              rightIcon && 'pr-10'
            )}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            data-testid={testId}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            aria-required={ariaRequired !== undefined ? ariaRequired : required}
            aria-invalid={ariaInvalid !== undefined ? ariaInvalid : error}
            title={title}
            {...props}
          />
          
          {rightIcon && (
            <div className={cn('absolute right-3 flex items-center text-gray-400', iconClasses[size])}>
              {rightIcon}
            </div>
          )}
        </div>
        
        {helperText && (
          <p className={cn(
            'mt-1 text-xs',
            error ? 'text-red-600' : 'text-gray-500'
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

AtomInput.displayName = 'AtomInput';

