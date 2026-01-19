/**
 * Hook for synchronizing Undo/Redo between React store (Zustand) and Java Core
 * Provides consistent history management across frontend and backend
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { undoRedoService, UndoRedoState } from '@/services/UndoRedoService';

export interface UseUndoRedoSyncOptions {
  syncOnMount?: boolean;
  pollInterval?: number;
}

export interface UseUndoRedoSyncResult {
  canUndo: boolean;
  canRedo: boolean;
  undoName: string | null;
  redoName: string | null;
  historySize: number;
  undo: () => Promise<boolean>;
  redo: () => Promise<boolean>;
  clearHistory: () => Promise<boolean>;
  refreshState: () => Promise<void>;
  beginTransaction: () => Promise<boolean>;
  endTransaction: () => Promise<boolean>;
}

const defaultState: UndoRedoState = {
  canUndo: false,
  canRedo: false,
  undoName: null,
  redoName: null,
  editHistory: [],
  historySize: 0
};

export function useUndoRedoSync(options: UseUndoRedoSyncOptions = {}): UseUndoRedoSyncResult {
  const { syncOnMount = true, pollInterval } = options;
  const [state, setState] = useState<UndoRedoState>(defaultState);
  const isMountedRef = useRef(true);

  const refreshState = useCallback(async () => {
    const newState = await undoRedoService.getState();
    if (isMountedRef.current && newState) {
      setState(newState);
    }
  }, []);

  const undo = useCallback(async (): Promise<boolean> => {
    const result = await undoRedoService.undo();
    if (result) await refreshState();
    return result;
  }, [refreshState]);

  const redo = useCallback(async (): Promise<boolean> => {
    const result = await undoRedoService.redo();
    if (result) await refreshState();
    return result;
  }, [refreshState]);

  const clearHistory = useCallback(async (): Promise<boolean> => {
    const result = await undoRedoService.clearHistory();
    if (result) await refreshState();
    return result;
  }, [refreshState]);

  const beginTransaction = useCallback(async (): Promise<boolean> => {
    return undoRedoService.beginTransaction();
  }, []);

  const endTransaction = useCallback(async (): Promise<boolean> => {
    const result = await undoRedoService.endTransaction();
    if (result) await refreshState();
    return result;
  }, [refreshState]);

  useEffect(() => {
    isMountedRef.current = true;

    const unsubscribe = undoRedoService.addStateListener((newState) => {
      if (isMountedRef.current) {
        setState(newState);
      }
    });

    if (syncOnMount) {
      refreshState();
    }

    let intervalId: ReturnType<typeof setInterval> | undefined;
    if (pollInterval && pollInterval > 0) {
      intervalId = setInterval(refreshState, pollInterval);
    }

    return () => {
      isMountedRef.current = false;
      unsubscribe();
      if (intervalId) clearInterval(intervalId);
    };
  }, [syncOnMount, pollInterval, refreshState]);

  return {
    canUndo: state.canUndo,
    canRedo: state.canRedo,
    undoName: state.undoName,
    redoName: state.redoName,
    historySize: state.historySize,
    undo,
    redo,
    clearHistory,
    refreshState,
    beginTransaction,
    endTransaction
  };
}

export default useUndoRedoSync;
