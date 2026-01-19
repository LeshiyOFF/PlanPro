import React from 'react';
import { FormField } from '../components/FormField';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface AccessPolicyData {
  twoFactorEnabled: boolean;
  twoFactorMethod: 'email' | 'sms' | 'app';
  ipWhitelist: string[];
  apiAccessEnabled: boolean;
  apiRateLimit: number;
}

interface AccessPolicySectionProps {
  data: AccessPolicyData;
  onChange: (field: keyof AccessPolicyData, value: any) => void;
  errors?: Record<string, string>;
}

export const AccessPolicySection: React.FC<AccessPolicySectionProps> = ({
  data,
  onChange,
  errors = {}
}) => {
  const addIpToWhitelist = () => {
    // TODO: Implement IP add dialog
  };

  const removeIpFromWhitelist = (index: number) => {
    const newWhitelist = data.ipWhitelist.filter((_, i) => i !== index);
    onChange('ipWhitelist', newWhitelist);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Политика доступа</h3>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="twoFactorEnabled"
            checked={data.twoFactorEnabled}
            onCheckedChange={(checked) => onChange('twoFactorEnabled', checked)}
          />
          <Label htmlFor="twoFactorEnabled" className="text-sm">
            Включить двухфакторную аутентификацию
          </Label>
        </div>

        {data.twoFactorEnabled && (
          <FormField
            label="Метод 2FA"
            type="select"
            value={data.twoFactorMethod}
            onChange={(value) => onChange('twoFactorMethod', value)}
            error={errors.twoFactorMethod}
            options={[
              { value: 'email', label: 'Email' },
              { value: 'sms', label: 'SMS' },
              { value: 'app', label: 'Authenticator App' }
            ]}
          />
        )}
      </div>

      <div className="space-y-4">
        <FormField
          label="Белый список IP-адресов"
          type="textarea"
          value={data.ipWhitelist.join('\n')}
          onChange={(value) => onChange('ipWhitelist', value.split('\n').filter(ip => ip.trim()))}
          placeholder="192.168.1.0/24&#10;10.0.0.0/8"
          helper="Один IP или CIDR на строку"
        />

        {data.ipWhitelist.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm">Текущие IP-адреса:</Label>
            <div className="flex flex-wrap gap-2">
              {data.ipWhitelist.map((ip, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {ip}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIpFromWhitelist(index)}
                    className="h-4 w-4 p-0 hover:bg-red-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="apiAccessEnabled"
            checked={data.apiAccessEnabled}
            onCheckedChange={(checked) => onChange('apiAccessEnabled', checked)}
          />
          <Label htmlFor="apiAccessEnabled" className="text-sm">
            Разрешить доступ к API
          </Label>
        </div>

        {data.apiAccessEnabled && (
          <FormField
            label="Лимит запросов API (в минуту)"
            type="number"
            value={data.apiRateLimit}
            onChange={(value) => onChange('apiRateLimit', value)}
            error={errors.apiRateLimit}
            min="1"
            max="10000"
          />
        )}
      </div>

      {data.twoFactorEnabled && data.ipWhitelist.length === 0 && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
          <p className="text-sm text-slate-900">
            💡 Рекомендуется настроить белый список IP-адресов для дополнительной безопасности
          </p>
        </div>
      )}
    </div>
  );
};

