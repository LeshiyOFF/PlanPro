import React, { useContext, useCallback, useState, createContext } from 'react'
import { logger } from '@/utils/logger'
import { getErrorMessage } from '@/utils/errorUtils'
import { StrictData } from '@/types/Master_Functionality_Catalog'
import type { DialogType as DialogTypeFromTypes } from '@/types/dialog/DialogType'
import type { DefaultDialogData, DefaultDialogResult, DialogResult } from '@/types/dialog/DialogStateTypes'

/** Реэкспорт для обратной совместимости */
export type DialogType = DialogTypeFromTypes;

/**
 * Базовые типы для диалогов (без any)
 */
export interface BaseDialogData {
  title: string;
  projectId?: string;
  onClose?: () => void;
}

export interface BaseDialogActions {
  onOk?: () => void;
  onCancel?: () => void;
  onHelp?: () => void;
}

/**
 * Состояние диалога
 */
export interface DialogState<TData, TResult> {
  type: DialogType;
  data: TData | undefined;
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  result?: TResult;
}

/**
 * Типизированный контекст для диалоговых окон
 */
export interface DialogContextType {
  currentDialog: {
    type: DialogType;
    data: DefaultDialogData;
  } | null;
  openDialog: <TData = DefaultDialogData>(
    type: DialogType,
    data?: TData
  ) => DialogState<TData, DefaultDialogResult>;
  closeDialog: () => void;
  submitDialog: <TData = DefaultDialogData>(
    data: TData
  ) => Promise<DialogResult<DefaultDialogResult>>;
  isDialogOpen: (type: DialogType) => boolean;
}

/**
 * Создание контекста
 */
const DialogContext = createContext<DialogContextType | null>(null)

/**
 * Provider для типизированного контекста
 */
export const TypedDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDialog, setCurrentDialog] = useState<DialogState<DefaultDialogData, DefaultDialogResult> | null>(null)

  const openDialog = useCallback(<TData = DefaultDialogData>(
    type: DialogType,
    data?: TData,
  ): DialogState<TData, DefaultDialogResult> => {
    const newState: DialogState<TData, DefaultDialogResult> = {
      type,
      data,
      isOpen: true,
      isSubmitting: false,
      error: null,
    }
    setCurrentDialog(newState)
    return newState
  }, [])

  const closeDialog = useCallback((): void => {
    setCurrentDialog(null)
  }, [])

  const submitDialog = useCallback(async <TData = DefaultDialogData>(
    data: TData,
  ): Promise<DialogResult<DefaultDialogResult>> => {
    if (!currentDialog) return { success: false, error: 'No dialog open' }

    setCurrentDialog(prev => prev ? ({
      ...prev,
      isSubmitting: true,
      error: null,
    }) : null)

    try {
      logger.info(`Submitting dialog: ${currentDialog.type}`, { data: data as StrictData })
      return { success: true, data: undefined }
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      logger.error('Failed to submit dialog:', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setCurrentDialog(prev => prev ? ({
        ...prev,
        isSubmitting: false,
        error: null,
      }) : null)
    }
  }, [currentDialog])

  const isDialogOpen = useCallback((type: DialogType): boolean => {
    return currentDialog?.type === type
  }, [currentDialog])

  const value: DialogContextType = {
    currentDialog,
    openDialog,
    closeDialog,
    submitDialog,
    isDialogOpen,
  }

  return (
    <DialogContext.Provider value={value}>
      {children}
    </DialogContext.Provider>
  )
}

export const useTypedDialogContext = (): DialogContextType => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('useTypedDialogContext must be used within a TypedDialogProvider')
  }
  return context
}

/**
 * Type-safe dialog opening function
 */
export const openTypedDialog = <TData = DefaultDialogData>(
  context: DialogContextType,
  type: DialogType,
  data?: TData,
): void => {
  context.openDialog(type, data)
}

/**
 * Type-safe dialog closing function
 */
export const closeTypedDialog = (context: DialogContextType): void => {
  context.closeDialog()
}

/**
 * Type-safe dialog submission function
 */
export const submitTypedDialog = async <TData = DefaultDialogData, TResult = DefaultDialogResult>(
  context: DialogContextType,
  data: TData,
): Promise<TResult> => {
  return context.submitDialog(data) as Promise<TResult>
}

/**
 * Dialog component factory
 * @deprecated Используйте TypedDialogService вместо этого
 */
export const createTypedDialog = <TData = DefaultDialogData, TResult = DefaultDialogResult>(
  _dialogType: DialogType,
  title: string,
  Component: React.ComponentType<{ open: boolean; onClose: () => void; onSubmit: () => Promise<DefaultDialogResult> }>,
): React.FC<{ open: (data?: TData) => void; onClose: () => void }> => {
  const DialogWrapper: React.FC<{ open: (data?: TData) => void; onClose: () => void }> = (_props) => {
    const context = useTypedDialogContext()
    const [state, setState] = useState<DialogState<TData, TResult> | null>(null)

    const closeDialog = () => {
      context.closeDialog()
      setState(null)
    }

    const submitDialog = async () => {
      if (!state) return
      setState(prev => prev ? { ...prev, isSubmitting: true, error: null } : null)

      try {
        const result = await context.submitDialog(state.data)
        setState(prev => prev ? { ...prev, isSubmitting: false, result: result as TResult, error: null } : null)
        closeDialog()
        return result
      } catch (err) {
        const errorMessage = getErrorMessage(err)
        setState(prev => prev ? { ...prev, isSubmitting: false, error: errorMessage } : null)
      }
    }

    if (!state) {
      return null
    }

    return React.createElement(Component, {
      open: state.isOpen,
      onClose: closeDialog,
      onSubmit: submitDialog,
    })
  }

  DialogWrapper.displayName = title
  return DialogWrapper
}

/**
 * Хук для использования менеджера диалогов
 * @deprecated Используйте useTypedDialog вместо этого
 */
export const useDialogManager = () => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('useDialogManager must be used within TypedDialogProvider')
  }
  return context
}

/**
 * Компонент-менеджер диалогов для рендеринга
 * @deprecated Legacy компонент, будет удален в будущем
 */
export const DialogManager: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}
