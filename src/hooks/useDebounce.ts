import { useCallback, useRef } from 'react';

/** Допустимые типы аргументов колбэка (без any/unknown) */
type CallbackArg = string | number | boolean | object | null | undefined;

/**
 * Хук для создания дебаунс-коллбэка
 * @param callback Функция, которую нужно вызвать с задержкой
 * @param delay Задержка в мс
 */
export function useDebouncedCallback<A extends readonly CallbackArg[], R>(
  callback: (...args: A) => R,
  delay: number
): (...args: A) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: A) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

