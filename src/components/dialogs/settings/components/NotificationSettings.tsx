import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface NotificationSettingsProps {
  settings: any;
  onSettingChange: (path: string, value: any) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ settings, onSettingChange }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="emailNotifications">Email уведомления</Label>
        </div>
        <Switch 
          id="emailNotifications"
          checked={settings.notifications?.emailNotifications || true}
          onCheckedChange={(checked) => onSettingChange('notifications.emailNotifications', checked)}
        />
      </div>

      {settings.notifications?.emailNotifications && (
        <div className="space-y-2 ml-4">
          <Label htmlFor="emailAddress">Email адрес</Label>
          <Input
            id="emailAddress"
            type="email"
            placeholder="user@example.com"
            value={settings.notifications?.emailAddress || ''}
            onChange={(e) => onSettingChange('notifications.emailAddress', e.target.value)}
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="taskReminders">Напоминания о задачах</Label>
        </div>
        <Switch 
          id="taskReminders"
          checked={settings.notifications?.taskReminders || true}
          onCheckedChange={(checked) => onSettingChange('notifications.taskReminders', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="deadlineAlerts">Оповещения о дедлайнах</Label>
        </div>
        <Switch 
          id="deadlineAlerts"
          checked={settings.notifications?.deadlineAlerts || true}
          onCheckedChange={(checked) => onSettingChange('notifications.deadlineAlerts', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="projectUpdates">Обновления проекта</Label>
        </div>
        <Switch 
          id="projectUpdates"
          checked={settings.notifications?.projectUpdates || false}
          onCheckedChange={(checked) => onSettingChange('notifications.projectUpdates', checked)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reminderTime">Время напоминания (до дедлайна)</Label>
        <Select 
          value={settings.notifications?.reminderTime || '1day'} 
          onValueChange={(value) => onSettingChange('notifications.reminderTime', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите время" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1hour">За 1 час</SelectItem>
            <SelectItem value="4hours">За 4 часа</SelectItem>
            <SelectItem value="1day">За 1 день</SelectItem>
            <SelectItem value="3days">За 3 дня</SelectItem>
            <SelectItem value="1week">За 1 неделю</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
