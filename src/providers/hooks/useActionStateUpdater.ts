import { useEffect, useCallback } from 'react';

/**
 * Хук для периодического обновления состояний действий
 */
export const useActionStateUpdater = (updateActionStates: () => void, intervalMs: number = 5000) => {
  useEffect(() => {
    // Обновляем состояния каждые N секунд или по триггеру
    const interval = setInterval(() => {
      updateActionStates();
    }, intervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [updateActionStates, intervalMs]);
};

