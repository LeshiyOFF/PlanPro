import { useProjectCRUD } from './project/useProjectCRUD'
import { useProjectOperations } from './project/useProjectOperations'
import { useAsyncOperation } from './useAsyncOperation'

/**
 * Агрегированный хук для действий с проектами
 * Следует принципу Composition over Inheritance
 */
export const useProjectActions = () => {
  const { execute } = useAsyncOperation()
  const crudActions = useProjectCRUD(execute)
  const businessActions = useProjectOperations(execute)

  return {
    ...crudActions,
    ...businessActions,
    // Алиасы для обратной совместимости
    createNewProject: crudActions.createProject,
    loadProject: crudActions.loadProject,
    saveProject: businessActions.saveProject,
    exportProject: businessActions.exportProject,
  }
}
