import React, { useRef, useCallback } from 'react';
import { eventDispatcher } from '@/services/EventDispatcher';
import { EventHandler, EventType, EventSubscription } from '@/types/EventFlowTypes';

/**
 * Хук для управления Event Flow
 */
export const useEventFlowManager = (debug: boolean = false) => {
  const subscriptionsRef = useRef<Map<string, EventSubscription>>(new Map());

  const dispatch = useCallback((event: any) => {
    if (debug) {
      console.log('EventFlow: Dispatching event', event);
    }
    eventDispatcher.dispatch(event);
  }, [debug]);

  const subscribe = useCallback((
    eventType: EventType, 
    handler: EventHandler, 
    priority?: number
  ): string => {
    const subscriptionId = eventDispatcher.subscribe(eventType, handler, priority);
    
    if (debug) {
      console.log('EventFlow: Subscribed to', eventType, 'with ID:', subscriptionId);
    }
    
    // Сохраняем информацию о подписке для очистки
    subscriptionsRef.current.set(subscriptionId, {
      id: subscriptionId,
      eventType,
      handler,
      priority: priority || 0,
      once: false
    });

    return subscriptionId;
  }, [debug]);

  const unsubscribe = useCallback((subscriptionId: string) => {
    eventDispatcher.unsubscribe(subscriptionId);
    subscriptionsRef.current.delete(subscriptionId);
    
    if (debug) {
      console.log('EventFlow: Unsubscribed', subscriptionId);
    }
  }, [debug]);

  const once = useCallback((eventType: EventType, handler: EventHandler): string => {
    const subscriptionId = eventDispatcher.once(eventType, handler);
    
    if (debug) {
      console.log('EventFlow: Subscribed once to', eventType, 'with ID:', subscriptionId);
    }
    
    return subscriptionId;
  }, [debug]);

  // Очистка всех подписок
  const cleanup = useCallback(() => {
    if (debug) {
      console.log('EventFlow: Cleaning up subscriptions', subscriptionsRef.current.size);
    }
    
    for (const subscriptionId of subscriptionsRef.current.keys()) {
      eventDispatcher.unsubscribe(subscriptionId);
    }
    subscriptionsRef.current.clear();
  }, [debug]);

  return {
    dispatch,
    subscribe,
    unsubscribe,
    once,
    cleanup
  };
};

