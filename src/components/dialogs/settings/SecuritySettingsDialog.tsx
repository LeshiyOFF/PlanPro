import React from 'react'
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useDialogForm, type FormFieldValue } from '../hooks/useDialogForm'
import { PasswordPolicySection } from './PasswordPolicySection'
import { SessionPolicySection } from './SessionPolicySection'
import { AccessPolicySection } from './AccessPolicySection'
import { AuditPolicySection } from './AuditPolicySection'
import type { JsonObject, JsonValue } from '@/types/json-types'

export interface SecurityPolicy {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number;
    historyCount: number;
    lockoutThreshold: number;
    lockoutDuration: number;
  };
  sessionPolicy: {
    timeoutMinutes: number;
    maxConcurrentSessions: number;
    requireReauth: boolean;
    reauthInterval: number;
  };
  accessPolicy: {
    twoFactorEnabled: boolean;
    twoFactorMethod: 'email' | 'sms' | 'app';
    ipWhitelist: string[];
    apiAccessEnabled: boolean;
    apiRateLimit: number;
  };
  auditPolicy: {
    enabled: boolean;
    retentionDays: number;
    logLevel: 'error' | 'warning' | 'info' | 'debug';
    alertOnFailedLogin: boolean;
    alertOnPermissionChange: boolean;
  };
  [key: string]: FormFieldValue;
}

export interface SecuritySettingsDialogProps extends Omit<BaseDialogProps, 'children'> {
  currentSettings?: SecurityPolicy;
  currentUserRole?: 'admin' | 'user' | 'viewer';
  onSave?: (settings: SecurityPolicy) => void;
  onResetPassword?: () => void;
}

const defaultSettings: SecurityPolicy = {
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    maxAge: 90,
    historyCount: 5,
    lockoutThreshold: 5,
    lockoutDuration: 30,
  },
  sessionPolicy: {
    timeoutMinutes: 60,
    maxConcurrentSessions: 3,
    requireReauth: false,
    reauthInterval: 60,
  },
  accessPolicy: {
    twoFactorEnabled: false,
    twoFactorMethod: 'email',
    ipWhitelist: [],
    apiAccessEnabled: true,
    apiRateLimit: 1000,
  },
  auditPolicy: {
    enabled: true,
    retentionDays: 90,
    logLevel: 'warning',
    alertOnFailedLogin: true,
    alertOnPermissionChange: true,
  },
}

export const SecuritySettingsDialog: React.FC<SecuritySettingsDialogProps> = ({
  currentSettings = defaultSettings,
  currentUserRole = 'user',
  onSave,
  onResetPassword,
  open,
  onOpenChange,
  ...props
}) => {
  const {
    dialogData: settings,
    handleFieldChange,
    errors,
    isFormValid,
  } = useDialogForm<SecurityPolicy>({
    initialData: currentSettings,
    validationRules: {
      'passwordPolicy.minLength': {
        required: true,
        min: 6,
        max: 128,
      },
      'passwordPolicy.maxAge': {
        required: true,
        min: 1,
        max: 365,
      },
      'sessionPolicy.timeoutMinutes': {
        required: true,
        min: 5,
        max: 480,
      },
    },
  })

  const handleSave = () => {
    if (isFormValid) {
      onSave?.(settings)
      onOpenChange(false)
    }
  }

  const handleResetPassword = () => {
    onResetPassword?.()
  }

  const handleSectionChange = (section: keyof SecurityPolicy, field: string, value: string | number | boolean) => {
    // Используем type casting к unknown перед приведением к нужному типу для корректной работы с вложенными полями в useDialogForm
    handleFieldChange(`${section}.${field}` as keyof SecurityPolicy, value as SecurityPolicy[keyof SecurityPolicy])
  }

  const canEditSettings = currentUserRole === 'admin'
  const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(currentSettings)

  const { title: _omitTitle, ...dialogProps } = props
  return (
    <BaseDialog
      {...dialogProps}
      title="Настройки безопасности"
      open={open}
      onOpenChange={onOpenChange}
      confirmLabel="Сохранить"
      cancelLabel="Отмена"
      onConfirm={handleSave}
      isValid={isFormValid && hasUnsavedChanges}
      width="800px"
      height="auto"
    >
      <div className="space-y-8">
        {!canEditSettings && (
          <Alert>
            <AlertDescription>
              У вас есть права только на просмотр настроек безопасности.
              Для внесения изменений обратитесь к администратору.
            </AlertDescription>
          </Alert>
        )}

        <PasswordPolicySection
          data={settings.passwordPolicy}
          onChange={(field, value) => handleSectionChange('passwordPolicy', field, value)}
          errors={errors}
        />

        <SessionPolicySection
          data={settings.sessionPolicy}
          onChange={(field, value) => handleSectionChange('sessionPolicy', field, value)}
          errors={errors}
        />

        <AccessPolicySection
          data={settings.accessPolicy}
          onChange={(field, value) => handleSectionChange('accessPolicy', field, value)}
          errors={errors}
        />

        <AuditPolicySection
          data={settings.auditPolicy}
          onChange={(field, value) => handleSectionChange('auditPolicy', field, value)}
          errors={errors}
        />

        {canEditSettings && (
          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleResetPassword}
              className="mr-2"
            >
              Сбросить пароли всех пользователей
            </Button>
          </div>
        )}
      </div>
    </BaseDialog>
  )
}

