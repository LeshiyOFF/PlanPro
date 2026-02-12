import React, { useState, useCallback } from 'react'
import { TaskLinkService } from '@/domain/services/TaskLinkService'
import type { DependencyConflictResult, DependencyConflictKind } from '@/domain/services/TaskLinkService'
import type { DependencyConflictAction } from '@/components/dialogs/task/DependencyConflictDialog'
import { DependencyConflictDialog } from '@/components/dialogs/task/DependencyConflictDialog'
import { ConfirmConflictDialog } from '@/components/dialogs/task/ConfirmConflictDialog'
import type { ProjectStore } from '@/store/project/interfaces'
import type { Task } from '@/store/project/interfaces'

/** Хранилище принятых пользователем конфликтов по связям (predecessorId → successorId) в рамках проекта. */
const ACKNOWLEDGED_CONFLICT_LINKS = new Set<string>()

function buildAcknowledgedLinkKey(
  projectId: number | undefined,
  predecessorId: string,
  successorId: string,
): string {
  return `${projectId ?? ''}-${predecessorId}-${successorId}`
}

function hasAcknowledgedLink(
  projectId: number | undefined,
  predecessorId: string,
  successorId: string,
): boolean {
  return ACKNOWLEDGED_CONFLICT_LINKS.has(buildAcknowledgedLinkKey(projectId, predecessorId, successorId))
}

function addAcknowledgedLink(
  projectId: number | undefined,
  predecessorId: string,
  successorId: string,
): void {
  ACKNOWLEDGED_CONFLICT_LINKS.add(buildAcknowledgedLinkKey(projectId, predecessorId, successorId))
}

function removeAcknowledgedLink(
  projectId: number | undefined,
  predecessorId: string,
  successorId: string,
): void {
  ACKNOWLEDGED_CONFLICT_LINKS.delete(buildAcknowledgedLinkKey(projectId, predecessorId, successorId))
}

function clearAcknowledgedLinksForSuccessor(
  projectId: number | undefined,
  successorId: string,
  predecessorIds: string[],
): void {
  predecessorIds.forEach((predId) => removeAcknowledgedLink(projectId, predId, successorId))
}

export interface PendingUpdate {
  taskId: string;
  updates: Partial<Task>;
  predecessorId: string;
  conflictKind?: DependencyConflictKind;
}

export interface UseTaskUpdateWithConflictCheckParams {
  store: ProjectStore;
}

/**
 * Хук: проверка конфликта дат при изменении дат задачи (перетаскивание на Ганте или в календаре).
 * Возвращает обёртку updateTask и диалоги выбора.
 */
export function useTaskUpdateWithConflictCheck({
  store,
}: UseTaskUpdateWithConflictCheckParams): {
  /** Возвращает true, если обновление применено; false, если показан диалог конфликта (диалог не закрывать). */
  updateTask: (taskId: string, updates: Partial<Task>) => boolean;
  UpdateConflictDialogs: React.FC;
} {
  const [pending, setPending] = useState<{
    conflict: DependencyConflictResult;
    taskId: string;
    updates: Partial<Task>;
    predecessorId: string;
  } | null>(null)
  const [confirmPending, setConfirmPending] = useState<PendingUpdate | null>(null)

  const applyUpdate = useCallback((taskId: string, updates: Partial<Task>) => {
    store.updateTask(taskId, updates)
  }, [store])

  const updateTask = useCallback((taskId: string, updates: Partial<Task>): boolean => {
    if (!updates.startDate) {
      store.updateTask(taskId, updates)
      return true
    }
    const detected = TaskLinkService.detectConflictForMove(store.tasks, taskId, updates.startDate)
    if (detected) {
      if (hasAcknowledgedLink(store.currentProjectId, detected.predecessorId, taskId)) {
        const task = store.tasks.find((t) => t.id === taskId)
        if (task) {
          store.updateTask(taskId, {
            ...updates,
            startDate: updates.startDate,
            endDate: updates.endDate ?? task.endDate,
          })
        }
        return true
      }
      const task = store.tasks.find((t) => t.id === taskId)
      setPending({
        conflict: detected.conflict,
        taskId,
        updates: {
          ...updates,
          endDate: updates.endDate ?? task?.endDate,
        },
        predecessorId: detected.predecessorId,
      })
      return false
    }
    const task = store.tasks.find((t) => t.id === taskId)
    if (task?.predecessors?.length) {
      clearAcknowledgedLinksForSuccessor(store.currentProjectId, taskId, task.predecessors)
    }
    store.updateTask(taskId, updates)
    return true
  }, [store])

  /** Откат задачи к датам из store (новые ссылки Date) и закрытие диалога. Используется при «Отмена» и при закрытии по клику вне окна. */
  const revertAndCloseConflict = useCallback(() => {
    if (!pending) return
    const task = store.tasks.find(t => t.id === pending.taskId)
    if (task) {
      store.updateTask(pending.taskId, {
        startDate: new Date(task.startDate.getTime()),
        endDate: new Date(task.endDate.getTime()),
        progress: task.progress,
      })
    }
    setPending(null)
  }, [pending, store])

  const handleAction = useCallback((action: DependencyConflictAction) => {
    if (!pending) return
    const { taskId, updates, predecessorId, conflict } = pending
    const task = store.tasks.find(t => t.id === taskId)

    if (action === 'cancel') {
      revertAndCloseConflict()
      return
    }

    if (action === 'adjust_dates') {
      const endDate = updates.endDate ?? task?.endDate
      const durationMs = endDate ? endDate.getTime() - (updates.startDate?.getTime() ?? 0) : 0
      const newEnd = new Date(conflict.minStartDate.getTime() + durationMs)
      applyUpdate(taskId, {
        ...updates,
        startDate: conflict.minStartDate,
        endDate: newEnd,
        progress: updates.progress ?? task?.progress,
      })
    } else if (action === 'remove_link' && task) {
      const newPreds = (task.predecessors ?? []).filter((id) => id !== predecessorId)
      store.updateTask(taskId, { ...updates, predecessors: newPreds })
      removeAcknowledgedLink(store.currentProjectId, predecessorId, taskId)
    } else if (action === 'confirm_without_fix') {
      setConfirmPending({
        taskId,
        updates,
        predecessorId,
        conflictKind: conflict.conflictKind,
      })
    }

    setPending(null)
  }, [pending, store, applyUpdate, revertAndCloseConflict])

  const handleConfirmWithoutFix = useCallback(() => {
    if (!confirmPending) return
    addAcknowledgedLink(store.currentProjectId, confirmPending.predecessorId, confirmPending.taskId)
    store.updateTask(confirmPending.taskId, confirmPending.updates)
    setConfirmPending(null)
  }, [confirmPending, store])

  const UpdateConflictDialogs: React.FC = () => (
    <>
      {pending && (
        <DependencyConflictDialog
          open={!!pending}
          onClose={revertAndCloseConflict}
          conflict={pending.conflict}
          onAction={handleAction}
        />
      )}
      <ConfirmConflictDialog
        open={!!confirmPending}
        onClose={() => setConfirmPending(null)}
        onConfirm={handleConfirmWithoutFix}
        conflictKind={confirmPending?.conflictKind}
      />
    </>
  )

  return { updateTask, UpdateConflictDialogs }
}
