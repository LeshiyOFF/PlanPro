import React, { ReactNode, useEffect } from 'react';
import { useNavigation } from '@/providers/NavigationProvider';
import { useProject } from '@/providers/ProjectProvider';
import { StatusBar } from '@/components/statusbar';
import { IntegratedMenu } from '@/components/menu/IntegratedMenu';
import { IntegratedToolbar } from '@/components/toolbar';
import { useStatusBar } from '@/components/statusbar';
import { useFileOperations } from '@/hooks/useFileOperations';
import { useProjectStore } from '@/store/projectStore';
import { MainWindowActionRegistryFactory } from '@/services/actions/MainWindowActionRegistry';
import { useActionManager } from '@/providers/ActionContext';
import { logger } from '@/utils/logger';

import type { ViewType } from '@/types/ViewTypes';

/**
 * Интерфейс MainWindow компонента
 */
interface MainWindowProps {
  className?: string;
  onViewChange?: (viewType: ViewType) => void;
  children?: React.ReactNode;
}

/**
 * MainWindow компонент с Action архитектурой
 * Реализует паттерны из UI_Reverse_Engineering.md
 * Следует SOLID принципам и Clean Architecture
 */
export const MainWindow: React.FC<MainWindowProps> = ({ 
  className = '',
  onViewChange,
  children
}) => {
  const { navigateToView } = useNavigation();
  const { currentProject } = useProject();
  
  // Наши живые операции с файлами
  const fileOperations = useFileOperations();
  const projectStore = useProjectStore();
  const { executeAction } = useActionManager();

  // Инициализация реестра действий при монтировании
  useEffect(() => {
    logger.info('[MainWindow] Initializing action registry with live dependencies');
    
    const dependencies = {
      projectProvider: { currentProject },
      appStore: projectStore,
      navigationProvider: { navigateToView },
      fileOperations // Внедряем живые функции!
    };

    try {
      const registry = MainWindowActionRegistryFactory.createAndInitialize(dependencies);
      return () => {
        registry.unregisterAllActions();
      };
    } catch (error) {
      logger.error('[MainWindow] Failed to initialize action registry:', error);
    }
  }, [fileOperations, projectStore, navigateToView, currentProject]);

  // Обработчик изменения представления
  const handleViewChange = (viewType: ViewType) => {
    navigateToView(viewType);
    if (onViewChange) {
      onViewChange(viewType);
    }
  };

  // Обработчик действий тулбара
  const handleToolbarAction = async (actionId: string, actionLabel: string) => {
    console.log(`[MainWindow] Toolbar action triggered: ${actionId} (${actionLabel})`);
    
    // Маппинг ID кнопок тулбара на ID действий системы
    const actionMap: Record<string, string> = {
      'TB001': 'new-project',
      'TB002': 'open-project',
      'TB003': 'save-project',
      'TB003_AS': 'save-project-as'
    };

    const targetActionId = actionMap[actionId];
    
    if (targetActionId) {
      try {
        await executeAction(targetActionId);
      } catch (error) {
        console.error(`[MainWindow] Failed to execute action ${targetActionId}:`, error);
      }
    } else {
      // Fallback для несмапленных действий
      console.log(`[MainWindow] Executing action: ${actionLabel}`);
    }
  };

  return (
    <>
      {/* Integrated Ribbon Menu */}
      <IntegratedMenu />
      
      {/* Toolbar Container */}
      <IntegratedToolbar onAction={handleToolbarAction} />
      
      {/* Основной контент - children */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </>
  );
};

export default MainWindow;

