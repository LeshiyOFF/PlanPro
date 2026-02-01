import React, { useRef, useEffect, useCallback } from 'react'
import { useEventFlow } from '../EventFlowContext'
import { EventHandler, EventType } from '@/types/EventFlowTypes'

/**
 * Хук для подписки на события с автоматической очисткой
 */
export const useEventSubscription = (
  eventType: EventType,
  handler: EventHandler,
  priority?: number,
  dependencies: React.DependencyList = [],
): string => {
  const { subscribe, unsubscribe } = useEventFlow()
  const subscriptionIdRef = useRef<string | null>(null)

  useEffect(() => {
    subscriptionIdRef.current = subscribe(eventType, handler, priority)

    return () => {
      if (subscriptionIdRef.current) {
        unsubscribe(subscriptionIdRef.current)
      }
    }
  }, [eventType, priority, ...dependencies])

  return subscriptionIdRef.current || ''
}

/**
 * Хук для подписки на одно выполнение события
 */
export const useEventOnce = (
  eventType: EventType,
  handler: EventHandler,
  dependencies: React.DependencyList = [],
): void => {
  const { once } = useEventFlow()

  useEffect(() => {
    once(eventType, handler)

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {} // once автоматически удаляется после выполнения
  }, [eventType, ...dependencies])
}

/**
 * Хук для диспетчеризации событий
 */
export const useEventDispatcher = () => {
  const { dispatch } = useEventFlow()

  return useCallback(dispatch, [])
}

