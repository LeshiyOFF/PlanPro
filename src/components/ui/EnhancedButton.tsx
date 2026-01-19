/**
 * Enhanced Button с Event Flow интеграцией
 * Следует SOLID принципам и паттернам Event Flow
 */

import React, { forwardRef, useCallback } from 'react';
import { Button as ShadcnButton } from '@/components/ui/button';
import { useEventFlow } from '@/providers/EventFlowContext';
import { BaseEvent, EventType } from '@/types/EventFlowTypes';

/**
 * Props для EnhancedButton
 */
export interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  eventType?: EventType;
  eventData?: any;
  eventSource?: string;
  onEventDispatched?: (event: BaseEvent) => void;
  children: React.ReactNode;
}

/**
 * Enhanced Button компонент с Event Flow поддержкой
 * Автоматически диспетчеризирует события при клике
 */
export const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  (
    {
      onClick,
      eventType,
      eventData,
      eventSource = 'EnhancedButton',
      onEventDispatched,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const { dispatch } = useEventFlow();

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        // Вызываем оригинальный обработчик
        onClick?.(event);

        // Диспетчеризуем Event Flow событие
        if (eventType) {
          const flowEvent: BaseEvent = {
            id: `btn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: eventType,
            timestamp: new Date(),
            source: eventSource,
            data: {
              ...eventData,
              originalEvent: event,
              buttonText: typeof children === 'string' ? children : 'Button'
            }
          };

          dispatch(flowEvent);
          onEventDispatched?.(flowEvent);
        }
      },
      [onClick, eventType, eventData, eventSource, dispatch, onEventDispatched, children]
    );

    return (
      <ShadcnButton
        ref={ref}
        onClick={handleClick}
        className={className}
        {...props}
      >
        {children}
      </ShadcnButton>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

