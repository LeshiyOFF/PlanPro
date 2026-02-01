import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export interface SimpleBaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  isValid?: boolean;
  width?: string;
  height?: string;
  maxWidth?: string;
  className?: string;
  footer?: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
}

/**
 * Простой базовый компонент диалога
 * Реализует общую функциональность для всех диалоговых окон
 */
export const SimpleBaseDialog: React.FC<SimpleBaseDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel = 'OK',
  cancelLabel = 'Отмена',
  onConfirm,
  onCancel,
  onClose,
  isValid = true,
  width = '600px',
  height = 'auto',
  maxWidth = '90vw',
  className = '',
  footer,
  size = 'medium',
}) => {
  const getWidth = () => {
    if (size === 'fullscreen') return '95vw'
    if (width !== '600px') return width
    switch (size) {
      case 'small': return '400px'
      case 'large': return '800px'
      default: return '600px'
    }
  }

  const getHeight = () => {
    if (size === 'fullscreen') return '95vh'
    return height
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    if (onClose) {
      onClose()
    }
    onOpenChange(false)
  }

  const handleConfirm = () => {
    if (isValid && onConfirm) {
      onConfirm()
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleCancel()
    } else {
      onOpenChange(newOpen)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={className}
        aria-describedby={description ? undefined : undefined}
        style={{
          width: getWidth(),
          height: getHeight(),
          maxWidth,
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {children}
        </div>

        {footer ? (
          <DialogFooter>
            {footer}
          </DialogFooter>
        ) : (
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              {cancelLabel}
            </Button>
            {onConfirm && (
              <Button
                onClick={handleConfirm}
                disabled={!isValid}
              >
                {confirmLabel}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Алиас для обратной совместимости
export const BaseDialog = SimpleBaseDialog
export type BaseDialogProps = SimpleBaseDialogProps;

