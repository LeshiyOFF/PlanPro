import React from 'react';
import { useActionManager } from '@/providers/ActionContext';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';

/**
 * Конфигурация кнопки toolbar на основе Action
 */
interface ToolbarButtonProps {
  actionId: string;
  variant?: 'default' | 'outline' | 'ghost';
  showLabel?: boolean;
}

/**
 * Компонент кнопки toolbar на основе Action
 */
export const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  actionId, 
  variant = 'ghost',
  showLabel = false 
}) => {
  const { executeAction, getAction } = useActionManager();
  const action = getAction(actionId);

  if (!action) {
    logger.warn(`Action ${actionId} not found`);
    return null;
  }

  const handleClick = async () => {
    try {
      await executeAction(actionId);
    } catch (error) {
      logger.error(`Failed to execute action ${actionId}:`, error);
    }
  };

  return (
    <Button
      variant={variant}
      size="sm"
      disabled={!action.enabled}
      onClick={handleClick}
      className="toolbar-button"
      title={`${action.name}${action.shortcut ? ` (${action.shortcut})` : ''}`}
    >
      {action.icon && <span className="action-icon">{action.icon}</span>}
      {showLabel && <span className="action-label ml-1">{action.name}</span>}
      <span className="sr-only">{action.name}</span>
    </Button>
  );
};

export default ToolbarButton;

