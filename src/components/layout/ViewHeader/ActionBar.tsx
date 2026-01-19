import React from 'react';
import { ActionBarProps } from './ViewHeaderTypes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * ActionBar - Tier 2: Action Bar
 * 
 * Панель действий с динамической поддержкой акцентного цвета.
 * Использует Dynamic Accent System для стилизации кнопок и рамок.
 * 
 * @version 8.14
 */
export const ActionBar: React.FC<ActionBarProps> = ({
  primaryAction,
  secondaryActions = [],
  controls,
  className = ''
}) => {
  return (
    <div 
      className={cn(
        "action-bar-tier2 bg-slate-50/80 backdrop-blur-sm border-b border-[hsl(var(--primary-border)/0.4)] px-6 py-2 flex items-center justify-between gap-4 min-h-[44px] flex-shrink-0 shadow-sm shadow-[hsl(var(--primary-shadow-light)/0.5)]",
        className
      )}
      role="toolbar"
      aria-label="Действия представления"
    >
      {/* Левая секция: Кнопки действий */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Primary Action - Главная кнопка с акцентом */}
        {primaryAction && (
          <Button
            variant="default"
            size="sm"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            title={primaryAction.title}
            className="h-9 px-4 font-medium"
          >
            {primaryAction.icon && (
              <span className="mr-2 flex-shrink-0">{primaryAction.icon}</span>
            )}
            <span className="whitespace-nowrap">{primaryAction.label}</span>
          </Button>
        )}

        {/* Secondary Actions - Вторичные кнопки с легким акцентом */}
        {secondaryActions.map((action, idx) => (
          <Button
            key={idx}
            variant={action.variant || 'outline'}
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
            title={action.title}
            className="h-9 px-3"
          >
            {action.icon && (
              <span className="mr-1.5 flex-shrink-0">{action.icon}</span>
            )}
            <span className="whitespace-nowrap">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Правая секция: Контролы */}
      {controls && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {controls}
        </div>
      )}
    </div>
  );
};

