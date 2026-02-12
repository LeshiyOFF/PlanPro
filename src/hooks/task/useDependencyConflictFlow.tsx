import React, { useCallback } from 'react'
import { TaskLinkService } from '@/domain/services/TaskLinkService'
import type { ProjectStore } from '@/store/project/interfaces'

export interface UseDependencyConflictFlowParams {
  store: ProjectStore;
  linkingTaskId: string | null;
  setLinkingTaskId: (id: string | null) => void;
}

/**
 * Хук для режима связывания задач через ПКМ.
 * При выборе предшественника всегда вызывается linkTasks (даты подстраиваются автоматически, диалог не показывается).
 */
export function useDependencyConflictFlow({
  store,
  linkingTaskId,
  setLinkingTaskId,
}: UseDependencyConflictFlowParams): {
  handleTaskSelect: (task: { id: string }) => void;
} {
  const handleTaskSelect = useCallback((task: { id: string }) => {
    if (!linkingTaskId || linkingTaskId === task.id) return
    store.linkTasks(linkingTaskId, task.id)
    setLinkingTaskId(null)
  }, [linkingTaskId, store, setLinkingTaskId])

  return { handleTaskSelect }
}
