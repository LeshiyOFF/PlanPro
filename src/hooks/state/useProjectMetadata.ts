import { useState, useCallback } from 'react'
import type { Project } from '@/types'

/**
 * Хук для управления метаданными проекта
 * Следует принципу Single Responsibility
 */
export const useProjectMetadata = () => {
  const [project, setProject] = useState<Project | null>(null)

  /**
   * Установка нового проекта
   */
  const setCurrentProject = useCallback((newProject: Project) => {
    setProject(newProject)
  }, [])

  /**
   * Очистка проекта
   */
  const clearProject = useCallback(() => {
    setProject(null)
  }, [])

  /**
   * Обновление метаданных проекта
   */
  const updateProjectMetadata = useCallback((metadata: Partial<Project>) => {
    setProject(prev =>
      prev ? { ...prev, ...metadata } : null,
    )
  }, [])

  return {
    project,
    setProject: setCurrentProject,
    clearProject,
    updateProjectMetadata,
  }
}

