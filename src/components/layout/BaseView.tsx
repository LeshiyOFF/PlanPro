import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui';
import { ContextHelp } from '@/components/ui/ContextHelp';
import { useHelpContent } from '@/hooks/useHelpContent';
import { ViewType } from '@/types/ViewTypes';

/**
 * Интерфейс для BaseView компонента
 */
export interface BaseViewProps {
  title?: string;
  children: ReactNode;
  toolbar?: ReactNode;
  className?: string;
  showHeader?: boolean;
  viewType?: ViewType;
  help?: {
    title: string;
    content: ReactNode;
  };
}

/**
 * Базовый компонент для всех View
 * Обеспечивает унифицированную структуру и поведение
 * Следует SOLID принципу Single Responsibility
 */
export const BaseView: React.FC<BaseViewProps> = ({
  title,
  children,
  toolbar,
  className = '',
  showHeader = true,
  viewType,
  help: manualHelp
}) => {
  const helpContent = useHelpContent();
  
  // Приоритет: ручная помощь -> помощь по viewType -> undefined
  const help = manualHelp || (viewType ? helpContent[viewType === ViewType.TRACKING_GANTT ? 'TRACKING' : viewType as keyof typeof helpContent] : undefined);

  return (
    <div className={`view-container ${className}`}>
      <div className="view-content">
        {/* Toolbar если передан */}
        {toolbar && (
          <div className="view-toolbar">
            {toolbar}
          </div>
        )}

        {/* Header с заголовком и помощью */}
        {showHeader && title && (
          <div className="view-header flex items-center justify-between px-1">
            <h1 className="text-lg font-semibold">{title}</h1>
            {help && (
              <ContextHelp 
                title={help.title} 
                content={help.content} 
                side="bottom" 
              />
            )}
          </div>
        )}

        {/* Основной контент */}
        <div className="view-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BaseView;

