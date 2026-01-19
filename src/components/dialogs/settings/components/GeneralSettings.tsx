import React from 'react';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface GeneralSettingsProps {
  settings: any;
  onSettingChange: (path: string, value: any) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({ settings, onSettingChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="language">Язык интерфейса</Label>
        <Select 
          value={settings.general?.language || 'ru'} 
          onValueChange={(value) => onSettingChange('general.language', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите язык" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ru">Русский</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="de">Deutsch</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="zh">中文</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="theme">Тема оформления</Label>
        <Select 
          value={settings.general?.theme || 'light'} 
          onValueChange={(value) => onSettingChange('general.theme', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите тему" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Светлая</SelectItem>
            <SelectItem value="dark">Темная</SelectItem>
            <SelectItem value="auto">Автоматическая</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateFormat">Формат даты</Label>
        <Select 
          value={settings.general?.dateFormat || 'dd.MM.yyyy'} 
          onValueChange={(value) => onSettingChange('general.dateFormat', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите формат" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dd.MM.yyyy">ДД.ММ.ГГГГ</SelectItem>
            <SelectItem value="MM/dd/yyyy">ММ/ДД/ГГГГ</SelectItem>
            <SelectItem value="yyyy-MM-dd">ГГГГ-ММ-ДД</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="autoSave">Автосохранение</Label>
        </div>
        <Switch 
          id="autoSave"
          checked={settings.general?.autoSave || false}
          onCheckedChange={(checked) => onSettingChange('general.autoSave', checked)}
        />
      </div>

      {settings.general?.autoSave && (
        <div className="space-y-2">
          <Label htmlFor="autoSaveInterval">Интервал автосохранения (мин)</Label>
          <Input
            id="autoSaveInterval"
            type="number"
            min="1"
            max="60"
            value={settings.general?.autoSaveInterval || 5}
            onChange={(e) => onSettingChange('general.autoSaveInterval', parseInt(e.target.value))}
          />
        </div>
      )}
    </div>
  );
};

