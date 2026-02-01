/**
 * Molecule FormField - поле формы с лейблом и инпутом
 * Следует SOLID принципам и Atomic Design
 */

import React from 'react';
import { cn } from '@/utils/cn';
import { AtomInput, AtomInputProps } from '../atoms';
import { BaseAtomicProps } from '../atoms/types';

/**
 * Props для FormField Molecule
 */
export interface FormFieldProps extends BaseAtomicProps {
  label: string;
  inputProps: Omit<AtomInputProps, 'size' | 'error'>;
  error?: string;
  required?: boolean;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  labelPosition?: 'top' | 'left' | 'inline';
}

/**
 * FormField (Molecule)
 * Комбинирует Label и Input в единый компонент
 */
export const FormField: React.FC<FormFieldProps> = ({
  className = '',
  label,
  inputProps,
  error,
  required = false,
  helperText,
  size = 'md',
  labelPosition = 'top',
  testId
}) => {
  const containerClasses = cn(
    'space-y-1',
    labelPosition === 'inline' && 'flex items-center space-x-4 space-y-0',
    labelPosition === 'left' && 'flex flex-col space-y-2',
    className
  );

  const labelClasses = cn(
    'font-medium text-sm',
    labelPosition === 'left' && 'text-xs uppercase tracking-wider mb-1',
    error ? 'text-red-600' : 'text-gray-700',
    required && 'after:content-["*"] after:ml-1 after:text-red-500'
  );

  const inputSize = {
    sm: 'sm',
    md: 'md',
    lg: 'lg'
  } as const;

  return (
    <div className={containerClasses} data-testid={testId}>
      {labelPosition !== 'inline' && (
        <label className={labelClasses}>
          {label}
        </label>
      )}
      
      {labelPosition === 'inline' && (
        <label className={cn(labelClasses, 'flex-shrink-0 w-1/4')}>
          {label}
        </label>
      )}
      
      <div className={labelPosition === 'inline' ? 'flex-1' : ''}>
        <AtomInput
          {...inputProps}
          size={inputSize[size]}
          error={!!error}
          helperText={error || helperText}
          required={required}
        />
      </div>
    </div>
  );
};

