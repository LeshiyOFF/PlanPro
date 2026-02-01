import React, { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  IDialogData,
  IDialogActions,
  IDialogConfig,
  DialogResult,
  DialogStatus,
  ValidationRule,
} from '@/types/dialog/DialogTypes'
import type { DialogDataValue } from '@/types/dialog/LegacyDialogTypes'

export type DialogRenderFunction<T> = (data: T, errors: Record<string, string[]>) => React.ReactNode;

/**
 * Интерфейс для BaseDialog компонента
 */
export interface BaseDialogProps<T extends IDialogData = IDialogData> {
  data: T;
  actions: IDialogActions<T>;
  config?: IDialogConfig;
  validationRules?: ValidationRule[];
  isOpen: boolean;
  onClose: (result: DialogResult<T>) => void;
  className?: string;
  children?: React.ReactNode | DialogRenderFunction<T>;
}

/**
 * Базовый компонент для всех диалоговых окон
 * Реализует SOLID принцип Single Responsibility
 * Следует Clean Architecture с Ports & Adapters
 */
export const BaseDialog = <T extends IDialogData>({
  data,
  actions,
  config = {},
  validationRules = [],
  isOpen,
  onClose,
  className = '',
  children,
}: BaseDialogProps<T>) => {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<DialogStatus>(DialogStatus.INITIAL)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})

  /**
   * Валидация данных диалога
   */
  const validateData = (dialogData: T): boolean => {
    setStatus(DialogStatus.VALIDATING)
    const errors: Record<string, string[]> = {}

    // Валидация по правилам
    for (const rule of validationRules) {
      const rawValue = dialogData[rule.field as keyof T] as DialogDataValue | undefined
      const value = typeof rawValue === 'string' ? rawValue : rawValue != null ? String(rawValue) : ''
      const fieldErrors: string[] = []

      // Обязательное поле
      if (rule.required && (!value || value === '')) {
        fieldErrors.push('Поле является обязательным')
      }

      // Минимальная длина
      if (rule.minLength && value && value.length < rule.minLength) {
        fieldErrors.push(`Минимальная длина: ${rule.minLength}`)
      }

      // Максимальная длина
      if (rule.maxLength && value && value.length > rule.maxLength) {
        fieldErrors.push(`Максимальная длина: ${rule.maxLength}`)
      }

      // Регулярное выражение
      if (rule.pattern && value) {
        const regex = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern)
        if (!regex.test(value)) {
          fieldErrors.push('Неверный формат')
        }
      }

      // Кастомная валидация
      if (rule.custom) {
        const customResult = rule.custom(value)
        if (customResult !== true) {
          fieldErrors.push(typeof customResult === 'string' ? customResult : 'Ошибка валидации')
        }
      }

      if (fieldErrors.length > 0) {
        errors[rule.field] = fieldErrors
      }
    }

    setValidationErrors(errors)
    const isValid = Object.keys(errors).length === 0
    setStatus(isValid ? DialogStatus.READY : DialogStatus.ERROR)
    return isValid
  }

  /**
   * Обработчик кнопки OK
   */
  const handleOk = async () => {
    if (actions.onValidate) {
      const isValid = actions.onValidate(data)
      if (!isValid) {
        setStatus(DialogStatus.ERROR)
        return
      }
    }

    if (!validateData(data)) {
      return
    }

    setStatus(DialogStatus.LOADING)
    try {
      if (actions.onOk) {
        await actions.onOk(data)
      }
      setStatus(DialogStatus.SUCCESS)
      onClose({
        success: true,
        data,
        action: 'ok',
      })
    } catch (error) {
      setStatus(DialogStatus.ERROR)
      console.error('Dialog OK action failed:', error)
    }
  }

  /**
   * Обработчик кнопки Cancel
   */
  const handleCancel = () => {
    setStatus(DialogStatus.INITIAL)
    setValidationErrors({})
    if (actions.onCancel) {
      actions.onCancel()
    }
    onClose({
      success: false,
      action: 'cancel',
    })
  }

  /**
   * Обработчик кнопки Help
   */
  const handleHelp = () => {
    if (actions.onHelp) {
      actions.onHelp()
    }
  }

  /**
   * Обработчик закрытия диалога
   */
  const handleClose = () => {
    handleCancel()
  }

  /**
   * Обработчик клавиатуры
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'Escape':
          if (config.closeOnEscape !== false) {
            handleCancel()
          }
          break
        case 'Enter':
          if (config.closeOnEnter !== false && event.ctrlKey) {
            handleOk()
          }
          break
        case 'F1':
          event.preventDefault()
          handleHelp()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, config])

  /**
   * Фокусировка при открытии
   */
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const firstInput = dialogRef.current.querySelector('input, select, textarea, button')
      if (firstInput instanceof HTMLElement) {
        firstInput.focus()
      }
    }
  }, [isOpen])

  const defaultConfig = {
    width: 500,
    height: 400,
    resizable: false,
    modal: true,
    showHelp: true,
    closeOnEscape: true,
    closeOnEnter: true,
    ...config,
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      modal={defaultConfig.modal}
    >
      <DialogContent
        className={cn(
          'bg-white rounded-[2rem] shadow-2xl border border-[hsl(var(--primary-border)/0.2)] shadow-[hsl(var(--primary-shadow-light)/0.2)] overflow-hidden transition-all duration-300',
          className,
        )}
        aria-describedby={data.description ? undefined : undefined}
        style={{
          width: defaultConfig.width,
          height: defaultConfig.height,
          maxWidth: '90vw',
          maxHeight: '90vh',
        }}
        ref={dialogRef}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{data.title}</span>
            <div className="flex items-center gap-2">
              {status === DialogStatus.LOADING && (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              )}
              {status === DialogStatus.ERROR && (
                <div className="w-4 h-4 rounded-full bg-destructive" />
              )}
              {status === DialogStatus.SUCCESS && (
                <div className="w-4 h-4 rounded-full bg-green-500" />
              )}
            </div>
          </DialogTitle>
          {data.description && typeof data.description === 'string' && (
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              {data.description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="dialog-body flex-1 overflow-y-auto">
          {typeof children === 'function'
            ? (children as (data: T, errors: Record<string, string[]>) => React.ReactNode)(data, validationErrors)
            : children}
        </div>

        <DialogFooter className="dialog-footer">
          <div className="flex justify-between items-center w-full">
            {defaultConfig.showHelp && actions.onHelp && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleHelp}
                disabled={status === DialogStatus.LOADING}
              >
                Справка (F1)
              </Button>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={status === DialogStatus.LOADING}
              >
                Отмена (ESC)
              </Button>

              <Button
                onClick={handleOk}
                disabled={status === DialogStatus.LOADING || status === DialogStatus.VALIDATING}
                className="min-w-20"
              >
                {status === DialogStatus.LOADING ? 'Сохранение...' : 'OK'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default BaseDialog

