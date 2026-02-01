import React from 'react'
import { logger } from '@/utils/logger'
import { useProject } from '@/providers/ProjectProvider'
import { useAppStore } from '@/store/appStore'
import { useNavigation } from '@/providers/NavigationProvider'
import {
  MainWindowActionRegistryFactory,
  MainWindowActionRegistry,
} from '@/services/actions/MainWindowActionRegistry'
import type {
  ProjectProviderPort,
  NavigationProviderPort,
  AppStorePort,
  MainWindowDependencies,
} from '@/services/actions/registry/BaseActionRegistry'
import type { Project } from '@/types/project-types'

/**
 * Props для MainWindowInitializer
 */
interface MainWindowInitializerProps {
  children: React.ReactNode;
}

/**
 * Компонент для инициализации действий MainWindow
 * Следует SOLID принципам:
 * - Single Responsibility: Только инициализация действий
 * - Dependency Inversion: Использует существующие провайдеры
 */
export const MainWindowInitializer: React.FC<MainWindowInitializerProps> = ({
  children,
}) => {
  const { project, projectActions } = useProject()
  const appStore = useAppStore()
  const { navigateToView, availableViews } = useNavigation()

  const projectProvider = React.useMemo<ProjectProviderPort>(
    () => ({
      currentProject: project,
      createProject: projectActions.createProject,
      saveProject: (projectOrPath?: Project | string) =>
        projectActions.saveProject(typeof projectOrPath === 'string' ? projectOrPath : undefined),
    }),
    [project, projectActions],
  )

  const navigationProvider = React.useMemo<NavigationProviderPort>(
    () => ({ navigateToView, availableViews }),
    [navigateToView, availableViews],
  )

  React.useEffect(() => {
    const dependencies: MainWindowDependencies = MainWindowActionRegistryFactory.extractDependencies(
      projectProvider,
      appStore as AppStorePort,
      navigationProvider,
    )

    const registry = MainWindowActionRegistryFactory.createAndInitialize(dependencies)
    logger.info('MainWindow actions initialized and integrated with new system')

    return () => {
      registry.unregisterAllActions()
    }
  }, [projectProvider, appStore, navigationProvider])

  return <>{children}</>
}

/**
 * Hook для получения регистра MainWindow действий
 */
export const useMainWindowRegistry = () => {
  const { project, projectActions } = useProject()
  const appStore = useAppStore()
  const { navigateToView, availableViews } = useNavigation()

  const projectProvider: ProjectProviderPort = {
    currentProject: project,
    createProject: projectActions.createProject,
    saveProject: (projectOrPath?: Project | string) =>
      projectActions.saveProject(typeof projectOrPath === 'string' ? projectOrPath : undefined),
  }

  const navigationProvider: NavigationProviderPort = { navigateToView, availableViews }

  const dependencies: MainWindowDependencies = MainWindowActionRegistryFactory.extractDependencies(
    projectProvider,
    appStore as AppStorePort,
    navigationProvider,
  )

  return new MainWindowActionRegistry(dependencies)
}

