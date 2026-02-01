import { useEffect } from 'react'
import { useEventFlow } from '../EventFlowContext'
import { EventHandler } from '@/types/EventFlowTypes'
import { EventType } from '@/types/EventFlowTypes'

/**
 * Типизированные хуки для основных типов событий
 */
export const useProjectEvents = (handlers: {
  onProjectCreated?: EventHandler;
  onProjectOpened?: EventHandler;
  onProjectSaved?: EventHandler;
  onProjectModified?: EventHandler;
}) => {
  const { subscribe, unsubscribe } = useEventFlow()

  useEffect(() => {
    const subscriptions: string[] = []

    if (handlers.onProjectCreated) {
      subscriptions.push(
        subscribe(EventType.PROJECT_CREATED, handlers.onProjectCreated),
      )
    }
    if (handlers.onProjectOpened) {
      subscriptions.push(
        subscribe(EventType.PROJECT_OPENED, handlers.onProjectOpened),
      )
    }
    if (handlers.onProjectSaved) {
      subscriptions.push(
        subscribe(EventType.PROJECT_SAVED, handlers.onProjectSaved),
      )
    }
    if (handlers.onProjectModified) {
      subscriptions.push(
        subscribe(EventType.PROJECT_MODIFIED, handlers.onProjectModified),
      )
    }

    return () => {
      subscriptions.forEach(unsubscribe)
    }
  }, [handlers, subscribe, unsubscribe])
}

export const useTaskEvents = (handlers: {
  onTaskCreated?: EventHandler;
  onTaskUpdated?: EventHandler;
  onTaskDeleted?: EventHandler;
  onTaskSelected?: EventHandler;
}) => {
  const { subscribe, unsubscribe } = useEventFlow()

  useEffect(() => {
    const subscriptions: string[] = []

    if (handlers.onTaskCreated) {
      subscriptions.push(
        subscribe(EventType.TASK_CREATED, handlers.onTaskCreated),
      )
    }
    if (handlers.onTaskUpdated) {
      subscriptions.push(
        subscribe(EventType.TASK_UPDATED, handlers.onTaskUpdated),
      )
    }
    if (handlers.onTaskDeleted) {
      subscriptions.push(
        subscribe(EventType.TASK_DELETED, handlers.onTaskDeleted),
      )
    }
    if (handlers.onTaskSelected) {
      subscriptions.push(
        subscribe(EventType.TASK_SELECTED, handlers.onTaskSelected),
      )
    }

    return () => {
      subscriptions.forEach(unsubscribe)
    }
  }, [handlers, subscribe, unsubscribe])
}

