import { useState, useCallback } from 'react'
import type { Assignment } from '@/types/resource-types'
import { AssignmentUtils } from '@/utils/assignment-utils'

/**
 * Хук для управления состоянием назначений (resource-types).
 * Следует принципу Single Responsibility.
 */
export const useAssignmentState = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([])

  const addAssignment = useCallback((newAssignment: Assignment) => {
    setAssignments(prev => [...prev, newAssignment])
  }, [])

  const updateAssignment = useCallback((
    id: string,
    updates: Partial<Assignment>,
  ): Assignment | undefined => {
    const current = assignments.find(a => a.id === id)
    if (!current) return undefined
    const merged: Assignment = { ...current, ...updates }
    setAssignments(prev => prev.map(a => (a.id === id ? merged : a)))
    return merged
  }, [assignments])

  const deleteAssignment = useCallback((id: string): boolean => {
    const exists = assignments.some(a => a.id === id)
    if (exists) {
      setAssignments(prev => prev.filter(a => a.id !== id))
    }
    return exists
  }, [assignments])

  const findAssignment = useCallback((id: string): Assignment | undefined => {
    return assignments.find(a => a.id === id)
  }, [assignments])

  const validateAssignment = useCallback((assignment: Partial<Assignment>): string | null => {
    return AssignmentUtils.validateAssignment(assignment)
  }, [])

  const clearAssignments = useCallback(() => {
    setAssignments([])
  }, [])

  const getAssignmentsByTask = useCallback((taskId: string): Assignment[] => {
    return assignments.filter(a => a.taskId === taskId)
  }, [assignments])

  const getAssignmentsByResource = useCallback((resourceId: string): Assignment[] => {
    return assignments.filter(a => a.resourceId === resourceId)
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

