import React from 'react';
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDialogValidation } from '../hooks/useDialogValidation';

export interface ProjectOptions {
  general: {
    defaultDuration: number;
    defaultCalendar: string;
    autoSave: boolean;
    autoSaveInterval: number;
    showSummaryTask: boolean;
    criticalSlack: number;
  };
  display: {
    dateFormat: string;
    currency: string;
    decimalPlaces: number;
    timeFormat: '12h' | '24h';
    weekStartDay: number;
    showTips: boolean;
    showGridlines: boolean;
  };
  calculation: {
    type: 'manual' | 'automatic';
    effortDriven: boolean;
    fixedDuration: boolean;
    levelingOrder: string;
    allowOverallocation: boolean;
  };
  collaboration: {
    enableVersioning: boolean;
    maxVersions: number;
    enableComments: boolean;
    enableNotifications: boolean;
    sharedResources: boolean;
  };
}

export interface ProjectOptionsDialogProps extends Omit<BaseDialogProps, 'children'> {
  currentOptions?: ProjectOptions;
  availableCalendars?: string[];
  onSave?: (options: ProjectOptions) => void;
  onReset?: () => void;
}

const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: '01/31/2024' },
  { value: 'DD/MM/YYYY', label: '31/01/2024' },
  { value: 'YYYY-MM-DD', label: '2024-01-31' },
  { value: 'DD.MM.YYYY', label: '31.01.2024' }
];

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'CNY', label: 'CNY (¥)' }
];

const LEVELING_ORDERS = [
  { value: 'priority', label: 'Priority' },
  { value: 'duration', label: 'Duration' },
  { value: 'id', label: 'ID' },
  { value: 'name', label: 'Name' }
];

