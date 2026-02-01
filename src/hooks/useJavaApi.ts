import { useState, useEffect, useCallback } from 'react'
import { javaApiService } from '@/services/JavaApiService'
import { useIpcService } from './useIpcService'
import type { DataResponse, ProjectResponse, ProjectsListResponse, ResourceResponse, ResourcesListResponse, TaskResponse, TasksListResponse } from '@/types/api/response-types'
import type { ProjectCreateRequest, ProjectUpdateRequest, ResourceCreateRequest, TaskCreateRequest } from '@/types/api/request-types'

/**
 * Структура данных проекта
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  created?: string;
  updated?: string;
}

/**
 * Структура данных задачи
 */
export interface Task {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  duration?: number;
  progress?: number;
  status?: string;
  dependencies?: string[];
  resourceId?: string;
  created?: string;
  updated?: string;
}

/**
 * Структура данных ресурса
 */
export interface Resource {
  id: string;
  name: string;
  email?: string;
  role?: string;
  availability?: number;
  costPerHour?: number;
  created?: string;
  updated?: string;
}

/** Маппинг ProjectResponse → Project (useJavaApi) */
function mapProjectResponse(r: ProjectResponse): Project {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    startDate: r.startDate instanceof Date ? r.startDate.toISOString() : String(r.startDate ?? ''),
    endDate: r.endDate instanceof Date ? r.endDate.toISOString() : String(r.endDate ?? ''),
    status: r.status,
    created: r.createdAt instanceof Date ? r.createdAt.toISOString() : undefined,
    updated: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : undefined,
  }
}

/** Маппинг ResourceResponse → Resource (useJavaApi) */
function mapResourceResponse(r: ResourceResponse): Resource {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.department ?? r.type,
    availability: r.available === true ? 100 : r.available === false ? 0 : undefined,
    costPerHour: r.costPerHour,
    created: r.createdAt instanceof Date ? r.createdAt.toISOString() : undefined,
    updated: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : undefined,
  }
}

/** Маппинг TaskResponse → Task (useJavaApi) */
function mapTaskResponse(r: TaskResponse): Task {
  return {
    id: r.id,
    projectId: r.projectId ?? '',
    name: r.name,
    description: r.description,
    startDate: r.startDate instanceof Date ? r.startDate.toISOString() : undefined,
    endDate: r.endDate instanceof Date ? r.endDate.toISOString() : undefined,
    duration: r.estimatedHours,
    progress: r.progress,
    status: r.status,
    resourceId: r.assigneeId ?? r.resourceId,
    created: r.createdAt instanceof Date ? r.createdAt.toISOString() : undefined,
    updated: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : undefined,
  }
}

/**
 * React Hook для работы с Java API
 * Предоставляет состояние и методы для взаимодействия с Java бэкендом
 */
