import React from 'react';
import { SafeTooltip } from '@/components/ui/Tooltip';

/**
 * Конфигурация Ribbon Tab
 */
interface RibbonTabProps {
  id: string;
  title: string;
  isActive: boolean;
  onClick: () => void;
}

/**
 * Базовый Ribbon Tab компонент
 */
export const RibbonTab: React.FC<RibbonTabProps> = ({
  id,
  title,
  isActive,
  onClick
}) => {
  return (
    <button
      className={`
        ribbon-tab px-3 py-2 text-sm font-medium rounded-t-lg transition-colors
        ${isActive 
          ? 'bg-primary text-primary-foreground border-b-2 border-primary' 
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }
      `}
      onClick={onClick}
    >
      {title}
    </button>
  );
};

export default RibbonTab;
