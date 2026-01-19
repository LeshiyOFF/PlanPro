/**
 * Enhanced Input с Event Flow интеграцией
 * Следует SOLID принципам и паттернам Event Flow
 */

import React, { forwardRef, useCallback, useRef, useEffect } from 'react';
import { Input as ShadcnInput } from '@/components/ui/Input';
import { useEventFlow } from '@/providers/EventFlowProvider';
import { BaseEvent, EventType } from '@/types/EventFlowTypes';

/**
 * Props для EnhancedInput
 */
export interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  eventType?: EventType;
  eventData?: any;
  eventSource?: string;
  onEventDispatched?: (event: BaseEvent) => void;
  validateOnChange?: boolean;
  validationPattern?: RegExp;
  errorMessage?: string;
  debounceMs?: number;
  children?: React.ReactNode;
}

/**
 * Enhanced Input компонент с Event Flow поддержкой
 * Диспетчеризирует события при изменении и валидации
 */
export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  (
    {
      onChange,
      onBlur,
      onFocus,
      eventType,
      eventData,
      eventSource = 'EnhancedInput',
      onEventDispatched,
      validateOnChange = false,
      validationPattern,
      errorMessage = 'Invalid input',
      debounceMs = 300,
      value,
      className = '',
      ...props
    },
    ref
  ) => {
    const { dispatch } = useEventFlow();
    const debounceTimerRef = useRef<NodeJS.Timeout>();
    const lastValueRef = useRef<string>('');

    const dispatchEvent = useCallback(
      (type: EventType, additionalData?: any) => {
        if (eventType) {
          const flowEvent: BaseEvent = {
            id: `input_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            timestamp: new Date(),
            source: eventSource,
            data: {
              ...eventData,
              value,
              isValid: !validationPattern || validationPattern.test(String(value || '')),
              ...additionalData
            }
          };

          dispatch(flowEvent);
          onEventDispatched?.(flowEvent);
        }
      },
      [eventType, eventData, eventSource, dispatch, onEventDispatched, value, validationPattern]
    );

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        lastValueRef.current = newValue;

        // Отменяем предыдущий debounce
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        // Debounce обработка изменения
        debounceTimerRef.current = setTimeout(() => {
          // Валидация если включена
          if (validateOnChange && validationPattern) {
            const isValid = validationPattern.test(newValue);
            if (!isValid) {
              dispatchEvent(EventType.VALIDATION_ERROR, {
                field: props.name || 'input',
                message: errorMessage,
                value: newValue
              });
            }
          }

          dispatchEvent(EventType.UI_KEYBOARD_SHORTCUT, {
            action: 'inputChanged',
            newValue
          });
        }, debounceMs);

        onChange?.(event);
      },
      [onChange, validateOnChange, validationPattern, errorMessage, debounceMs, dispatchEvent, props.name]
    );

    const handleBlur = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        // Финальная валидация при потере фокуса
        if (validateOnChange && validationPattern) {
          const isValid = validationPattern.test(event.target.value);
          if (!isValid) {
            dispatchEvent(EventType.VALIDATION_ERROR, {
              field: props.name || 'input',
              message: errorMessage,
              value: event.target.value
            });
          }
        }

        dispatchEvent(EventType.UI_KEYBOARD_SHORTCUT, {
          action: 'inputBlurred',
          value: event.target.value
        });

        onBlur?.(event);
      },
      [onBlur, validateOnChange, validationPattern, errorMessage, dispatchEvent, props.name]
    );

    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        dispatchEvent(EventType.UI_KEYBOARD_SHORTCUT, {
          action: 'inputFocused',
          value: event.target.value
        });

        onFocus?.(event);
      },
      [onFocus, dispatchEvent]
    );

    // Очистка debounce при unmount
    useEffect(() => {
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, []);

    return (
      <ShadcnInput
        ref={ref}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className={className}
        {...props}
      />
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';