export const useJavaApi = () => {
  const { javaStatus, ipcService } = useIpcService()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isApiAvailable, setIsApiAvailable] = useState(false)

  // State для данных
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [resources, setResources] = useState<Resource[]>([])

  /**
   * Проверка доступности Java API
   */
  const checkApiAvailability = useCallback(async () => {
    try {
      const isAvailable = await javaApiService.ping()
      setIsApiAvailable(isAvailable)
      return isAvailable
    } catch (error) {
      setIsApiAvailable(false)
      return false
    }
  }, [])

  /**
   * Wrapper для выполнения API вызовов с обработкой ошибок
   */
  const executeApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    loadingState: boolean = true,
  ): Promise<T | null> => {
    if (loadingState) {
      setIsLoading(true)
    }
    setError(null)

    try {
      const result = await apiCall()
      return result
    } catch (error) {
      const errorMessage = (error as Error).message
      setError(errorMessage)
      console.error('Java API call failed:', error)
      return null
    } finally {
      if (loadingState) {
        setIsLoading(false)
      }
    }
  }, [])

  // Project operations

  /**
   * Загрузка всех проектов. Возвращает Project[] для UI.
   */
  const loadProjects = useCallback(async (): Promise<Project[]> => {
    const result = await executeApiCall(() => javaApiService.getAllProjects()) as DataResponse<ProjectsListResponse> | null
    if (result?.data?.projects) {
      const list = result.data.projects.map(mapProjectResponse)
      setProjects(list)
      return list
    }
    setProjects([])
    return []
  }, [executeApiCall])

  /**
   * Создание проекта. Возвращает Project | null.
   */
  const createProject = useCallback(async (projectData: Omit<Project, 'id' | 'created' | 'updated'>): Promise<Project | null> => {
    const request: ProjectCreateRequest = {
      name: projectData.name,
      description: projectData.description,
      status: projectData.status,
      startDate: projectData.startDate ? new Date(projectData.startDate) : undefined,
      endDate: projectData.endDate ? new Date(projectData.endDate) : undefined,
    }
    const result = await executeApiCall(() => javaApiService.createProject(request)) as DataResponse<ProjectResponse> | null
    if (result?.data) {
      const project = mapProjectResponse(result.data)
      await loadProjects()
      return project
    }
    return null
  }, [executeApiCall, loadProjects])

  /**
   * Загрузка конкретного проекта.
   */
  const loadProject = useCallback(async (projectId: string): Promise<Project | null> => {
    const result = await executeApiCall(() => javaApiService.getProject(projectId)) as DataResponse<ProjectResponse> | null
    if (result?.data) {
      const project = mapProjectResponse(result.data)
      setCurrentProject(project)
      return project
    }
    return null
  }, [executeApiCall])

  /**
   * Обновление проекта.
   */
  const updateProject = useCallback(async (projectId: string, updates: Partial<Project>): Promise<Project | null> => {
    const request: ProjectUpdateRequest = {
      name: updates.name,
      description: updates.description,
      status: updates.status,
      startDate: updates.startDate ? new Date(updates.startDate) : undefined,
      endDate: updates.endDate ? new Date(updates.endDate) : undefined,
    }
    const result = await executeApiCall(() => javaApiService.updateProject(projectId, request)) as DataResponse<ProjectResponse> | null
    if (result?.data) {
      const project = mapProjectResponse(result.data)
      await loadProjects()
      if (currentProject?.id === projectId) {
        setCurrentProject(project)
      }
      return project
    }
    return null
  }, [executeApiCall, loadProjects, currentProject])

  /**
   * Удаление проекта.
   */
  const deleteProject = useCallback(async (projectId: string): Promise<void> => {
    const result = await executeApiCall(() => javaApiService.deleteProject(projectId)) as DataResponse<void> | null
    if (result?.success !== false) {
      setProjects(prev => prev.filter(p => p.id !== projectId))
      if (currentProject?.id === projectId) {
        setCurrentProject(null)
      }
    }
  }, [executeApiCall, currentProject])

  // Task operations

  /**
   * Загрузка задач проекта.
   */
  const loadProjectTasks = useCallback(async (projectId: string): Promise<Task[]> => {
    const result = await executeApiCall(() => javaApiService.getTasksByProject(projectId)) as DataResponse<TasksListResponse> | null
    if (result?.data?.tasks) {
      const list = result.data.tasks.map(mapTaskResponse)
      setTasks(list)
      return list
    }
    setTasks([])
    return []
  }, [executeApiCall])

  /**
   * Создание задачи.
   */
  const createTask = useCallback(async (projectId: string, taskData: Omit<Task, 'id' | 'created' | 'updated'>): Promise<Task | null> => {
    const request: TaskCreateRequest = {
      projectId,
      name: taskData.name,
      description: taskData.description,
      status: taskData.status,
      startDate: taskData.startDate ? new Date(taskData.startDate) : undefined,
      endDate: taskData.endDate ? new Date(taskData.endDate) : undefined,
      duration: taskData.duration,
      percentComplete: taskData.progress,
      assigneeId: taskData.resourceId,
    }
    const result = await executeApiCall(() => javaApiService.createTask(projectId, request)) as DataResponse<TaskResponse> | null
    if (result?.data) {
      const task = mapTaskResponse(result.data)
      await loadProjectTasks(projectId)
      return task
    }
    return null
  }, [executeApiCall, loadProjectTasks])

  // Resource operations

  /**
   * Загрузка всех ресурсов. Возвращает Resource[].
   */
  const loadResources = useCallback(async (): Promise<Resource[]> => {
    const result = await executeApiCall(() => javaApiService.getAllResources()) as DataResponse<ResourcesListResponse> | null
    if (result?.data?.resources) {
      const list = result.data.resources.map(mapResourceResponse)
      setResources(list)
      return list
    }
    setResources([])
    return []
  }, [executeApiCall])

  /**
   * Создание ресурса.
   */
  const createResource = useCallback(async (resourceData: Omit<Resource, 'id' | 'created' | 'updated'>): Promise<Resource | null> => {
    const request: ResourceCreateRequest = {
      name: resourceData.name,
      type: 'human',
      email: resourceData.email,
      costPerHour: resourceData.costPerHour,
      available: (resourceData.availability ?? 0) >= 50,
    }
    const result = await executeApiCall(() => javaApiService.createResource(request)) as DataResponse<ResourceResponse> | null
    if (result?.data) {
      const resource = mapResourceResponse(result.data)
      await loadResources()
      return resource
    }
    return null
  }, [executeApiCall, loadResources])

  // Utility operations

  /**
   * Получение версии API
   */
  const getApiVersion = useCallback(async () => {
    return await executeApiCall(() => javaApiService.getVersion(), false)
  }, [executeApiCall])

  /**
   * Экспорт проекта
   */
  const exportProject = useCallback(async (projectId: string, format: string = 'json') => {
    return await executeApiCall(() => javaApiService.exportProject(projectId, format))
  }, [executeApiCall])

  /**
   * Импорт проекта
   */
  const importProject = useCallback(async (filePath: string) => {
    const result = await executeApiCall(() => javaApiService.importProject(filePath))
    if (result) {
      await loadProjects() // Обновляем список проектов после импорта
    }
    return result
  }, [executeApiCall, loadProjects])

  // Автоматическая проверка доступности API
  useEffect(() => {
    if (javaStatus?.running) {
      checkApiAvailability()
    } else {
      setIsApiAvailable(false)
    }
  }, [javaStatus?.running, checkApiAvailability])

  return {
    // Состояние
    isLoading,
    error,
    isApiAvailable,
    javaStatus,

    // Данные
    projects,
    currentProject,
    tasks,
    resources,

    // Project operations
    loadProjects,
    createProject,
    loadProject,
    updateProject,
    deleteProject,

    // Task operations
    loadProjectTasks,
    createTask,

    // Resource operations
    loadResources,
    createResource,

    // Utility operations
    checkApiAvailability,
    getApiVersion,
    exportProject,
    importProject,

    // API сервис для прямого доступа
    javaApiService,
    // IPC для диалогов (showMessageBox и т.д.)
    ipcService,
  }
}

export type UseJavaApiReturn = ReturnType<typeof useJavaApi>;

