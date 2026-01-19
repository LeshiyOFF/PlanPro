import React from 'react';

/**
 * Конфигурация Ribbon Group
 */
interface RibbonGroupProps {
  title: string;
  children: React.ReactNode;
}

/**
 * Ribbon Group компонент
 * Группирует кнопки в Ribbon Tab
 */
export const RibbonGroup: React.FC<RibbonGroupProps> = ({ title, children }) => {
  return (
    <div className="ribbon-group">
      <div className="ribbon-group-title text-xs text-muted-foreground mb-2">
        {title}
      </div>
      <div className="ribbon-group-buttons flex items-center space-x-1">
        {children}
      </div>
    </div>
  );
};

export default RibbonGroup;
