import React, { useState, useEffect } from 'react';
import { BaseDialog } from '@/components/dialogs/base/BaseDialog';
import { UserPreferencesContainer } from '@/components/userpreferences/UserPreferencesContainer';
import { 
  SettingsDialogData 
} from '@/types/dialog/DialogTypes';

/**
 * Диалог настроек приложения
 * Интегрирован с профессиональной системой UserPreferences
 */
export const OptionsDialog: React.FC<SettingsDialogData> = (data) => {
  return (
    <BaseDialog
      data={{
        ...data,
      }}
      config={{
        width: 900,
        height: 700,
        modal: true
      }}
    >
      <UserPreferencesContainer />
    </BaseDialog>
  );
};
