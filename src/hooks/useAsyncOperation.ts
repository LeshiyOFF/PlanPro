import { useState, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface AsyncOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  loadingMessage?: string;
}

/**
 * Hook для управления асинхронными операциями с loading и error states
 */
export const useAsyncOperation = <T = any>(initialState: Partial<AsyncState<T>> = {}) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
    ...initialState
  });

  const execute = useCallback(async (
    asyncFunction: () => Promise<T>,
    options: AsyncOperationOptions = {}
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await asyncFunction();
      
      setState(prev => ({
        ...prev,
        data: result,
        loading: false,
        error: null
      }));

      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      if (options.onError) {
        options.onError(error as Error);
      }

      console.error('Async operation failed:', error);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    clearError
  };
};

/**
 * Hook для batch асинхронных операций
 */
export const useBatchOperations = <T = any>() => {
  const [operations, setOperations] = useState<Map<string, AsyncState<T>>>(new Map());
  const [globalError, setGlobalError] = useState<string | null>(null);

  const execute = useCallback(async (
    key: string,
    asyncFunction: () => Promise<T>,
    options: AsyncOperationOptions = {}
  ): Promise<T | null> => {
    setOperations(prev => new Map(prev).set(key, { 
      ...prev.get(key), 
      loading: true, 
      error: null 
    }));

    try {
      const result = await asyncFunction();
      
      setOperations(prev => new Map(prev).set(key, {
        data: result,
        loading: false,
        error: null
      }));

      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      setOperations(prev => new Map(prev).set(key, {
        data: prev.get(key)?.data || null,
        loading: false,
        error: errorMessage
      }));

      setGlobalError(errorMessage);

      if (options.onError) {
        options.onError(error as Error);
      }

      console.error(`Batch operation ${key} failed:`, error);
      return null;
    }
  }, []);

  const getOperation = useCallback((key: string) => {
    return operations.get(key) || { data: null, loading: false, error: null };
  }, [operations]);

  const clearOperation = useCallback((key: string) => {
    setOperations(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setOperations(prev => {
      const newMap = new Map(prev);
      newMap.forEach((_, key) => {
        newMap.set(key, { ...newMap.get(key), error: null });
      });
      return newMap;
    });
    setGlobalError(null);
  }, []);

  const hasAnyLoading = useCallback(() => {
    return Array.from(operations.values()).some(op => op.loading);
  }, [operations]);

  const hasAnyError = useCallback(() => {
    return globalError !== null || Array.from(operations.values()).some(op => op.error !== null);
  }, [operations, globalError]);

  return {
    operations,
    globalError,
    execute,
    getOperation,
    clearOperation,
    clearErrors,
    hasAnyLoading,
    hasAnyError
  };
};

