import React from 'react'
import { BaseDialog, BaseDialogProps } from '@/components/dialogs/base/SimpleBaseDialog'
import { UserPreferencesContainer } from '@/components/userpreferences/UserPreferencesContainer'

export interface OptionsDialogProps extends Omit<BaseDialogProps, 'children' | 'title'> {
  title?: string;
}

/**
 * Диалог настроек приложения.
 * Интегрирован с профессиональной системой UserPreferences.
 * Использует SimpleBaseDialog для единообразия с другими диалогами настроек.
 */
export const OptionsDialog: React.FC<OptionsDialogProps> = ({
  open,
  onOpenChange,
  title = 'Настройки',
  width = '900px',
  height = '700px',
  ...rest
}) => {
  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      width={width}
      height={height}
      {...rest}
    >
      <UserPreferencesContainer />
    </BaseDialog>
  )
}

