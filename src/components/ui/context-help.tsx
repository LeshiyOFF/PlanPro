import React from 'react';
import { HelpCircle } from 'lucide-react';
import { SafeTooltip } from './tooltip';
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences';
import { cn } from '@/lib/utils';

interface ContextHelpProps {
  title: string;
  content: React.ReactNode;
  className?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Профессиональный компонент контекстной помощи
 * Отображается в виде круглой иконки с вопросительным знаком
 * Учитывает настройку showTips
 */
export const ContextHelp: React.FC<ContextHelpProps> = ({
  title,
  content,
  className = '',
  side = 'bottom'
}) => {
  const { preferences } = useUserPreferences();
  const showTips = preferences.display.showTips;

  if (!showTips) {
    return null;
  }

  return (
    <div className={cn("inline-block", className)}>
      <SafeTooltip 
        content={
          <div className="max-w-xs p-2">
            <h4 className="font-bold border-b border-border pb-1 mb-2 text-sm">{title}</h4>
            <div className="text-xs space-y-2 leading-relaxed">
              {content}
            </div>
          </div>
        } 
        side={side}
        align="end"
      >
        <button 
          className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
          aria-label={`Помощь: ${title}`}
        >
          <HelpCircle size={18} />
        </button>
      </SafeTooltip>
    </div>
  );
};

