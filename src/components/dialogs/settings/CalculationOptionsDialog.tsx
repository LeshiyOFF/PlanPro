import React from 'react';
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDialogValidation } from '../hooks/useDialogValidation';

export interface CalculationOptions {
  taskMode: 'manual' | 'auto' | 'effort-driven';
  constraintType: 'asap' | 'aslate' | 'mso' | 'mfo' | 'snet' | 'snlt' | 'fnet' | 'fnlt';
  calendarType: 'standard' | '24-hour' | 'night-shift' | 'custom';
  levelingSettings: {
    enabled: boolean;
    priority: 'priority' | 'duration' | 'standard' | 'id';
    lookAhead: number;
    allowOverallocation: boolean;
    levelOnlyWithinSlack: boolean;
    clearLevelingValues: boolean;
  };
  earnedValueSettings: {
    baselineType: 'baseline0' | 'baseline1' | 'baseline2' | 'baseline3';
    method: 'physical' | 'percent-complete' | 'effort-driven';
    statusDate: string;
    updateInterval: 'daily' | 'weekly' | 'monthly';
  };
  advancedSettings: {
    criticalSlack: number;
    multipleCriticalPaths: boolean;
    showCriticalSlack: boolean;
    ignoreLinksToOtherProjects: boolean;
    actualsInSync: boolean;
  };
}

export interface CalculationOptionsDialogProps extends Omit<BaseDialogProps, 'children'> {
  currentOptions?: CalculationOptions;
  availableBaselines?: string[];
  availableCalendars?: string[];
  onSave?: (options: CalculationOptions) => void;
  onReset?: () => void;
}

const TASK_MODES = [
  { value: 'manual', label: 'Manual', description: 'Dates are manually set' },
  { value: 'auto', label: 'Auto Scheduled', description: 'Dates are calculated automatically' },
  { value: 'effort-driven', label: 'Effort Driven', description: 'Duration changes with resource assignments' }
];

const CONSTRAINT_TYPES = [
  { value: 'asap', label: 'ASAP', description: 'As Soon As Possible' },
  { value: 'aslate', label: 'ASLATE', description: 'As Late As Possible' },
  { value: 'mso', label: 'MSO', description: 'Must Start On' },
  { value: 'mfo', label: 'MFO', description: 'Must Finish On' },
  { value: 'snet', label: 'SNET', description: 'Start No Earlier Than' },
  { value: 'snlt', label: 'SNLT', description: 'Start No Later Than' },
  { value: 'fnet', label: 'FNET', description: 'Finish No Earlier Than' },
  { value: 'fnlt', label: 'FNLT', description: 'Finish No Later Than' }
];

const LEVELING_PRIORITIES = [
  { value: 'priority', label: 'Priority' },
  { value: 'duration', label: 'Duration' },
  { value: 'standard', label: 'Standard' },
  { value: 'id', label: 'ID' }
];

const EV_METHODS = [
  { value: 'physical', label: 'Physical % Complete' },
  { value: 'percent-complete', label: 'Percent Complete' },
  { value: 'effort-driven', label: 'Effort Driven' }
];