export const ProjectOptionsDialog: React.FC<ProjectOptionsDialogProps> = ({
  currentOptions,
  availableCalendars = [],
  onSave,
  onReset,
  onClose,
  ...props
}) => {
  const [options, setOptions] = React.useState<ProjectOptions>(
    currentOptions || {
      general: {
        defaultDuration: 1,
        defaultCalendar: 'Standard',
        autoSave: true,
        autoSaveInterval: 10,
        showSummaryTask: false,
        criticalSlack: 0
      },
      display: {
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
        decimalPlaces: 2,
        timeFormat: '12h',
        weekStartDay: 1,
        showTips: true,
        showGridlines: true
      },
      calculation: {
        type: 'automatic',
        effortDriven: false,
        fixedDuration: false,
        levelingOrder: 'priority',
        allowOverallocation: false
      },
      collaboration: {
        enableVersioning: true,
        maxVersions: 10,
        enableComments: true,
        enableNotifications: true,
        sharedResources: false
      }
    }
  );

  const { errors, isValid } = useDialogValidation({
    'general.defaultDuration': {
      required: true,
      min: 0.1,
      max: 1000,
      validate: (value) => (value != null && typeof value === 'number' && value > 0) ? null : 'Duration must be greater than 0'
    },
    'general.autoSaveInterval': {
      required: true,
      min: 1,
      max: 60,
      validate: (value) => (value != null && typeof value === 'number' && value >= 1) ? null : 'Auto-save interval must be at least 1 minute'
    },
    'general.criticalSlack': {
      required: true,
      min: 0,
      max: 100,
      validate: (value) => (value != null && typeof value === 'number' && value >= 0) ? null : 'Critical slack must be non-negative'
    },
    'display.decimalPlaces': {
      required: true,
      min: 0,
      max: 4,
      validate: (value) => (value != null && typeof value === 'number' && value >= 0 && value <= 4) ? null : 'Decimal places must be between 0 and 4'
    },
    'collaboration.maxVersions': {
      required: true,
      min: 1,
      max: 50,
      validate: (value) => (value != null && typeof value === 'number' && value >= 1) ? null : 'Maximum versions must be at least 1'
    }
  });

  React.useEffect(() => {
    if (currentOptions) {
      setOptions(currentOptions);
    }
  }, [currentOptions]);

  const handleOptionChange = (category: keyof ProjectOptions, field: string, value: string | number | boolean) => {
    setOptions(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    if (isValid()) {
      onSave?.(options);
      onClose?.();
    }
  };

  const handleReset = () => {
    onReset?.();
    onClose?.();
  };

  const canSave = isValid();

  const { title: _omitTitle, ...dialogProps } = props;
  return (
    <BaseDialog
      {...dialogProps}
      title="Project Options"
      size="fullscreen"
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <div className="flex space-x-2">
            <Button variant="destructive" onClick={handleReset}>
              Reset to Default
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!canSave}>
              Save Options
            </Button>
          </div>
        </div>
      }
    >
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="calculation">Calculation</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultDuration">Default Task Duration (days)</Label>
                <Input
                  id="defaultDuration"
                  type="number"
                  step="0.1"
                  value={options.general.defaultDuration}
                  onChange={(e) => handleOptionChange('general', 'defaultDuration', parseFloat(e.target.value))}
                  className={errors['general.defaultDuration'] ? 'border-red-500' : ''}
                />
                {errors['general.defaultDuration'] && (
                  <div className="text-sm text-red-500">{errors['general.defaultDuration']}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultCalendar">Default Calendar</Label>
                <Select
                  value={options.general.defaultCalendar}
                  onValueChange={(value) => handleOptionChange('general', 'defaultCalendar', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCalendars.map(calendar => (
                      <SelectItem key={calendar} value={calendar}>
                        {calendar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="criticalSlack">Critical Slack (days)</Label>
                <Input
                  id="criticalSlack"
                  type="number"
                  step="0.1"
                  value={options.general.criticalSlack}
                  onChange={(e) => handleOptionChange('general', 'criticalSlack', parseFloat(e.target.value))}
                  className={errors['general.criticalSlack'] ? 'border-red-500' : ''}
                />
                {errors['general.criticalSlack'] && (
                  <div className="text-sm text-red-500">{errors['general.criticalSlack']}</div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoSave"
                    checked={options.general.autoSave}
                    onCheckedChange={(checked) => handleOptionChange('general', 'autoSave', checked)}
                  />
                  <Label htmlFor="autoSave">Enable Auto-Save</Label>
                </div>
              </div>

              {options.general.autoSave && (
                <div className="space-y-2">
                  <Label htmlFor="autoSaveInterval">Auto-Save Interval (minutes)</Label>
                  <Input
                    id="autoSaveInterval"
                    type="number"
                    min="1"
                    max="60"
                    value={options.general.autoSaveInterval}
                    onChange={(e) => handleOptionChange('general', 'autoSaveInterval', parseInt(e.target.value))}
                    className={errors['general.autoSaveInterval'] ? 'border-red-500' : ''}
                  />
                  {errors['general.autoSaveInterval'] && (
                    <div className="text-sm text-red-500">{errors['general.autoSaveInterval']}</div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showSummaryTask"
                    checked={options.general.showSummaryTask}
                    onCheckedChange={(checked) => handleOptionChange('general', 'showSummaryTask', checked)}
                  />
                  <Label htmlFor="showSummaryTask">Show Summary Task</Label>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Display Tab */}
        <TabsContent value="display" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select
                  value={options.display.dateFormat}
                  onValueChange={(value) => handleOptionChange('display', 'dateFormat', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_FORMATS.map(format => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={options.display.currency}
                  onValueChange={(value) => handleOptionChange('display', 'currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(currency => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="decimalPlaces">Decimal Places</Label>
                <Input
                  id="decimalPlaces"
                  type="number"
                  min="0"
                  max="4"
                  value={options.display.decimalPlaces}
                  onChange={(e) => handleOptionChange('display', 'decimalPlaces', parseInt(e.target.value))}
                  className={errors['display.decimalPlaces'] ? 'border-red-500' : ''}
                />
                {errors['display.decimalPlaces'] && (
                  <div className="text-sm text-red-500">{errors['display.decimalPlaces']}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeFormat">Time Format</Label>
                <Select
                  value={options.display.timeFormat}
                  onValueChange={(value) => handleOptionChange('display', 'timeFormat', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                    <SelectItem value="24h">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weekStartDay">Week Starts On</Label>
                <Select
                  value={options.display.weekStartDay.toString()}
                  onValueChange={(value) => handleOptionChange('display', 'weekStartDay', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Monday</SelectItem>
                    <SelectItem value="2">Tuesday</SelectItem>
                    <SelectItem value="3">Wednesday</SelectItem>
                    <SelectItem value="4">Thursday</SelectItem>
                    <SelectItem value="5">Friday</SelectItem>
                    <SelectItem value="6">Saturday</SelectItem>
                    <SelectItem value="0">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showTips"
                    checked={options.display.showTips}
                    onCheckedChange={(checked) => handleOptionChange('display', 'showTips', checked)}
                  />
                  <Label htmlFor="showTips">Show Tips</Label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showGridlines"
                    checked={options.display.showGridlines}
                    onCheckedChange={(checked) => handleOptionChange('display', 'showGridlines', checked)}
                  />
                  <Label htmlFor="showGridlines">Show Gridlines</Label>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Calculation Tab */}
        <TabsContent value="calculation" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="calculationType">Calculation Type</Label>
                <Select
                  value={options.calculation.type}
                  onValueChange={(value) => handleOptionChange('calculation', 'type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="effortDriven"
                    checked={options.calculation.effortDriven}
                    onCheckedChange={(checked) => handleOptionChange('calculation', 'effortDriven', checked)}
                  />
                  <Label htmlFor="effortDriven">Effort Driven</Label>
                </div>
                <div className="text-sm text-muted-foreground">
                  Changes in duration affect work when resources are assigned
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fixedDuration"
                    checked={options.calculation.fixedDuration}
                    onCheckedChange={(checked) => handleOptionChange('calculation', 'fixedDuration', checked)}
                  />
                  <Label htmlFor="fixedDuration">Fixed Duration</Label>
                </div>
                <div className="text-sm text-muted-foreground">
                  Task duration remains fixed when resources change
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="levelingOrder">Resource Leveling Order</Label>
                <Select
                  value={options.calculation.levelingOrder}
                  onValueChange={(value) => handleOptionChange('calculation', 'levelingOrder', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELING_ORDERS.map(order => (
                      <SelectItem key={order.value} value={order.value}>
                        {order.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowOverallocation"
                    checked={options.calculation.allowOverallocation}
                    onCheckedChange={(checked) => handleOptionChange('calculation', 'allowOverallocation', checked)}
                  />
                  <Label htmlFor="allowOverallocation">Allow Resource Overallocation</Label>
                </div>
                <div className="text-sm text-muted-foreground">
                  Permit resources to be assigned beyond their maximum capacity
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Collaboration Tab */}
        <TabsContent value="collaboration" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableVersioning"
                    checked={options.collaboration.enableVersioning}
                    onCheckedChange={(checked) => handleOptionChange('collaboration', 'enableVersioning', checked)}
                  />
                  <Label htmlFor="enableVersioning">Enable Versioning</Label>
                </div>
                <div className="text-sm text-muted-foreground">
                  Keep track of project changes and maintain version history
                </div>
              </div>

              {options.collaboration.enableVersioning && (
                <div className="space-y-2">
                  <Label htmlFor="maxVersions">Maximum Versions to Keep</Label>
                  <Input
                    id="maxVersions"
                    type="number"
                    min="1"
                    max="50"
                    value={options.collaboration.maxVersions}
                    onChange={(e) => handleOptionChange('collaboration', 'maxVersions', parseInt(e.target.value))}
                    className={errors['collaboration.maxVersions'] ? 'border-red-500' : ''}
                  />
                  {errors['collaboration.maxVersions'] && (
                    <div className="text-sm text-red-500">{errors['collaboration.maxVersions']}</div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableComments"
                    checked={options.collaboration.enableComments}
                    onCheckedChange={(checked) => handleOptionChange('collaboration', 'enableComments', checked)}
                  />
                  <Label htmlFor="enableComments">Enable Comments</Label>
                </div>
                <div className="text-sm text-muted-foreground">
                  Allow team members to comment on tasks and resources
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableNotifications"
                    checked={options.collaboration.enableNotifications}
                    onCheckedChange={(checked) => handleOptionChange('collaboration', 'enableNotifications', checked)}
                  />
                  <Label htmlFor="enableNotifications">Enable Notifications</Label>
                </div>
                <div className="text-sm text-muted-foreground">
                  Send notifications for project changes and updates
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sharedResources"
                    checked={options.collaboration.sharedResources}
                    onCheckedChange={(checked) => handleOptionChange('collaboration', 'sharedResources', checked)}
                  />
                  <Label htmlFor="sharedResources">Share Resources Across Projects</Label>
                </div>
                <div className="text-sm text-muted-foreground">
                  Allow resources to be shared with other projects
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </BaseDialog>
  );
};

