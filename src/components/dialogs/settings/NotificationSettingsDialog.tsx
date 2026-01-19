import React from 'react';
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDialogValidation } from '../hooks/useDialogValidation';

export interface NotificationRule {
  id: string;
  name: string;
  enabled: boolean;
  events: string[];
  channels: string[];
  recipients: string[];
  conditions: {
    priority: string[];
    projects: string[];
    resources: string[];
  };
}

export interface NotificationSettings {
  global: {
    enabled: boolean;
    emailEnabled: boolean;
    inAppEnabled: boolean;
    desktopEnabled: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
      timezone: string;
    };
    digestSettings: {
      enabled: boolean;
      frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
      maxItems: number;
    };
  };
  rules: NotificationRule[];
  emailSettings: {
    smtpServer: string;
    smtpPort: number;
    username: string;
    password: string;
    fromAddress: string;
    fromName: string;
    useSSL: boolean;
    useTLS: boolean;
  };
}

export interface NotificationSettingsDialogProps extends Omit<BaseDialogProps, 'children'> {
  currentSettings?: NotificationSettings;
  availableEvents?: string[];
  availableProjects?: string[];
  availableResources?: string[];
  onSave?: (settings: NotificationSettings) => void;
  onTestNotification?: () => void;
}

const NOTIFICATION_EVENTS = [
  { value: 'task_created', label: 'Task Created' },
  { value: 'task_updated', label: 'Task Updated' },
  { value: 'task_completed', label: 'Task Completed' },
  { value: 'task_deleted', label: 'Task Deleted' },
  { value: 'resource_assigned', label: 'Resource Assigned' },
  { value: 'resource_unassigned', label: 'Resource Unassigned' },
  { value: 'deadline_approaching', label: 'Deadline Approaching' },
  { value: 'overdue_task', label: 'Task Overdue' },
  { value: 'project_saved', label: 'Project Saved' },
  { value: 'baseline_created', label: 'Baseline Created' }
];

const NOTIFICATION_CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'inapp', label: 'In-App' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'sms', label: 'SMS' }
];

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' }
];

const DIGEST_FREQUENCIES = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'hourly', label: 'Hourly Digest' },
  { value: 'daily', label: 'Daily Digest' },
  { value: 'weekly', label: 'Weekly Digest' }
];

