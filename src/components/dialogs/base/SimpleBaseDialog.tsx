import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
  isValid?: boolean;
  width?: string;
  height?: string;
  maxWidth?: string;
  className?: string;
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
  isValid = true,
  width = '600px',
  height = 'auto',
  maxWidth = '90vw',
  className = ''
}) => {
  const handleConfirm = () => {
    if (isValid && onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleCancel();
    } else {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className={className}
        aria-describedby={description ? undefined : undefined}
        style={{
          width,
          height,
          maxWidth
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
      </DialogContent>
    </Dialog>
  );
};

// Алиас для обратной совместимости
export const BaseDialog = SimpleBaseDialog;
export type BaseDialogProps = SimpleBaseDialogProps;
