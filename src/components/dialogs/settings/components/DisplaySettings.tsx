import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface DisplaySettingsProps {
  settings: any;
  onSettingChange: (path: string, value: any) => void;
}

export const DisplaySettings: React.FC<DisplaySettingsProps> = ({ settings, onSettingChange }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="gridLines">Сетка диаграммы Ганта</Label>
        </div>
        <Switch 
          id="gridLines"
          checked={settings.display?.gridLines || true}
          onCheckedChange={(checked) => onSettingChange('display.gridLines', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="criticalPath">Критический путь</Label>
        </div>
        <Switch 
          id="criticalPath"
          checked={settings.display?.criticalPath || false}
          onCheckedChange={(checked) => onSettingChange('display.criticalPath', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="milestones">Показать вехи</Label>
        </div>
        <Switch 
          id="milestones"
          checked={settings.display?.milestones || true}
          onCheckedChange={(checked) => onSettingChange('display.milestones', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="progress">Прогресс задач</Label>
        </div>
        <Switch 
          id="progress"
          checked={settings.display?.progress || true}
          onCheckedChange={(checked) => onSettingChange('display.progress', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="dependencies">Зависимости задач</Label>
        </div>
        <Switch 
          id="dependencies"
          checked={settings.display?.dependencies || true}
          onCheckedChange={(checked) => onSettingChange('display.dependencies', checked)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="zoomLevel">Уровень масштабирования</Label>
        <Select 
          value={settings.display?.zoomLevel || '100'} 
          onValueChange={(value) => onSettingChange('display.zoomLevel', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите масштаб" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="50">50%</SelectItem>
            <SelectItem value="75">75%</SelectItem>
            <SelectItem value="100">100%</SelectItem>
            <SelectItem value="125">125%</SelectItem>
            <SelectItem value="150">150%</SelectItem>
            <SelectItem value="200">200%</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

