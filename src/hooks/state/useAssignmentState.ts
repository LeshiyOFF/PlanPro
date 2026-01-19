import { useState, useCallback } from 'react'
import type { Assignment } from '@/types'
import { AssignmentUtils } from '@/utils/assignment-utils'

/**
 * Хук для управления состоянием назначений
 * Следует принципу Single Responsibility
 */
export const useAssignmentState = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([])

  /**
   * Добавление нового назначения
   */
  const addAssignment = useCallback((newAssignment: Assignment) => {
    setAssignments(prev => [...prev, newAssignment])
  }, [])

  /**
   * Обновление существующего назначения
   */
  const updateAssignment = useCallback((
    id: string,
    updates: Partial<Assignment>,
  ): Assignment | undefined => {
    setAssignments(prev =>
      prev.map(assignment =>
        assignment.id === id ? { ...assignment, ...updates } : assignment,
      ),
    )

    return assignments.find(assignment => assignment.id === id)
  }, [assignments])

  /**
   * Удаление назначения
   */
  const deleteAssignment = useCallback((id: string): boolean => {
    const exists = assignments.some(assignment => assignment.id === id)
    if (exists) {
      setAssignments(prev => prev.filter(assignment => assignment.id !== id))
    }
    return exists
  }, [assignments])

  /**
   * Поиск назначения по ID
   */
  const findAssignment = useCallback((id: string): Assignment | undefined => {
    return assignments.find(assignment => assignment.id === id)
  }, [assignments])

  /**
   * Валидация назначения
   */
  const validateAssignment = useCallback((assignment: Partial<Assignment>): string | null => {
    return AssignmentUtils.validateAssignment(assignment)
  }, [])

  /**
   * Очистка всех назначений
   */
  const clearAssignments = useCallback(() => {
    setAssignments([])
  }, [])

  /**
   * Фильтрация назначений по задаче
   */
  const getAssignmentsByTask = useCallback((taskId: string): Assignment[] => {
    return assignments.filter(assignment => assignment.taskId === taskId)
  }, [assignments])

  /**
   * Фильтрация назначений по ресурсу
   */
  const getAssignmentsByResource = useCallback((resourceId: string): Assignment[] => {
    return assignments.filter(assignment => assignment.resourceId === resourceId)
  }, [assignments])

  return {
    assignments,
    setAssignments,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    findAssignment,
    validateAssignment,
    clearAssignments,
    getAssignmentsByTask,
    getAssignmentsByResource,
  }
}

