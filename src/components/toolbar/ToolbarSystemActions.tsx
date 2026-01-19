import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Settings,
  HelpCircle,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { logger } from '@/utils/logger';

/**
 * Системные действия toolbar
 */
export const ToolbarSystemActions: React.FC = () => {
  const handleSystemAction = useCallback((action: string) => {
    logger.info(`System action requested: ${action}`);
    
    switch (action) {
      case 'settings':
        logger.info('Settings dialog requested');
        break;
      case 'help':
        logger.info('Help dialog requested');
        break;
      case 'minimize':
        logger.info('Window minimize requested');
        break;
      case 'maximize':
        logger.info('Window maximize requested');
        break;
      default:
        logger.warn(`Unknown system action: ${action}`);
    }
  }, []);

  return (
    <div className="toolbar-group flex items-center gap-1 ml-auto">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSystemAction('settings')}
        title="Настройки"
      >
        <Settings className="h-4 w-4" />
        <span className="sr-only">Настройки</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSystemAction('help')}
        title="Справка"
      >
        <HelpCircle className="h-4 w-4" />
        <span className="sr-only">Справка</span>
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSystemAction('minimize')}
        title="Свернуть"
      >
        <Minimize2 className="h-4 w-4" />
        <span className="sr-only">Свернуть</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSystemAction('maximize')}
        title="Развернуть"
      >
        <Maximize2 className="h-4 w-4" />
        <span className="sr-only">Развернуть</span>
      </Button>
    </div>
  );
};

export default ToolbarSystemActions;

