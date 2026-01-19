import React from 'react';
import { cn } from '@/utils/cn';

/**
 * Компонент Slider
 */
interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value?: number[];
  onValueChange?: (value: number[]) => void;
  className?: string;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({ 
  min, 
  max, 
  step = 1, 
  value = [], 
  onValueChange, 
  className,
  disabled = false 
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled && onValueChange) {
      onValueChange([parseInt(event.target.value)]);
    }
  };

  return (
    <div className={cn('relative flex w-full touch-none select-none items-center', className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          'absolute h-2 w-full appearance-none rounded-lg bg-background outline-none cursor-pointer',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
      />
    </div>
  );
};

