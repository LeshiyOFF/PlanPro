import { useCallback } from 'react'
import type { Task } from '@/store/project/interfaces'
import type { Task as TaskTypesTask } from '@/types/task-types'
import { useProjectState } from './useProjectState'
import { useAsyncOperation } from './useAsyncOperation'
import { TaskUtils } from '@/utils/task-utils'
import { logger } from '@/utils/logger'

/**
 * Хук для действий с задачами
 */
export const useTaskActions = (execute: ReturnType<typeof useAsyncOperation>['execute']) => {
  const { addTaskUpdater, updateTaskUpdater, deleteTaskUpdater } = useProjectState()

  const addTask = addTaskUpdater()
  const updateTask = updateTaskUpdater()
  const deleteTask = deleteTaskUpdater()

  /**
   * Создание новой задачи
   */
  const createTask = useCallback(async (
    taskData: Omit<Task, 'id'>,
  ): Promise<Task> => {
    const validateResult = TaskUtils.validateTask(taskData as Partial<TaskTypesTask>)
    if (validateResult) {
      throw new Error(validateResult)
    }

    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
    }

    await execute(
      async () => {
        addTask(newTask)
        logger.info('Задача создана', {
          taskId: newTask.id,
          taskName: newTask.name,
        })
        return newTask
      },
      'Не удалось создать задачу',
    )

    return newTask
  }, [addTask, execute])

  /**
   * Обновление задачи
   */
  const editTask = useCallback(async (
    id: string,
    updates: Partial<Task>,
  ): Promise<Task> => {
    const validateResult = TaskUtils.validateTask(updates as Partial<TaskTypesTask>)
    if (validateResult) {
      throw new Error(validateResult)
    }

    await execute(
      async () => {
        const updatedTask = updateTask(id, updates)
        if (!updatedTask) {
          throw new Error('Задача не найдена')
        }

        logger.info('Задача обновлена', {
          taskId: id,
          updates: Object.keys(updates),
        })

        return updatedTask
      },
      'Не удалось обновить задачу',
    )

    const updated = updateTask(id, updates)
    if (!updated) {
      throw new Error('Задача не найдена')
    }
    return updated
  }, [updateTask, execute])

  /**
   * Удаление задачи
   */
  const removeTask = useCallback(async (id: string): Promise<void> => {
    await execute(
      async () => {
        const success = deleteTask(id)
        if (!success) {
          throw new Error('Задача не найдена')
        }

        logger.info('Задача удалена', { taskId: id })
      },
      'Не удалось удалить задачу',
    )
  }, [deleteTask, execute])

  return {
    createTask,
    editTask,
    removeTask,
  }
}