export const CalculationOptionsDialog: React.FC<CalculationOptionsDialogProps> = ({
  currentOptions,
  availableBaselines = [],
  availableCalendars = [],
  onSave,
  onReset,
  onClose,
  ...props
}) => {
  const [options, setOptions] = React.useState<CalculationOptions>(
    currentOptions || {
      taskMode: 'auto',
      constraintType: 'asap',
      calendarType: 'standard',
      levelingSettings: {
        enabled: false,
        priority: 'priority',
        lookAhead: 1,
        allowOverallocation: false,
        levelOnlyWithinSlack: false,
        clearLevelingValues: true
      },
      earnedValueSettings: {
        baselineType: 'baseline0',
        method: 'physical',
        statusDate: new Date().toISOString().split('T')[0],
        updateInterval: 'weekly'
      },
      advancedSettings: {
        criticalSlack: 0,
        multipleCriticalPaths: false,
        showCriticalSlack: false,
        ignoreLinksToOtherProjects: false,
        actualsInSync: true
      }
    }
  );

  const { validate, errors, isValid } = useDialogValidation({
    'levelingSettings.lookAhead': {
      required: true,
      min: 0,
      max: 30,
      validate: (value) => (value >= 0 && value <= 30) ? null : 'Look ahead must be between 0 and 30 days'
    },
    'advancedSettings.criticalSlack': {
      required: true,
      min: 0,
      max: 100,
      validate: (value) => (value >= 0 && value <= 100) ? null : 'Critical slack must be between 0 and 100 days'
    }
  });

  React.useEffect(() => {
    if (currentOptions) {
      setOptions(currentOptions);
    }
  }, [currentOptions]);

  React.useEffect(() => {
    validate('levelingSettings.lookAhead', options.levelingSettings.lookAhead);
    validate('advancedSettings.criticalSlack', options.advancedSettings.criticalSlack);
  }, [options.levelingSettings.lookAhead, options.advancedSettings.criticalSlack]);

  const handleOptionChange = (category: string, field: string, value: any) => {
    setOptions(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof CalculationOptions],
        [field]: value
      }
    }));
  };

  const handleAdvancedChange = (field: string, value: any) => {
    setOptions(prev => ({
      ...prev,
      advancedSettings: {
        ...prev.advancedSettings,
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

  return (
    <BaseDialog
      title="Calculation Options"
      size="fullscreen"
      {...props}
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <Button variant="destructive" onClick={handleReset}>
            Reset to Default
          </Button>
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
      <div className="space-y-6">
        {/* Task Calculation Mode */}
        <div className="border rounded-lg p-4">
          <Label className="text-lg font-medium mb-4">Task Calculation Mode</Label>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taskMode">Task Mode</Label>
              <Select
                value={options.taskMode}
                onValueChange={(value) => handleOptionChange('', 'taskMode', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_MODES.map(mode => (
                    <SelectItem key={mode.value} value={mode.value}>
                      <div>
                        <div className="font-medium">{mode.label}</div>
                        <div className="text-sm text-muted-foreground">{mode.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="constraintType">Default Constraint Type</Label>
              <Select
                value={options.constraintType}
                onValueChange={(value) => handleOptionChange('', 'constraintType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONSTRAINT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calendarType">Default Calendar Type</Label>
              <Select
                value={options.calendarType}
                onValueChange={(value) => handleOptionChange('', 'calendarType', value)}
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
          </div>
        </div>

        {/* Resource Leveling */}
        <div className="border rounded-lg p-4">
          <Label className="text-lg font-medium mb-4">Resource Leveling</Label>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="levelingEnabled"
                  checked={options.levelingSettings.enabled}
                  onCheckedChange={(checked) => handleOptionChange('levelingSettings', 'enabled', checked)}
                />
                <Label htmlFor="levelingEnabled">Enable Resource Leveling</Label>
              </div>

              {options.levelingSettings.enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="levelingPriority">Leveling Priority</Label>
                    <Select
                      value={options.levelingSettings.priority}
                      onValueChange={(value) => handleOptionChange('levelingSettings', 'priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEVELING_PRIORITIES.map(priority => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lookAhead">Look Ahead (days)</Label>
                    <Input
                      id="lookAhead"
                      type="number"
                      min="0"
                      max="30"
                      value={options.levelingSettings.lookAhead}
                      onChange={(e) => handleOptionChange('levelingSettings', 'lookAhead', parseInt(e.target.value))}
                      className={errors['levelingSettings.lookAhead'] ? 'border-red-500' : ''}
                    />
                    {errors['levelingSettings.lookAhead'] && (
                      <div className="text-sm text-red-500">{errors['levelingSettings.lookAhead']}</div>
                    )}
                  </div>
                </>
              )}
            </div>

            {options.levelingSettings.enabled && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowOverallocation"
                    checked={options.levelingSettings.allowOverallocation}
                    onCheckedChange={(checked) => handleOptionChange('levelingSettings', 'allowOverallocation', checked)}
                  />
                  <Label htmlFor="allowOverallocation">Allow Overallocation</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="levelOnlyWithinSlack"
                    checked={options.levelingSettings.levelOnlyWithinSlack}
                    onCheckedChange={(checked) => handleOptionChange('levelingSettings', 'levelOnlyWithinSlack', checked)}
                  />
                  <Label htmlFor="levelOnlyWithinSlack">Level Only Within Slack</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="clearLevelingValues"
                    checked={options.levelingSettings.clearLevelingValues}
                    onCheckedChange={(checked) => handleOptionChange('levelingSettings', 'clearLevelingValues', checked)}
                  />
                  <Label htmlFor="clearLevelingValues">Clear Leveling Values Before</Label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Earned Value Calculation */}
        <div className="border rounded-lg p-4">
          <Label className="text-lg font-medium mb-4">Earned Value Calculation</Label>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="baselineType">Baseline for EV Calculation</Label>
                <Select
                  value={options.earnedValueSettings.baselineType}
                  onValueChange={(value) => handleOptionChange('earnedValueSettings', 'baselineType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBaselines.map(baseline => (
                      <SelectItem key={baseline} value={baseline}>
                        {baseline}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="evMethod">EV Calculation Method</Label>
                <Select
                  value={options.earnedValueSettings.method}
                  onValueChange={(value) => handleOptionChange('earnedValueSettings', 'method', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EV_METHODS.map(method => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="updateInterval">Update Interval</Label>
                <Select
                  value={options.earnedValueSettings.updateInterval}
                  onValueChange={(value) => handleOptionChange('earnedValueSettings', 'updateInterval', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="statusDate">Status Date</Label>
                <Input
                  id="statusDate"
                  type="date"
                  value={options.earnedValueSettings.statusDate}
                  onChange={(e) => handleOptionChange('earnedValueSettings', 'statusDate', e.target.value)}
                />
              </div>

              <div className="text-sm text-muted-foreground">
                The status date determines the point in time when earned value calculations are based on. 
                This affects progress reporting and performance metrics.
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="border rounded-lg p-4">
          <Label className="text-lg font-medium mb-4">Advanced Settings</Label>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="criticalSlack">Critical Slack (days)</Label>
                <Input
                  id="criticalSlack"
                  type="number"
                  min="0"
                  max="100"
                  value={options.advancedSettings.criticalSlack}
                  onChange={(e) => handleAdvancedChange('criticalSlack', parseFloat(e.target.value))}
                  className={errors['advancedSettings.criticalSlack'] ? 'border-red-500' : ''}
                />
                {errors['advancedSettings.criticalSlack'] && (
                  <div className="text-sm text-red-500">{errors['advancedSettings.criticalSlack']}</div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="multipleCriticalPaths"
                  checked={options.advancedSettings.multipleCriticalPaths}
                  onCheckedChange={(checked) => handleAdvancedChange('multipleCriticalPaths', checked)}
                />
                <Label htmlFor="multipleCriticalPaths">Multiple Critical Paths</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showCriticalSlack"
                  checked={options.advancedSettings.showCriticalSlack}
                  onCheckedChange={(checked) => handleAdvancedChange('showCriticalSlack', checked)}
                />
                <Label htmlFor="showCriticalSlack">Show Critical Slack</Label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ignoreLinksToOtherProjects"
                  checked={options.advancedSettings.ignoreLinksToOtherProjects}
                  onCheckedChange={(checked) => handleAdvancedChange('ignoreLinksToOtherProjects', checked)}
                />
                <Label htmlFor="ignoreLinksToOtherProjects">Ignore Links to Other Projects</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="actualsInSync"
                  checked={options.advancedSettings.actualsInSync}
                  onCheckedChange={(checked) => handleAdvancedChange('actualsInSync', checked)}
                />
                <Label htmlFor="actualsInSync">Actuals in Sync</Label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
};

