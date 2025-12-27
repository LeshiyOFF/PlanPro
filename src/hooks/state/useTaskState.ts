import { useState, useCallback } from 'react'
import type { Task } from '@/types'
import { TaskUtils } from '@/utils/task-utils'

/**
 * Хук для управления состоянием задач
 * Следует принципу Single Responsibility
 */
export const useTaskState = () => {
  const [tasks, setTasks] = useState<Task[]>([])

  /**
   * Добавление новой задачи
   */
  const addTask = useCallback((newTask: Task) => {
    setTasks(prev => [...prev, newTask])
  }, [])

  /**
   * Обновление существующей задачи
   */
  const updateTask = useCallback((
    id: string,
    updates: Partial<Task>,
  ): Task | undefined => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, ...updates } : task,
      ),
    )

    return tasks.find(task => task.id === id)
  }, [tasks])

  /**
   * Удаление задачи
   */
  const deleteTask = useCallback((id: string): boolean => {
    const exists = tasks.some(task => task.id === id)
    if (exists) {
      setTasks(prev => prev.filter(task => task.id !== id))
    }
    return exists
  }, [tasks])

  /**
   * Поиск задачи по ID
   */
  const findTask = useCallback((id: string): Task | undefined => {
    return tasks.find(task => task.id === id)
  }, [tasks])

  /**
   * Валидация задачи
   */
  const validateTask = useCallback((task: Partial<Task>): string | null => {
    return TaskUtils.validateTask(task)
  }, [])

  /**
   * Очистка всех задач
   */
  const clearTasks = useCallback(() => {
    setTasks([])
  }, [])

  /**
   * Фильтрация задач по статусу
   */
  const getTasksByStatus = useCallback((status: Task['status']): Task[] => {
    return tasks.filter(task => task.status === status)
  }, [tasks])

  /**
   * Получение корневых задач (без родительских)
   */
  const getRootTasks = useCallback((): Task[] => {
    return tasks.filter(task => !task.parentId)
  }, [tasks])

  /**
   * Получение дочерних задач
   */
  const getChildTasks = useCallback((parentId: string): Task[] => {
    return tasks.filter(task => task.parentId === parentId)
  }, [tasks])

  /**
   * Перемещение задачи в иерархии
   */
  const moveTask = useCallback((
    taskId: string,
    newParentId: string | null,
  ): boolean => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return false

    setTasks(prev =>
      prev.map(t =>
        t.id === taskId ? { ...t, parentId: newParentId } : t,
      ),
    )

    return true
  }, [tasks])

  return {
    tasks,
    setTasks,
    addTask,
    updateTask,
    deleteTask,
    findTask,
    validateTask,
    clearTasks,
    getTasksByStatus,
    getRootTasks,
    getChildTasks,
    moveTask,
  }
}
