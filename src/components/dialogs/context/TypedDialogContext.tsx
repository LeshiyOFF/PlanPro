/**
 * Типизированный контекст для диалогов
 * Использует TypedDialogService с полной типизацией
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { DialogType, DialogData, DialogResult } from '@/types/dialog/IDialogRegistry';
import { IDialogState, IDialogOperationResult } from '@/services/interfaces/IDialogService';
import { dialogService } from '@/services/dialog/TypedDialogService';

/**
 * Интерфейс контекста
 */
interface ITypedDialogContext {
  openDialog: <T extends DialogType>(
    type: T,
    data: DialogData<T>
  ) => Promise<IDialogOperationResult<T>>;
  
  closeDialog: <T extends DialogType>(
    type: T,
    result?: DialogResult<T>
  ) => void;
  
  getState: <T extends DialogType>(type: T) => IDialogState<T> | null;
  
  isOpen: (type: DialogType) => boolean;
}

/**
 * Создание контекста
 */
const TypedDialogContext = createContext<ITypedDialogContext | undefined>(undefined);

/**
 * Провайдер контекста
 */
interface TypedDialogProviderProps {
  readonly children: ReactNode;
}

export const TypedDialogProvider: React.FC<TypedDialogProviderProps> = ({ children }) => {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = dialogService.subscribe(() => {
      forceUpdate({});
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const contextValue: ITypedDialogContext = {
    openDialog: async <T extends DialogType>(
      type: T,
      data: DialogData<T>
    ): Promise<IDialogOperationResult<T>> => {
      return dialogService.open(type, data);
    },

    closeDialog: <T extends DialogType>(
      type: T,
      result?: DialogResult<T>
    ): void => {
      dialogService.close(type, result);
    },

    getState: <T extends DialogType>(type: T): IDialogState<T> | null => {
      return dialogService.getState(type);
    },

    isOpen: (type: DialogType): boolean => {
      return dialogService.isOpen(type);
    }
  };

  return (
    <TypedDialogContext.Provider value={contextValue}>
      {children}
    </TypedDialogContext.Provider>
  );
};

/**
 * Хук для использования контекста
 */
export const useTypedDialog = (): ITypedDialogContext => {
  const context = useContext(TypedDialogContext);
  if (context === undefined) {
    throw new Error('useTypedDialog must be used within a TypedDialogProvider');
  }
  return context;
};

/**
 * Хук для конкретного диалога с типизацией
 */
export const useDialog = <T extends DialogType>(type: T) => {
  const context = useTypedDialog();
  const state = context.getState(type);

  return {
    isOpen: context.isOpen(type),
    state,
    open: (data: DialogData<T>) => context.openDialog(type, data),
    close: (result?: DialogResult<T>) => context.closeDialog(type, result)
  };
};
