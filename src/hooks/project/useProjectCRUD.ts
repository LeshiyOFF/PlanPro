import { useCallback } from 'react'
import { useAsyncOperation } from '../useAsyncOperation'
import { useProjectState } from '../useProjectState'
import { useProjectAPI } from '../useProjectAPI'
import { useFileOpen } from '../useFileOpen'
import { useProjectStore } from '@/store/projectStore'
import { mapCatalogProjectToUi } from '@/services/CatalogProjectMapper'
import { ProjectUtils } from '@/utils/project-utils'
import type { Project } from '@/types/project-types'

/**
 * Собирает объект Project из состояния store после загрузки файла.
 */
function buildProjectFromStore(filePath: string): Project {
  const state = useProjectStore.getState()
  const tasks = state.tasks
  const resources = state.resources
  const start =
    tasks.length > 0
      ? new Date(Math.min(...tasks.map((t) => t.startDate.getTime())))
      : new Date()
  const finish =
    tasks.length > 0
      ? new Date(Math.max(...tasks.map((t) => t.endDate.getTime())))
      : new Date()
  return {
    id: String(state.currentProjectId ?? 0),
    name: ProjectUtils.formatLoadedProjectName(filePath),
    start,
    finish,
    status: 'Planning',
    scheduleFrom: 'ProjectStart',
    priority: 'Normal',
    tasks,
    resources,
    assignments: [],
  }
}

/**
 * CRUD операции с проектами.
 * createProject — через ProjectAPIClient; loadProject — через FileAPIClient + getProjectData (useFileOpen).
 */
export const useProjectCRUD = (execute: ReturnType<typeof useAsyncOperation>['execute']) => {
  const { project, updateProjectState } = useProjectState()
  const projectApi = useProjectAPI()
  const { loadProjectFromPath } = useFileOpen()

  /**
   * Создание нового проекта через ProjectAPIClient.
   * Дефолтное имя при пустом/пробельном; всегда finish > start (Фаза 3).
   */
  const createProject = useCallback(
    async (name: string): Promise<Project | null> => {
      const trimmedName = typeof name === 'string' ? name.trim() : ''
      const displayName =
        trimmedName.length > 0 ? trimmedName : `Новый проект ${new Date().toLocaleString('ru-RU')}`
      const start = new Date()
      const finish = new Date(start.getTime() + 24 * 60 * 60 * 1000)

      const partial: Partial<Project> = {
        name: displayName,
        start,
        finish,
        status: 'Planning',
        scheduleFrom: 'ProjectStart',
        priority: 'Normal',
        tasks: [],
        resources: [],
        assignments: [],
      }
      const catalogProject = await execute(
        async () => projectApi.createProject(partial),
        'Не удалось создать проект',
      )
      if (!catalogProject) return null
      const uiProject = mapCatalogProjectToUi(catalogProject)
      updateProjectState(uiProject)
      return uiProject
    },
    [execute, projectApi, updateProjectState],
  )

  /**
   * Загрузка проекта из файла через FileAPIClient (loadProject + getProjectData в useFileOpen)
   */
  const loadProject = useCallback(
    async (filePath: string): Promise<Project | null> => {
      const loadedProject = await execute(
        async () => {
          const success = await loadProjectFromPath(filePath)
          if (!success) return null
          return buildProjectFromStore(filePath)
        },
        'Не удалось загрузить проект',
      )
      if (loadedProject) {
        updateProjectState(loadedProject)
        return loadedProject
      }
      return null
    },
    [execute, loadProjectFromPath, updateProjectState],
  )

  return {
    createProject,
    loadProject,
    project,
  }
}

