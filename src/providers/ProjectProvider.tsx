import { createContext, useContext, useMemo } from 'react'
import { useProjectActions } from '../hooks/useProjectActions'
import { useTaskActions } from '../hooks/useTaskActions'
import { useResourceActions } from '../hooks/useResourceActions'
import { useAssignmentActions } from '../hooks/useAssignmentActions'
import { useAsyncOperation } from '../hooks/useAsyncOperation'
import { useProjectState } from '../hooks/useProjectState'

import type { ProjectContextType, ProjectProviderProps } from '@/types'
import { apiLogger } from '@/utils/logger'

const ProjectContext = createContext<ProjectContextType | null>(null)

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}

export const ProjectProvider = ({ children }: ProjectProviderProps) => {
  const { execute, loading, error, clearError } = useAsyncOperation()

  const state = useProjectState()
  const projectActions = useProjectActions()
  const taskActions = useTaskActions(execute)
  const resourceActions = useResourceActions(execute)
  const assignmentActions = useAssignmentActions(execute)

  const value = useMemo(() => {
    apiLogger.debug('ProjectProvider value updated', {
      tasksCount: state.tasks.length,
      resourcesCount: state.resources.length,
      assignmentsCount: state.assignments.length,
    })

    return {
      ...state,
      isLoading: loading,
      error,
      clearError,
      projectActions,
      taskActions: {
        ...taskActions,
        updateTask: taskActions.editTask,
        deleteTask: taskActions.removeTask,
        findTask: state.taskActions.findTask,
        filterTasksByStatus: state.taskActions.getTasksByStatus,
      },
      resourceActions: {
        ...resourceActions,
        updateResource: resourceActions.editResource,
        deleteResource: resourceActions.removeResource,
        findResource: state.resourceActions.findResource,
        filterResourcesByType: state.resourceActions.getResourcesByType,
        calculateUtilization: state.resourceActions.calculateUtilization,
      },
      assignmentActions: {
        ...assignmentActions,
        updateAssignment: assignmentActions.editAssignment,
        deleteAssignment: assignmentActions.removeAssignment,
        findAssignment: state.assignmentActions.findAssignment,
        validateAssignment: state.assignmentActions.validateAssignment,
      },
    } as ProjectContextType
  }, [
    state,
    loading,
    error,
    clearError,
    projectActions,
    taskActions,
    resourceActions,
    assignmentActions,
  ])

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

