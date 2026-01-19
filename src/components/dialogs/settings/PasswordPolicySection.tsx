import React from 'react';
import { FormField } from '../components/FormField';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface PasswordPolicyData {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number;
  historyCount: number;
  lockoutThreshold: number;
  lockoutDuration: number;
}

interface PasswordPolicySectionProps {
  data: PasswordPolicyData;
  onChange: (field: keyof PasswordPolicyData, value: any) => void;
  errors?: Record<string, string>;
}

export const PasswordPolicySection: React.FC<PasswordPolicySectionProps> = ({
  data,
  onChange,
  errors = {}
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Политика паролей</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Минимальная длина"
          type="number"
          value={data.minLength}
          onChange={(value) => onChange('minLength', value)}
          error={errors.minLength}
          min="6"
          max="128"
        />

        <FormField
          label="Срок действия пароля (дней)"
          type="number"
          value={data.maxAge}
          onChange={(value) => onChange('maxAge', value)}
          error={errors.maxAge}
          min="1"
          max="365"
        />

        <FormField
          label="Количество паролей в истории"
          type="number"
          value={data.historyCount}
          onChange={(value) => onChange('historyCount', value)}
          error={errors.historyCount}
          min="0"
          max="24"
        />

        <FormField
          label="Порог блокировки (попыток)"
          type="number"
          value={data.lockoutThreshold}
          onChange={(value) => onChange('lockoutThreshold', value)}
          error={errors.lockoutThreshold}
          min="3"
          max="10"
        />

        <FormField
          label="Длительность блокировки (минут)"
          type="number"
          value={data.lockoutDuration}
          onChange={(value) => onChange('lockoutDuration', value)}
          error={errors.lockoutDuration}
          min="5"
          max="1440"
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Требования к паролю</h4>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="requireUppercase"
              checked={data.requireUppercase}
              onCheckedChange={(checked) => onChange('requireUppercase', checked)}
            />
            <Label htmlFor="requireUppercase" className="text-sm">
              Требовать заглавные буквы (A-Z)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="requireLowercase"
              checked={data.requireLowercase}
              onCheckedChange={(checked) => onChange('requireLowercase', checked)}
            />
            <Label htmlFor="requireLowercase" className="text-sm">
              Требовать строчные буквы (a-z)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="requireNumbers"
              checked={data.requireNumbers}
              onCheckedChange={(checked) => onChange('requireNumbers', checked)}
            />
            <Label htmlFor="requireNumbers" className="text-sm">
              Требовать цифры (0-9)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="requireSpecialChars"
              checked={data.requireSpecialChars}
              onCheckedChange={(checked) => onChange('requireSpecialChars', checked)}
            />
            <Label htmlFor="requireSpecialChars" className="text-sm">
              Требовать специальные символы (!@#$%^&*)
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
};

