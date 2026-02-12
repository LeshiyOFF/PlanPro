import React from 'react'
import { logger } from '@/utils/logger'
import { useProject } from '@/providers/ProjectProvider'
import { useAppStore } from '@/store/appStore'
import { useProjectStore } from '@/store/projectStore'
import { useNavigation } from '@/providers/NavigationProvider'
import { useFileOperations } from '@/hooks/useFileOperations'
import {
  MainWindowActionRegistryFactory,
  MainWindowActionRegistry,
} from '@/services/actions/MainWindowActionRegistry'
import type {
  ProjectProviderPort,
  NavigationProviderPort,
  AppStorePort,
  FileOperationsPort,
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
  const fileOperations = useFileOperations()
  const currentProjectId = useProjectStore((s) => s.currentProjectId)
  const hasProjectToSave = currentProjectId != null && currentProjectId >= 0

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

  const fileOperationsPort = React.useMemo<FileOperationsPort>(
    () => ({
      createNewProject: async () => { await fileOperations.createNewProject() },
      openProject: async () => { await fileOperations.openProject() },
      saveProject: fileOperations.saveProject,
      saveProjectAs: fileOperations.saveProjectAs,
    }),
    [fileOperations],
  )

  React.useEffect(() => {
    const dependencies: MainWindowDependencies = MainWindowActionRegistryFactory.extractDependencies(
      projectProvider,
      appStore as AppStorePort,
      navigationProvider,
      fileOperationsPort,
      hasProjectToSave,
    )

    const registry = MainWindowActionRegistryFactory.createAndInitialize(dependencies)
    logger.info('MainWindow actions initialized and integrated with new system')

    return () => {
      registry.unregisterAllActions()
    }
  }, [projectProvider, appStore, navigationProvider, fileOperationsPort, hasProjectToSave])

  return <>{children}</>
}

/**
 * Hook для получения регистра MainWindow действий
 */
export const useMainWindowRegistry = () => {
  const { project, projectActions } = useProject()
  const appStore = useAppStore()
  const { navigateToView, availableViews } = useNavigation()
  const fileOperations = useFileOperations()
  const currentProjectId = useProjectStore((s) => s.currentProjectId)
  const hasProjectToSave = currentProjectId != null && currentProjectId >= 0

  const projectProvider: ProjectProviderPort = {
    currentProject: project,
    createProject: projectActions.createProject,
    saveProject: (projectOrPath?: Project | string) =>
      projectActions.saveProject(typeof projectOrPath === 'string' ? projectOrPath : undefined),
  }

  const navigationProvider: NavigationProviderPort = { navigateToView, availableViews }

  const fileOperationsPort: FileOperationsPort = {
    createNewProject: async () => { await fileOperations.createNewProject() },
    openProject: async () => { await fileOperations.openProject() },
    saveProject: fileOperations.saveProject,
    saveProjectAs: fileOperations.saveProjectAs,
  }

  const dependencies: MainWindowDependencies = MainWindowActionRegistryFactory.extractDependencies(
    projectProvider,
    appStore as AppStorePort,
    navigationProvider,
    fileOperationsPort,
    hasProjectToSave,
  )

  return new MainWindowActionRegistry(dependencies)
}

