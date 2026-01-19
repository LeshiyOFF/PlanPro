import React, { useEffect } from 'react';
import { EventFlowContext, EventFlowContextType } from './EventFlowContext';
import { useEventFlowManager } from './hooks/useEventFlowManager';

/**
 * Props для EventFlowProvider
 */
interface EventFlowProviderProps {
  children: React.ReactNode;
  debug?: boolean;
}

/**
 * Provider для Event Flow системы
 * Управляет подписками и очисткой при unmount
 */
export const EventFlowProvider: React.FC<EventFlowProviderProps> = ({ 
  children, 
  debug = false 
}) => {
  const eventFlowManager = useEventFlowManager(debug);

  // Очистка всех подписок при unmount
  useEffect(() => {
    return () => {
      eventFlowManager.cleanup();
    };
  }, [eventFlowManager]);

  const contextValue: EventFlowContextType = {
    dispatch: eventFlowManager.dispatch,
    subscribe: eventFlowManager.subscribe,
    unsubscribe: eventFlowManager.unsubscribe,
    once: eventFlowManager.once
  };

  return (
    <EventFlowContext.Provider value={contextValue}>
      {children}
    </EventFlowContext.Provider>
  );
};

export default EventFlowProvider;
