/**
 * Molecule ButtonGroup - группа кнопок с логикой
 * Следует SOLID принципам и Atomic Design
 */

import React from 'react';
import { cn } from '@/utils/cn';
import { AtomButton, AtomButtonProps } from '../atoms';
import { BaseAtomicProps } from '../atoms/types';

/**
 * Props для ButtonGroup Molecule
 */
export interface ButtonGroupProps extends BaseAtomicProps {
  buttons: Array<AtomButtonProps & { id: string }>;
  variant?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  equalWidth?: boolean;
  selected?: string | null;
  onSelect?: (buttonId: string) => void;
}

/**
 * ButtonGroup (Molecule)
 * Комбинирует несколько кнопок в группу
 */
export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  className = '',
  buttons,
  variant = 'horizontal',
  spacing = 'sm',
  equalWidth = false,
  selected = null,
  onSelect,
  testId
}) => {
  const containerClasses = cn(
    'flex',
    variant === 'horizontal' ? 'flex-row' : 'flex-col',
    {
      'space-x-1': variant === 'horizontal' && spacing === 'sm',
      'space-x-2': variant === 'horizontal' && spacing === 'md',
      'space-x-4': variant === 'horizontal' && spacing === 'lg',
      'space-y-1': variant === 'vertical' && spacing === 'sm',
      'space-y-2': variant === 'vertical' && spacing === 'md',
      'space-y-4': variant === 'vertical' && spacing === 'lg'
    },
    equalWidth && variant === 'horizontal' ? 'flex-1' : '',
    equalWidth && variant === 'vertical' ? 'w-full' : '',
    className
  );

  const buttonClasses = cn(
    equalWidth && variant === 'horizontal' ? 'flex-1' : '',
    equalWidth && variant === 'vertical' ? 'w-full' : ''
  );

  const handleButtonClick = (buttonId: string, onClick?: AtomButtonProps['onClick']) => {
    return (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      onSelect?.(buttonId);
    };
  };

  return (
    <div className={containerClasses} data-testid={testId}>
      {buttons.map((button) => (
        <AtomButton
          key={button.id}
          {...button}
          className={cn(buttonClasses, button.className)}
          onClick={handleButtonClick(button.id, button.onClick)}
          variant={
            selected === button.id 
              ? 'solid' 
              : button.variant === 'solid' 
                ? 'outline' 
                : button.variant
          }
          color={
            selected === button.id 
              ? 'primary' 
              : button.color
          }
        >
          {button.children}
        </AtomButton>
      ))}
    </div>
  );
};
