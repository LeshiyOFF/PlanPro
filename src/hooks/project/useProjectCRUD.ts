import { useCallback } from 'react'
import { useAsyncOperation } from '../useAsyncOperation'
import { useProjectState } from '../useProjectState'
import { ProjectUtils } from '@/utils/project-utils'

/**
 * CRUD операции с проектами
 */
export const useProjectCRUD = (execute: ReturnType<typeof useAsyncOperation>['execute']) => {
  const { project, updateProject } = useProjectState()

  /**
   * Создание нового проекта
   */
  const createProject = useCallback(async (name: string) => {
    const newProject = await execute(
      async () => ProjectUtils.createMockProject(name),
      'Не удалось создать проект',
    )

    if (newProject) {
      updateProject(newProject)
      return newProject
    }
    return null
  }, [execute, updateProject])

  /**
   * Загрузка проекта
   */
  const loadProject = useCallback(async (filePath: string) => {
    const loadedProject = await execute(
      async () => {
        const projectName = ProjectUtils.formatLoadedProjectName(filePath)
        return ProjectUtils.createMockProject(projectName, { status: 'Planning' })
      },
      'Не удалось загрузить проект',
    )

    if (loadedProject) {
      updateProject(loadedProject)
      return loadedProject
    }
    return null
  }, [execute, updateProject])

  return {
    createProject,
    loadProject,
    project,
  }
}