export const NotificationSettingsDialog: React.FC<NotificationSettingsDialogProps> = ({
  currentSettings,
  availableEvents = NOTIFICATION_EVENTS.map(e => e.value),
  availableProjects = [],
  availableResources = [],
  onSave,
  onTestNotification,
  onClose,
  ...props
}) => {
  const [settings, setSettings] = React.useState<NotificationSettings>(
    currentSettings || {
      global: {
        enabled: true,
        emailEnabled: true,
        inAppEnabled: true,
        desktopEnabled: true,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
          timezone: 'UTC'
        },
        digestSettings: {
          enabled: false,
          frequency: 'daily',
          maxItems: 50
        }
      },
      rules: [],
      emailSettings: {
        smtpServer: '',
        smtpPort: 587,
        username: '',
        password: '',
        fromAddress: '',
        fromName: '',
        useSSL: false,
        useTLS: true
      }
    }
  );

  const [activeTab, setActiveTab] = React.useState<'global' | 'rules' | 'email'>('global');

  const { validate, errors, isValid } = useDialogValidation({
    'emailSettings.smtpPort': {
      required: true,
      min: 1,
      max: 65535,
      validate: (value) => (value > 0 && value <= 65535) ? null : 'Port must be between 1 and 65535'
    },
    'global.digestSettings.maxItems': {
      required: true,
      min: 1,
      max: 1000,
      validate: (value) => (value > 0 && value <= 1000) ? null : 'Max items must be between 1 and 1000'
    }
  });

  React.useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
  }, [currentSettings]);

  React.useEffect(() => {
    validate('emailSettings.smtpPort', settings.emailSettings.smtpPort);
    validate('global.digestSettings.maxItems', settings.global.digestSettings.maxItems);
  }, [settings.emailSettings.smtpPort, settings.global.digestSettings.maxItems]);

  const handleGlobalChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      global: {
        ...prev.global,
        [field]: value
      }
    }));
  };

  const handleEmailChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      emailSettings: {
        ...prev.emailSettings,
        [field]: value
      }
    }));
  };

  const handleQuietHoursChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      global: {
        ...prev.global,
        quietHours: {
          ...prev.global.quietHours,
          [field]: value
        }
      }
    }));
  };

  const handleDigestChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      global: {
        ...prev.global,
        digestSettings: {
          ...prev.global.digestSettings,
          [field]: value
        }
      }
    }));
  };

  const addNotificationRule = () => {
    const newRule: NotificationRule = {
      id: `rule-${Date.now()}`,
      name: `Rule ${settings.rules.length + 1}`,
      enabled: true,
      events: [],
      channels: ['inapp'],
      recipients: [],
      conditions: {
        priority: [],
        projects: [],
        resources: []
      }
    };
    setSettings(prev => ({
      ...prev,
      rules: [...prev.rules, newRule]
    }));
  };

  const updateRule = (ruleId: string, updates: Partial<NotificationRule>) => {
    setSettings(prev => ({
      ...prev,
      rules: prev.rules.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    }));
  };

  const deleteRule = (ruleId: string) => {
    setSettings(prev => ({
      ...prev,
      rules: prev.rules.filter(rule => rule.id !== ruleId)
    }));
  };

  const handleSave = () => {
    if (isValid()) {
      onSave?.(settings);
      onClose?.();
    }
  };

  const canSave = isValid();

  return (
    <BaseDialog
      title="Notification Settings"
      size="fullscreen"
      {...props}
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onTestNotification}>
              Test Notification
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!canSave}>
              Save Settings
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b">
          <Button
            variant={activeTab === 'global' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('global')}
          >
            Global Settings
          </Button>
          <Button
            variant={activeTab === 'rules' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('rules')}
          >
            Notification Rules
          </Button>
          <Button
            variant={activeTab === 'email' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('email')}
          >
            Email Configuration
          </Button>
        </div>

        {/* Global Settings Tab */}
        {activeTab === 'global' && (
          <div className="space-y-6">
            {/* General Settings */}
            <div className="border rounded-lg p-4">
              <Label className="text-lg font-medium mb-4">General Settings</Label>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enabled"
                      checked={settings.global.enabled}
                      onCheckedChange={(checked) => handleGlobalChange('enabled', checked)}
                    />
                    <Label htmlFor="enabled">Enable Notifications</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emailEnabled"
                      checked={settings.global.emailEnabled}
                      onCheckedChange={(checked) => handleGlobalChange('emailEnabled', checked)}
                    />
                    <Label htmlFor="emailEnabled">Email Notifications</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inAppEnabled"
                      checked={settings.global.inAppEnabled}
                      onCheckedChange={(checked) => handleGlobalChange('inAppEnabled', checked)}
                    />
                    <Label htmlFor="inAppEnabled">In-App Notifications</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="desktopEnabled"
                      checked={settings.global.desktopEnabled}
                      onCheckedChange={(checked) => handleGlobalChange('desktopEnabled', checked)}
                    />
                    <Label htmlFor="desktopEnabled">Desktop Notifications</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="border rounded-lg p-4">
              <Label className="text-lg font-medium mb-4">Quiet Hours</Label>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="quietHoursEnabled"
                      checked={settings.global.quietHours.enabled}
                      onCheckedChange={(checked) => handleQuietHoursChange('enabled', checked)}
                    />
                    <Label htmlFor="quietHoursEnabled">Enable Quiet Hours</Label>
                  </div>

                  {settings.global.quietHours.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="quietHoursStart">Start Time</Label>
                        <Input
                          id="quietHoursStart"
                          type="time"
                          value={settings.global.quietHours.start}
                          onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quietHoursEnd">End Time</Label>
                        <Input
                          id="quietHoursEnd"
                          type="time"
                          value={settings.global.quietHours.end}
                          onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select
                          value={settings.global.quietHours.timezone}
                          onValueChange={(value) => handleQuietHoursChange('timezone', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIMEZONES.map(tz => (
                              <SelectItem key={tz.value} value={tz.value}>
                                {tz.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Digest Settings */}
            <div className="border rounded-lg p-4">
              <Label className="text-lg font-medium mb-4">Digest Settings</Label>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="digestEnabled"
                      checked={settings.global.digestSettings.enabled}
                      onCheckedChange={(checked) => handleDigestChange('enabled', checked)}
                    />
                    <Label htmlFor="digestEnabled">Enable Email Digest</Label>
                  </div>

                  {settings.global.digestSettings.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="digestFrequency">Frequency</Label>
                        <Select
                          value={settings.global.digestSettings.frequency}
                          onValueChange={(value) => handleDigestChange('frequency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DIGEST_FREQUENCIES.map(freq => (
                              <SelectItem key={freq.value} value={freq.value}>
                                {freq.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maxItems">Max Items per Digest</Label>
                        <Input
                          id="maxItems"
                          type="number"
                          min="1"
                          max="1000"
                          value={settings.global.digestSettings.maxItems}
                          onChange={(e) => handleDigestChange('maxItems', parseInt(e.target.value))}
                          className={errors['global.digestSettings.maxItems'] ? 'border-red-500' : ''}
                        />
                        {errors['global.digestSettings.maxItems'] && (
                          <div className="text-sm text-red-500">{errors['global.digestSettings.maxItems']}</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Rules Tab */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Label className="text-lg font-medium">Notification Rules</Label>
              <Button onClick={addNotificationRule}>
                Add Rule
              </Button>
            </div>

            {settings.rules.length === 0 ? (
              <div className="text-center py-8 border rounded-lg bg-muted/30">
                <div className="text-lg font-medium text-muted-foreground mb-2">
                  No notification rules
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Create rules to control when and how notifications are sent
                </div>
                <Button onClick={addNotificationRule}>
                  Add First Rule
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {settings.rules.map(rule => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Input
                          value={rule.name}
                          onChange={(e) => updateRule(rule.id, { name: e.target.value })}
                          className="font-medium text-base"
                        />
                        <div className="text-sm text-muted-foreground">
                          {rule.enabled ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={rule.enabled}
                            onCheckedChange={(checked) => updateRule(rule.id, { enabled: checked })}
                          />
                          <Label className="text-sm">Enabled</Label>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteRule(rule.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Events</Label>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {NOTIFICATION_EVENTS.map(event => (
                            <div key={event.value} className="flex items-center space-x-2">
                              <Checkbox
                                checked={rule.events.includes(event.value)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateRule(rule.id, { 
                                      events: [...rule.events, event.value] 
                                    });
                                  } else {
                                    updateRule(rule.id, { 
                                      events: rule.events.filter(e => e !== event.value) 
                                    });
                                  }
                                }}
                              />
                              <Label className="text-sm">{event.label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Channels</Label>
                        <div className="space-y-1">
                          {NOTIFICATION_CHANNELS.map(channel => (
                            <div key={channel.value} className="flex items-center space-x-2">
                              <Checkbox
                                checked={rule.channels.includes(channel.value)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateRule(rule.id, { 
                                      channels: [...rule.channels, channel.value] 
                                    });
                                  } else {
                                    updateRule(rule.id, { 
                                      channels: rule.channels.filter(c => c !== channel.value) 
                                    });
                                  }
                                }}
                              />
                              <Label className="text-sm">{channel.label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Email Configuration Tab */}
        {activeTab === 'email' && (
          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <Label className="text-lg font-medium mb-4">SMTP Configuration</Label>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpServer">SMTP Server</Label>
                    <Input
                      id="smtpServer"
                      value={settings.emailSettings.smtpServer}
                      onChange={(e) => handleEmailChange('smtpServer', e.target.value)}
                      placeholder="smtp.example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">Port</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      min="1"
                      max="65535"
                      value={settings.emailSettings.smtpPort}
                      onChange={(e) => handleEmailChange('smtpPort', parseInt(e.target.value))}
                      className={errors['emailSettings.smtpPort'] ? 'border-red-500' : ''}
                    />
                    {errors['emailSettings.smtpPort'] && (
                      <div className="text-sm text-red-500">{errors['emailSettings.smtpPort']}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={settings.emailSettings.username}
                      onChange={(e) => handleEmailChange('username', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={settings.emailSettings.password}
                      onChange={(e) => handleEmailChange('password', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromAddress">From Address</Label>
                    <Input
                      id="fromAddress"
                      type="email"
                      value={settings.emailSettings.fromAddress}
                      onChange={(e) => handleEmailChange('fromAddress', e.target.value)}
                      placeholder="noreply@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      value={settings.emailSettings.fromName}
                      onChange={(e) => handleEmailChange('fromName', e.target.value)}
                      placeholder="ПланПро Notifications"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="useSSL"
                        checked={settings.emailSettings.useSSL}
                        onCheckedChange={(checked) => handleEmailChange('useSSL', checked)}
                      />
                      <Label htmlFor="useSSL">Use SSL</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="useTLS"
                        checked={settings.emailSettings.useTLS}
                        onCheckedChange={(checked) => handleEmailChange('useTLS', checked)}
                      />
                      <Label htmlFor="useTLS">Use TLS</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseDialog>
  );
};
