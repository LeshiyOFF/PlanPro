import React from 'react';
import { ToolbarButton } from './ToolbarButton';
import { Separator } from '@/components/ui/separator';

/**
 * Конфигурация группы toolbar
 */
interface ToolbarGroupProps {
  title: string;
  actionIds: string[];
  showLabels?: boolean;
}

/**
 * Компонент группы toolbar
 */
export const ToolbarGroup: React.FC<ToolbarGroupProps> = ({ 
  title, 
  actionIds, 
  showLabels = false 
}) => {
  return (
    <div className="toolbar-group flex items-center gap-1">
      {actionIds.map(actionId => (
        <ToolbarButton
          key={actionId}
          actionId={actionId}
          showLabels={showLabels}
        />
      ))}
      <Separator orientation="vertical" className="mx-1 h-6" />
    </div>
  );
};

export default ToolbarGroup;

