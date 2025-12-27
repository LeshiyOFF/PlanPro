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
    updateTaskUpdater: () => taskState.updateTask,
    deleteTaskUpdater: () => taskState.deleteTask,

    addResourceUpdater: () => resourceUpdater,
    updateResourceUpdater: () => resourceState.updateResource,
    deleteResourceUpdater: () => resourceState.deleteResource,

    addAssignmentUpdater: () => assignmentUpdater,
    updateAssignmentUpdater: () => assignmentState.updateAssignment,
    deleteAssignmentUpdater: () => assignmentState.deleteAssignment,

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
