/**
 * Базовый типизированный компонент диалога
 * Используется как основа для всех диалогов
 */

import React, { ReactNode } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DialogType, DialogData, DialogResult } from '@/types/dialog/IDialogRegistry'

/**
 * Пропсы базового диалога
 */
export interface TypedBaseDialogProps<T extends DialogType> {
  readonly type: T;
  readonly isOpen: boolean;
  readonly isSubmitting?: boolean;
  readonly data: DialogData<T>;
  readonly error?: string | null;
  readonly title: string;
  readonly children: ReactNode;
  readonly showFooter?: boolean;
  readonly submitLabel?: string;
  readonly cancelLabel?: string;
  readonly onSubmit: (data: DialogData<T>) => Promise<DialogResult<T>>;
  readonly onCancel: () => void;
  readonly onValidate?: (data: DialogData<T>) => boolean | string;
}

/**
 * Базовый компонент диалога
 */
export const TypedBaseDialog = <T extends DialogType>({
  isOpen,
  isSubmitting = false,
  data,
  error = null,
  title,
  children,
  showFooter = true,
  submitLabel = 'OK',
  cancelLabel = 'Отмена',
  onSubmit,
  onCancel,
  onValidate,
}: TypedBaseDialogProps<T>): React.ReactElement => {
  const handleSubmit = async (): Promise<void> => {
    if (onValidate) {
      const validationResult = onValidate(data)
      if (validationResult !== true) {
        return
      }
    }

    await onSubmit(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border border-slate-700 rounded-3xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-100 tracking-tight">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {children}
        </div>

        {showFooter && (
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-12 px-6 rounded-2xl border-slate-600 hover:bg-slate-700 transition-all duration-200"
            >
              {cancelLabel}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 font-semibold"
            >
              {isSubmitting ? 'Загрузка...' : submitLabel}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
