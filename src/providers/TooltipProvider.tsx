import React from 'react';
import { TooltipProvider as RadixTooltipProvider } from '@/components/ui/Tooltip';

interface TooltipProviderProps {
  children: React.ReactNode;
}

/**
 * Провайдер для системы подсказок (Tooltips)
 */
export const TooltipProvider: React.FC<TooltipProviderProps> = ({ children }) => {
  return (
    <RadixTooltipProvider delayDuration={400}>
      {children}
    </RadixTooltipProvider>
  );
};
