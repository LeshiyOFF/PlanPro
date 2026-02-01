import React from 'react'
import { FormField } from '../components/FormField'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface SessionPolicyData {
  timeoutMinutes: number;
  maxConcurrentSessions: number;
  requireReauth: boolean;
  reauthInterval: number;
}

type SessionPolicyValue = boolean | number;

interface SessionPolicySectionProps {
  data: SessionPolicyData;
  onChange: (field: keyof SessionPolicyData, value: SessionPolicyValue) => void;
  errors?: Record<string, string | null>;
}

export const SessionPolicySection: React.FC<SessionPolicySectionProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Политика сессий</h3>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Таймаут неактивности (минут)"
          type="number"
          value={data.timeoutMinutes}
          onChange={(value) => onChange('timeoutMinutes', value as number)}
          error={errors.timeoutMinutes}
          min="5"
          max="480"
        />

        <FormField
          label="Макс. одновременных сессий"
          type="number"
          value={data.maxConcurrentSessions}
          onChange={(value) => {
            const num = typeof value === 'number' && !isNaN(value) ? value : data.maxConcurrentSessions
            onChange('maxConcurrentSessions', num)
          }}
          error={errors.maxConcurrentSessions}
          min="1"
          max="10"
        />

        {data.requireReauth && (
          <FormField
            label="Интервал повторной аутентификации (минут)"
            type="number"
            value={data.reauthInterval}
            onChange={(value) => onChange('reauthInterval', value as number)}
            error={errors.reauthInterval}
            min="15"
            max="240"
          />
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="requireReauth"
            checked={data.requireReauth}
            onCheckedChange={(checked) => onChange('requireReauth', checked === true)}
          />
          <Label htmlFor="requireReauth" className="text-sm">
            Требовать повторную аутентификацию для чувствительных операций
          </Label>
        </div>
      </div>

      {data.timeoutMinutes < 15 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            ⚠️ Короткий таймаут может негативно повлиять на пользовательский опыт
          </p>
        </div>
      )}
    </div>
  )
}

