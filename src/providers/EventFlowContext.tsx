import { createContext, useContext } from 'react'
import { EventHandler, EventType, BaseEvent } from '@/types/EventFlowTypes'

/**
 * Интерфейс контекста для Event Flow
 */
export interface EventFlowContextType {
  dispatch: (event: BaseEvent) => void;
  subscribe: (eventType: EventType, handler: EventHandler, priority?: number) => string;
  unsubscribe: (subscriptionId: string) => void;
  once: (eventType: EventType, handler: EventHandler) => string;
}

/**
 * Контекст для Event Flow системы
 */
export const EventFlowContext = createContext<EventFlowContextType | null>(null)

/**
 * Хук для использования Event Flow
 */
export const useEventFlow = (): EventFlowContextType => {
  const context = useContext(EventFlowContext)

  if (!context) {
    throw new Error('useEventFlow must be used within an EventFlowProvider')
  }

  return context
}
