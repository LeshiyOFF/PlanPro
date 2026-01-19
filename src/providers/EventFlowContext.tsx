import React, { createContext, useContext } from 'react';
import { EventHandler, EventType } from '@/types/EventFlowTypes';

/**
 * Контекст для Event Flow системы
 */
export const EventFlowContext = createContext<EventFlowContextType | null>(null);

/**
 * Интерфейс контекста для Event Flow
 */
export interface EventFlowContextType {
  dispatch: (event: any) => void;
  subscribe: (eventType: EventType, handler: EventHandler, priority?: number) => string;
  unsubscribe: (subscriptionId: string) => void;
  once: (eventType: EventType, handler: EventHandler) => string;
}

/**
 * Хук для использования Event Flow
 */
export const useEventFlow = (): EventFlowContextType => {
  const context = useContext(EventFlowContext);
  
  if (!context) {
    throw new Error('useEventFlow must be used within an EventFlowProvider');
  }
  
  return context;
};

