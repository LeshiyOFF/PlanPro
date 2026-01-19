import { useCallback } from 'react'
import type { Assignment } from '@/types'
import { useProjectState } from './useProjectState'
import { useAsyncOperation } from './useAsyncOperation'
import { AssignmentUtils } from '@/utils/assignment-utils'
import { logger } from '@/utils/logger'

/**
 * Хук для действий с назначениями
 */
export const useAssignmentActions = (execute: ReturnType<typeof useAsyncOperation>['execute']) => {
  const { addAssignmentUpdater, updateAssignmentUpdater, deleteAssignmentUpdater } = useProjectState()

  const addAssignment = addAssignmentUpdater()
  const updateAssignment = updateAssignmentUpdater()
  const deleteAssignment = deleteAssignmentUpdater()

  /**
   * Создание нового назначения
   */
  const createAssignment = useCallback(async (
    assignmentData: Omit<Assignment, 'id'>,
  ): Promise<Assignment> => {
    const validateResult = AssignmentUtils.validateAssignment(assignmentData)
    if (validateResult) {
      throw new Error(validateResult)
    }

    const newAssignment: Assignment = {
      ...assignmentData,
      id: Date.now().toString(),
    }

    await execute(
      async () => {
        addAssignment(newAssignment)
        logger.info('Назначение создано', {
          assignmentId: newAssignment.id,
          taskId: newAssignment.taskId,
          resourceId: newAssignment.resourceId,
        })
        return newAssignment
      },
      'Не удалось создать назначение',
    )

    return newAssignment
  }, [addAssignment, execute])

  /**
   * Обновление назначения
   */
  const editAssignment = useCallback(async (
    id: string,
    updates: Partial<Assignment>,
  ): Promise<Assignment> => {
    const validateResult = AssignmentUtils.validateAssignment(updates)
    if (validateResult) {
      throw new Error(validateResult)
    }

    await execute(
      async () => {
        const updatedAssignment = updateAssignment(id, updates)
        if (!updatedAssignment) {
          throw new Error('Назначение не найдено')
        }

        logger.info('Назначение обновлено', {
          assignmentId: id,
          updates: Object.keys(updates),
        })

        return updatedAssignment
      },
      'Не удалось обновить назначение',
    )

    const updated = updateAssignment(id, updates)
    if (!updated) {
      throw new Error('Назначение не найдено')
    }
    return updated
  }, [updateAssignment, execute])

  /**
   * Удаление назначения
   */
  const removeAssignment = useCallback(async (id: string): Promise<void> => {
    await execute(
      async () => {
        const success = deleteAssignment(id)
        if (!success) {
          throw new Error('Назначение не найдено')
        }

        logger.info('Назначение удалено', { assignmentId: id })
      },
      'Не удалось удалить назначение',
    )
  }, [deleteAssignment, execute])

  return {
    createAssignment,
    editAssignment,
    removeAssignment,
  }
}

