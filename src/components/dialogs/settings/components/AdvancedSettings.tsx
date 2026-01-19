import React from 'react';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface AdvancedSettingsProps {
  settings: any;
  onSettingChange: (path: string, value: any) => void;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ settings, onSettingChange }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="debugMode">Режим отладки</Label>
        </div>
        <Switch 
          id="debugMode"
          checked={settings.advanced?.debugMode || false}
          onCheckedChange={(checked) => onSettingChange('advanced.debugMode', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="experimentalFeatures">Экспериментальные функции</Label>
        </div>
        <Switch 
          id="experimentalFeatures"
          checked={settings.advanced?.experimentalFeatures || false}
          onCheckedChange={(checked) => onSettingChange('advanced.experimentalFeatures', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="hardwareAcceleration">Аппаратное ускорение</Label>
        </div>
        <Switch 
          id="hardwareAcceleration"
          checked={settings.advanced?.hardwareAcceleration !== false}
          onCheckedChange={(checked) => onSettingChange('advanced.hardwareAcceleration', checked)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cacheSize">Размер кэша (МБ)</Label>
        <Input
          id="cacheSize"
          type="number"
          min="10"
          max="1000"
          value={settings.advanced?.cacheSize || 100}
          onChange={(e) => onSettingChange('advanced.cacheSize', parseInt(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxUndoSteps">Максимум шагов отмены</Label>
        <Input
          id="maxUndoSteps"
          type="number"
          min="10"
          max="1000"
          value={settings.advanced?.maxUndoSteps || 50}
          onChange={(e) => onSettingChange('advanced.maxUndoSteps', parseInt(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logLevel">Уровень логирования</Label>
        <Select 
          value={settings.advanced?.logLevel || 'info'} 
          onValueChange={(value) => onSettingChange('advanced.logLevel', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите уровень" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="error">Только ошибки</SelectItem>
            <SelectItem value="warn">Предупреждения</SelectItem>
            <SelectItem value="info">Информация</SelectItem>
            <SelectItem value="debug">Отладка</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="backupPath">Папка резервных копий</Label>
        <Input
          id="backupPath"
          type="text"
          placeholder="/путь/к/резервным/копиям"
          value={settings.advanced?.backupPath || ''}
          onChange={(e) => onSettingChange('advanced.backupPath', e.target.value)}
        />
      </div>
    </div>
  );
};

