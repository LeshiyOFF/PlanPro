import React, { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import { 
  DialogState, 
  DialogContextType,
  DialogResult
} from './DialogStateTypes';
import type { JsonObject } from '../json-types';

/** Тип данных по умолчанию для контекста диалогов (без any) */
type DefaultDialogData = Record<string, JsonObject>;

/**
 * Типизированный контекст для диалоговых окон
 */
const TypedDialogContext = createContext<DialogContextType<DefaultDialogData, DefaultDialogData> | undefined>(undefined);

export const TypedDialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentDialog, setCurrentDialog] = useState<DialogState<DefaultDialogData, DefaultDialogData> | null>(null);

  const openDialog = useCallback(<TData, TResult>(
    _type: string,
    data?: TData
  ): DialogState<TData, TResult> => {
    const newState: DialogState<TData, TResult> = {
      isOpen: true,
      isSubmitting: false,
      error: null,
      data,
      result: null
    };
    setCurrentDialog(newState as DialogState<DefaultDialogData, DefaultDialogData>);
    return newState;
  }, []);

  const closeDialog = useCallback((): void => {
    setCurrentDialog(null);
  }, []);

  const submitDialog = useCallback(async <TData, TResult>(
    data: TData
  ): Promise<DialogResult<TResult>> => {
    if (!currentDialog) return { success: false, error: 'No dialog open' };
    return { success: true, data: data as TResult };
  }, [currentDialog]);

  const value: DialogContextType<DefaultDialogData, DefaultDialogData> = {
    currentDialog,
    openDialog,
    closeDialog,
    submitDialog
  };

  return (
    <TypedDialogContext.Provider value={value}>
      {children}
    </TypedDialogContext.Provider>
  );
};

export const useTypedDialogContext = () => {
  const context = useContext(TypedDialogContext);
  if (!context) throw new Error('useTypedDialogContext must be used within TypedDialogProvider');
  return context;
};
