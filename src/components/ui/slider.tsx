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
  /** Вызывается при завершении взаимодействия (отпускание ползунка). */
  onValueCommit?: (value: number[]) => void;
  className?: string;
  disabled?: boolean;
  /** Идентификатор для связи с Label (a11y). */
  id?: string;
}

export const Slider: React.FC<SliderProps> = ({
  min,
  max,
  step = 1,
  value = [],
  onValueChange,
  onValueCommit,
  className,
  disabled = false,
  id
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const next = [parseInt(event.target.value, 10)];
    onValueChange?.(next);
  };

  const handleCommit = () => {
    if (!disabled && value.length > 0) onValueCommit?.(value);
  };

  return (
    <div id={id} className={cn('relative flex w-full touch-none select-none items-center', className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        onPointerUp={handleCommit}
        onMouseUp={handleCommit}
        disabled={disabled}
        className={cn(
          'absolute h-2 w-full appearance-none rounded-lg bg-background outline-none cursor-pointer',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
      />
    </div>
  );
};

