import React from 'react';
import { FormField } from '../components/FormField';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AuditPolicyData {
  enabled: boolean;
  retentionDays: number;
  logLevel: 'error' | 'warning' | 'info' | 'debug';
  alertOnFailedLogin: boolean;
  alertOnPermissionChange: boolean;
}

interface AuditPolicySectionProps {
  data: AuditPolicyData;
  onChange: (field: keyof AuditPolicyData, value: any) => void;
  errors?: Record<string, string>;
}

export const AuditPolicySection: React.FC<AuditPolicySectionProps> = ({
  data,
  onChange,
  errors = {}
}) => {
  const getLogLevelDescription = (level: string) => {
    switch (level) {
      case 'error': return 'Только критические ошибки';
      case 'warning': return 'Ошибки и предупреждения';
      case 'info': return 'Все важные события';
      case 'debug': return 'Все события (рекомендуется для отладки)';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Политика аудита</h3>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="enabled"
            checked={data.enabled}
            onCheckedChange={(checked) => onChange('enabled', checked)}
          />
          <Label htmlFor="enabled" className="text-sm">
            Включить аудит безопасности
          </Label>
        </div>
      </div>

      {data.enabled && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Уровень логирования"
              type="select"
              value={data.logLevel}
              onChange={(value) => onChange('logLevel', value)}
              error={errors.logLevel}
              options={[
                { value: 'error', label: 'Ошибка' },
                { value: 'warning', label: 'Предупреждение' },
                { value: 'info', label: 'Информация' },
                { value: 'debug', label: 'Отладка' }
              ]}
            />

            <FormField
              label="Период хранения логов (дней)"
              type="number"
              value={data.retentionDays}
              onChange={(value) => onChange('retentionDays', value)}
              error={errors.retentionDays}
              min="7"
              max="365"
            />
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-sm text-gray-700">
              {getLogLevelDescription(data.logLevel)}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Уведомления о событиях безопасности</h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="alertOnFailedLogin"
                  checked={data.alertOnFailedLogin}
                  onCheckedChange={(checked) => onChange('alertOnFailedLogin', checked)}
                />
                <Label htmlFor="alertOnFailedLogin" className="text-sm">
                  Уведомлять о неудачных попытках входа
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="alertOnPermissionChange"
                  checked={data.alertOnPermissionChange}
                  onCheckedChange={(checked) => onChange('alertOnPermissionChange', checked)}
                />
                <Label htmlFor="alertOnPermissionChange" className="text-sm">
                  Уведомлять об изменении прав доступа
                </Label>
              </div>
            </div>
          </div>

          {data.retentionDays < 30 && (
            <Alert>
              <AlertDescription>
                ⚠️ Короткий период хранения логов может затруднить расследование инцидентов безопасности.
                Рекомендуемый минимум - 30 дней.
              </AlertDescription>
            </Alert>
          )}

          {data.logLevel === 'debug' && (
            <Alert>
              <AlertDescription>
                📊 Уровень отладки генерирует большой объем логов.
                Убедитесь, что у вас достаточно места для хранения.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
};
