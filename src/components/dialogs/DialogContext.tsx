import React, { useState, useCallback, ReactNode, useContext } from 'react'
import type { DialogType } from '@/types/dialog/DialogType'
import {
  DialogState,
  DialogContextType,
  DialogResult,
  type DefaultDialogData,
  type DefaultDialogResult,
} from '@/types/dialog/DialogStateTypes'
import { getErrorMessage } from '@/utils/errorUtils'

/**
 * Типизированный контекст для диалоговых окон.
 * Generic DialogState<TData, TResult>, data?: TData в openDialog.
 */
const TypedDialogContext = React.createContext<DialogContextType | undefined>(undefined)

interface TypedDialogProviderProps {
  children: ReactNode;
}

export const TypedDialogProvider: React.FC<TypedDialogProviderProps> = ({ children }) => {
  const [currentDialog, setCurrentDialog] = useState<DialogState<DefaultDialogData, DefaultDialogResult> | null>(null)

  const openDialog = useCallback(<TData = DefaultDialogData, TResult = DefaultDialogResult>(
    type: DialogType,
    data?: TData,
  ): DialogState<TData, TResult> => {
    const newState: DialogState<TData, TResult> = {
      type,
      isOpen: true,
      isSubmitting: false,
      error: null,
      data: data ?? undefined,
      result: null,
    }
    setCurrentDialog(newState)
    return newState
  }, [])

  const closeDialog = useCallback((): void => {
    setCurrentDialog(null)
  }, [])

  const submitDialog = useCallback(async <TData = DefaultDialogData, TResult = DefaultDialogResult>(
    _data: TData,
  ): Promise<DialogResult<TResult>> => {
    if (!currentDialog) return { success: false, error: 'No dialog open' }

    setCurrentDialog((prev: DialogState<DefaultDialogData, DefaultDialogResult> | null) => {
      if (!prev) return null
      return {
        ...prev,
        isSubmitting: true,
        error: null,
      }
    })

    try {
      // Здесь будет вызвана функция onSubmit из компонента диалога
      // Result будет установлен через setCurrentDialog
      return { success: true, data: undefined as TResult }
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      setCurrentDialog((prev: DialogState<DefaultDialogData, DefaultDialogResult> | null) => {
        if (!prev) return null
        return {
          ...prev,
          isSubmitting: false,
          error: errorMessage,
        }
      })
      return { success: false, error: errorMessage }
    }
  }, [currentDialog])

  const validateDialog = useCallback(<TData = DefaultDialogData>(
    _data: TData,
  ): boolean | string => {
    // Валидация будет реализована в конкретных диалогах
    return true
  }, [])

  const value: DialogContextType = {
    currentDialog,
    openDialog,
    closeDialog,
    submitDialog,
    validateDialog,
    isDialogOpen: (t: DialogType) => currentDialog?.type === t,
  }

  return (
    <TypedDialogContext.Provider value={value}>
      {children}
    </TypedDialogContext.Provider>
  )
}

export const useTypedDialogContext = (): DialogContextType => {
  const context = useContext(TypedDialogContext)
  if (context === undefined) {
    throw new Error('useTypedDialogContext must be used within a TypedDialogProvider')
  }
  return context
}

// Алиасы для обратной совместимости
export const DialogProvider = TypedDialogProvider
export const useDialogContext = useTypedDialogContext
