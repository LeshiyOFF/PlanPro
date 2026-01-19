import { useCallback } from 'react'
import { Project, Task, Resource, Assignment } from '@/types'
import { useTaskState } from './state/useTaskState'
import { useResourceState } from './state/useResourceState'
import { useAssignmentState } from './state/useAssignmentState'
import { useProjectCore } from './state/useProjectCore'

/**
 * Агрегированный хук для управления состоянием проекта
 * Следует принципу Single Responsibility и Dependency Inversion
 */
export const useProjectState = () => {
  const taskState = useTaskState()
  const resourceState = useResourceState()
  const assignmentState = useAssignmentState()
  const projectCore = useProjectCore()

  /**
   * Создание обновителя для проекта
   */
  const projectUpdater = useCallback((newProject: Project) => {
    projectCore.setProject(newProject)
    taskState.setTasks(newProject.tasks || [])
    resourceState.setResources(newProject.resources || [])
    assignmentState.setAssignments(newProject.assignments || [])
  }, [projectCore, taskState, resourceState, assignmentState])

  /**
   * Создание обновителя для задач
   */
  const taskUpdater = useCallback((newTask: Task) => {
    taskState.addTask(newTask)
    // Обновляем проект с новой задачей
    if (projectCore.project) {
      const updatedProject = {
        ...projectCore.project,
        tasks: [...taskState.tasks, newTask],
      }
      projectCore.updateProjectMetadata(updatedProject)
    }
  }, [taskState, projectCore])

  /**
   * Обновитель для изменения задачи
   */
  const taskUpdateHandler = useCallback((id: string, updates: Partial<Task>) => {
    const updatedTask = taskState.updateTask(id, updates)
    if (projectCore.project && updatedTask) {
      const updatedProject = {
        ...projectCore.project,
        tasks: taskState.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
      }
      projectCore.updateProjectMetadata(updatedProject)
    }
    return updatedTask
  }, [taskState, projectCore])

  /**
   * Обновитель для удаления задачи
   */
  const taskDeleteHandler = useCallback((id: string) => {
    const success = taskState.deleteTask(id)
    if (projectCore.project && success) {
      const updatedProject = {
        ...projectCore.project,
        tasks: taskState.tasks.filter(t => t.id !== id),
      }
      projectCore.updateProjectMetadata(updatedProject)
    }
    return success
  }, [taskState, projectCore])

  /**
   * Создание обновителя для ресурсов
   */
  const resourceUpdater = useCallback((newResource: Resource) => {
    resourceState.addResource(newResource)
    // Обновляем проект с новым ресурсом
    if (projectCore.project) {
      const updatedProject = {
        ...projectCore.project,
        resources: [...resourceState.resources, newResource],
      }
      projectCore.updateProjectMetadata(updatedProject)
    }
  }, [resourceState, projectCore])

  /**
   * Обновитель для изменения ресурса
   */
  const resourceUpdateHandler = useCallback((id: string, updates: Partial<Resource>) => {
    const updatedResource = resourceState.updateResource(id, updates)
    if (projectCore.project && updatedResource) {
      const updatedProject = {
        ...projectCore.project,
        resources: resourceState.resources.map(r => r.id === id ? { ...r, ...updates } : r),
      }
      projectCore.updateProjectMetadata(updatedProject)
    }
    return updatedResource
  }, [resourceState, projectCore])

  /**
   * Обновитель для удаления ресурса
   */
  const resourceDeleteHandler = useCallback((id: string) => {
    const success = resourceState.deleteResource(id)
    if (projectCore.project && success) {
      const updatedProject = {
        ...projectCore.project,
        resources: resourceState.resources.filter(r => r.id !== id),
      }
      projectCore.updateProjectMetadata(updatedProject)
    }
    return success
  }, [resourceState, projectCore])

  /**
   * Создание обновителя для назначений
   */
  const assignmentUpdater = useCallback((newAssignment: Assignment) => {
    assignmentState.addAssignment(newAssignment)
    // Обновляем проект с новым назначением
    if (projectCore.project) {
      const updatedProject = {
        ...projectCore.project,
        assignments: [...assignmentState.assignments, newAssignment],
      }
      projectCore.updateProjectMetadata(updatedProject)
    }
  }, [assignmentState, projectCore])

  /**
   * Обновитель для изменения назначения
   */
  const assignmentUpdateHandler = useCallback((id: string, updates: Partial<Assignment>) => {
    const updatedAssignment = assignmentState.updateAssignment(id, updates)
    if (projectCore.project && updatedAssignment) {
      const updatedProject = {
        ...projectCore.project,
        assignments: assignmentState.assignments.map(a => a.id === id ? { ...a, ...updates } : a),
      }
      projectCore.updateProjectMetadata(updatedProject)
    }
    return updatedAssignment
  }, [assignmentState, projectCore])

  /**
   * Обновитель для удаления назначения
   */
  const assignmentDeleteHandler = useCallback((id: string) => {
    const success = assignmentState.deleteAssignment(id)
    if (projectCore.project && success) {
      const updatedProject = {
        ...projectCore.project,
        assignments: assignmentState.assignments.filter(a => a.id !== id),
      }
      projectCore.updateProjectMetadata(updatedProject)
    }
    return success
  }, [assignmentState, projectCore])

  return {
    // Основное состояние
    project: projectCore.project,
    tasks: taskState.tasks,
    resources: resourceState.resources,
    assignments: assignmentState.assignments,

    // Действия
    setProject: projectCore.setProject,
    updateProject: projectCore.updateProjectMetadata,
    updateProjectState: projectUpdater,

    // Updater функции для Actions
    addTaskUpdater: () => taskUpdater,
    updateTaskUpdater: () => taskUpdateHandler,
    deleteTaskUpdater: () => taskDeleteHandler,

    addResourceUpdater: () => resourceUpdater,
    updateResourceUpdater: () => resourceUpdateHandler,
    deleteResourceUpdater: () => resourceDeleteHandler,

    addAssignmentUpdater: () => assignmentUpdater,
    updateAssignmentUpdater: () => assignmentUpdateHandler,
    deleteAssignmentUpdater: () => assignmentDeleteHandler,

    // Обновленные действия
    addTask: taskUpdater,
    addResource: resourceUpdater,
    addAssignment: assignmentUpdater,

    // Прямые доступы к состояниям
    taskActions: taskState,
    resourceActions: resourceState,
    assignmentActions: assignmentState,
  }
}
