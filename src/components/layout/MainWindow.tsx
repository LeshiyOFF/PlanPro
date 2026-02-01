import React, { useEffect } from 'react';
import { useNavigation } from '@/providers/NavigationProvider';
import { useProject } from '@/providers/ProjectProvider';
import { useAppStore } from '@/store/appStore';
import { IntegratedMenu } from '@/components/menu/IntegratedMenu';
import { IntegratedToolbar } from '@/components/toolbar';
import { useFileOperations } from '@/hooks/useFileOperations';
import { MainWindowActionRegistryFactory } from '@/services/actions/MainWindowActionRegistry';
import { useActionManager } from '@/providers/ActionContext';
import { logger } from '@/utils/logger';
import type {
  ProjectProviderPort,
  NavigationProviderPort,
  FileOperationsPort,
  AppStorePort,
  MainWindowDependencies
} from '@/services/actions/registry/BaseActionRegistry';

import type { ViewType } from '@/types/ViewTypes';
import type { Project } from '@/types/project-types';

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
  className: _className = '',
  onViewChange: _onViewChange,
  children
}) => {
  const { navigateToView, availableViews } = useNavigation();
  const { project, projectActions } = useProject();
  const appStore = useAppStore();
  const fileOperations = useFileOperations();
  const { executeAction } = useActionManager();

  useEffect((): (() => void) | undefined => {
    logger.info('[MainWindow] Initializing action registry with live dependencies');

    const projectProvider: ProjectProviderPort = {
      currentProject: project,
      createProject: projectActions.createProject,
      saveProject: (projectOrPath?: Project | string) =>
        projectActions.saveProject(typeof projectOrPath === 'string' ? projectOrPath : undefined)
    };

    const navigationProvider: NavigationProviderPort = { navigateToView, availableViews };

    const fileOperationsPort: FileOperationsPort = {
      createNewProject: () => fileOperations.createNewProject().then(() => {}),
      openProject: fileOperations.openProject,
      saveProject: fileOperations.saveProject,
      saveProjectAs: fileOperations.saveProjectAs
    };

    const dependencies: MainWindowDependencies = {
      projectProvider,
      appStore: appStore as AppStorePort,
      navigationProvider,
      fileOperations: fileOperationsPort
    };

    try {
      const registry = MainWindowActionRegistryFactory.createAndInitialize(dependencies);
      return () => {
        registry.unregisterAllActions();
      };
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      logger.error('[MainWindow] Failed to initialize action registry:', { message: errMessage });
      return undefined;
    }
  }, [fileOperations, appStore, navigateToView, availableViews, project, projectActions]);

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

