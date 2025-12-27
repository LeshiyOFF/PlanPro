import { useState, useCallback } from 'react'
import type { Project, ProjectStatus } from '@/types/project-types'
import { logger } from '@/utils/logger'

/**
 * Управление базовыми данными проекта
 * Следует принципу Single Responsibility
 */
export const useProjectCore = () => {
  const [project, setProject] = useState<Project | null>(null)

  /**
   * Обновление метаданных проекта
   */
  const updateProjectMetadata = useCallback((updates: Partial<Project>) => {
    if (!project) return

    const updatedProject = {
      ...project,
      ...updates,
      modified: new Date(),
    }

    setProject(updatedProject)
    logger.info('Метаданные проекта обновлены', {
      projectId: project.id,
      updates: Object.keys(updates),
    })
  }, [project])

  return {
    project,
    setProject,
    updateProjectMetadata,
  }
}

/**
 * Управление жизненным циклом проекта
 * Следует принципу Single Responsibility
 */
export const useProjectLifecycle = () => {
  const [isActive, setIsActive] = useState(false)

  /**
   * Создание нового проекта
   */
  const createProject = useCallback((initialData?: Partial<Project>): Project => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: 'Новый проект',
      description: '',
      start: new Date(),
      finish: new Date(),
      status: 'Planning',
      scheduleFrom: 'ProjectStart',
      priority: 'Normal',
      tasks: [],
      resources: [],
      assignments: [],
      ...initialData,
    }

    logger.info('Создан новый проект', { name: newProject.name })
    return newProject
  }, [])

  /**
   * Обновление статуса проекта
   */
  const updateStatus = useCallback((
    project: Project,
    newStatus: ProjectStatus,
  ): Project => {
    const updatedProject = {
      ...project,
      status: newStatus,
      modified: new Date(),
    }

    logger.info('Статус проекта изменен', {
      projectId: project.id,
      oldStatus: project.status,
      newStatus,
    })

    return updatedProject
  }, [])

  /**
   * Получение даты начала проекта
   */
  const getStartDate = useCallback((project: Project): Date => {
    if (project.tasks.length === 0) return project.start

    const taskDates = project.tasks
      .filter(task => task.start)
      .map(task => new Date(task.start))

    return taskDates.length > 0
      ? new Date(Math.min(...taskDates.map(date => date.getTime())))
      : project.start
  }, [])

  /**
   * Получение даты окончания проекта
   */
  const getFinishDate = useCallback((project: Project): Date => {
    if (project.tasks.length === 0) return project.finish

    const taskDates = project.tasks
      .filter(task => task.finish)
      .map(task => new Date(task.finish))

    return taskDates.length > 0
      ? new Date(Math.max(...taskDates.map(date => date.getTime())))
      : project.finish
  }, [])

  /**
   * Активация/деактивация проекта
   */
  const toggleActive = useCallback(() => {
    setIsActive(prev => !prev)
  }, [])

  return {
    isActive,
    createProject,
    updateStatus,
    toggleActive,
    getStartDate,
    getFinishDate,
  }
}

/**
 * Управление метаданными проекта
 * Следует принципу Single Responsibility
 */
export const useProjectMetadata = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Очистка ошибок
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Установка состояния загрузки
   */
  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading)
    if (loading) {
      clearError()
    }
  }, [clearError])

  return {
    isLoading,
    error,
    clearError,
    setLoading,
  }
}
