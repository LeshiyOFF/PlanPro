import { useCallback } from 'react'
import { useProjectStore } from '@/store/projectStore'
import { ICalendarEvent } from '@/domain/calendar/interfaces/ICalendarEvent'

export type UpdateTaskFn = (taskId: string, updates: { startDate: Date; endDate: Date }) => void

/**
 * Хук для обработки логики Drag-and-drop в календаре.
 * Если передан updateTaskOverride, он используется при сбросе (для проверки конфликта дат).
 */
export const useCalendarDnD = (updateTaskOverride?: UpdateTaskFn) => {
  const { updateTask: storeUpdateTask, tasks } = useProjectStore()
  const updateTask = updateTaskOverride ?? storeUpdateTask

  /**
   * Начало перетаскивания
   */
  const handleDragStart = useCallback((e: React.DragEvent, event: ICalendarEvent) => {
    e.dataTransfer.setData('taskId', event.id)
    e.dataTransfer.effectAllowed = 'move'

    // Визуальный эффект при перетаскивании
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5'
    }
  }, [])

  /**
   * Окончание перетаскивания (очистка стилей)
   */
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
  }, [])

  /**
   * Обработка сброса задачи на день календаря
   */
  const handleDrop = useCallback((e: React.DragEvent, targetDate: Date) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (!taskId) return

    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    // Вычисляем разницу в днях для сохранения длительности задачи
    const originalStart = new Date(task.startDate)
    const originalEnd = new Date(task.endDate)
    const durationMs = originalEnd.getTime() - originalStart.getTime()

    // Устанавливаем новое время начала (сохраняя оригинальное время суток)
    const newStart = new Date(targetDate)
    newStart.setHours(originalStart.getHours(), originalStart.getMinutes(), 0, 0)

    // Вычисляем новое время окончания
    const newEnd = new Date(newStart.getTime() + durationMs)

    updateTask(taskId, {
      startDate: newStart,
      endDate: newEnd,
    })
  }, [tasks, updateTask])

  return {
    handleDragStart,
    handleDragEnd,
    handleDrop,
  }
}


