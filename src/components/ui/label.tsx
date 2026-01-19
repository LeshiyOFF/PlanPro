import React from 'react';
import { cn } from '@/utils/cn';

/**
 * Компонент Label
 */
interface LabelProps {
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({ htmlFor, className, children }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
    >
      {children}
    </label>
  );
};
