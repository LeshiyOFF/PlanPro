import React from 'react';
import { SafeTooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';

interface RibbonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  title: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Профессиональная кнопка для Ribbon Menu с поддержкой подсказок
 * Учитывает настройку showTips
 */
export const RibbonButton: React.FC<RibbonButtonProps> = ({
  children,
  onClick,
  title,
  className = '',
  disabled = false
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "ribbon-button p-2 rounded-md transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
};

