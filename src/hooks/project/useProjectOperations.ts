import { useCallback } from 'react'
import { useAsyncOperation } from '../useAsyncOperation'
import { useProjectState } from '../useProjectState'
import { ProjectUtils } from '@/utils/project-utils'
import { logger } from '@/utils/logger'

/**
 * Бизнес операции с проектами
 */
export const useProjectOperations = (execute: ReturnType<typeof useAsyncOperation>['execute']) => {
  const { project } = useProjectState()

  /**
   * Сохранение проекта
   */
  const saveProject = useCallback(async (filePath?: string) => {
    ProjectUtils.validateProject(project)

    await execute(
      async () => {
        logger.info('Сохранение проекта', { name: project.name, filePath })
      },
      'Не удалось сохранить проект',
    )
  }, [project, execute])

  /**
   * Экспорт проекта
   */
  const exportProject = useCallback(async (
    format: 'pod' | 'mpp' | 'xml',
    filePath: string,
  ) => {
    ProjectUtils.validateProject(project)

    await execute(
      async () => {
        logger.info('Экспорт проекта', { format, filePath })
      },
      'Не удалось экспортировать проект',
    )
  }, [project, execute])

  return {
    saveProject,
    exportProject,
    project,
  }
}

