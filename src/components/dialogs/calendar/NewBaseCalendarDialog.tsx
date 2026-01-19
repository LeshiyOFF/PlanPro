import React from 'react';
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // temporarily removed
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDialogValidation } from '../hooks/useDialogValidation';

export interface Calendar {
  id: string;
  name: string;
  isBase: boolean;
  workingDays: number[];
  workingHours: { start: string; end: string };
}

export interface NewBaseCalendarDialogProps extends Omit<BaseDialogProps, 'children'> {
  existingCalendars?: Calendar[];
  onSave?: (calendar: Partial<Calendar>, copyFrom?: string) => void;
}

export const NewBaseCalendarDialog: React.FC<NewBaseCalendarDialogProps> = ({
  existingCalendars = [],
  onSave,
  onClose,
  ...props
}) => {
  const [mode, setMode] = React.useState<'new' | 'copy'>('new');
  const [calendarName, setCalendarName] = React.useState('');
  const [copyFromId, setCopyFromId] = React.useState('');

  const { validate, errors, isValid } = useDialogValidation({
    calendarName: {
      required: true,
      minLength: 1,
      maxLength: 255,
      validate: (value) => {
        if (!value.trim()) return 'Calendar name is required';
        if (existingCalendars.some(c => c.name === value.trim())) {
          return 'Calendar with this name already exists';
        }
        return null;
      }
    },
    copyFromId: {
      required: mode === 'copy',
      validate: (value) => {
        if (mode === 'copy' && !value) return 'Please select a calendar to copy';
        return null;
      }
    }
  });

  React.useEffect(() => {
    validate('calendarName', calendarName);
  }, [calendarName, existingCalendars]);

  React.useEffect(() => {
    validate('copyFromId', copyFromId);
  }, [copyFromId, mode]);

  const handleCreate = () => {
    if (isValid()) {
      const calendarData: Partial<Calendar> = {
        name: calendarName.trim(),
        isBase: true,
        workingDays: [1, 2, 3, 4, 5], // Monday to Friday
        workingHours: { start: '09:00', end: '17:00' }
      };

      onSave?.(calendarData, mode === 'copy' ? copyFromId : undefined);
      onClose?.();
    }
  };

  const canCreate = isValid();

  const availableCalendarsForCopy = existingCalendars.filter(c => c.isBase);

  return (
    <BaseDialog
      title="New Base Calendar"
      size="medium"
      {...props}
      onClose={onClose}
      footer={
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!canCreate}>
            {mode === 'new' ? 'Create' : 'Copy'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Creation Mode */}
        <div className="space-y-3">
          <Label>Calendar Creation Method</Label>
          <Select value={mode} onValueChange={(value) => setMode(value as 'new' | 'copy')}>
            <SelectTrigger>
              <SelectValue placeholder="Select creation method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Create new base calendar</SelectItem>
              <SelectItem value="copy">Make a copy of existing calendar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Calendar Name */}
        <div className="space-y-2">
          <Label htmlFor="calendarName">Calendar Name *</Label>
          <Input
            id="calendarName"
            value={calendarName}
            onChange={(e) => setCalendarName(e.target.value)}
            placeholder="Enter calendar name..."
            className={errors.calendarName ? 'border-red-500' : ''}
          />
          {errors.calendarName && (
            <div className="text-sm text-red-500">{errors.calendarName}</div>
          )}
        </div>

        {/* Copy From Selection */}
        {mode === 'copy' && (
          <div className="space-y-2">
            <Label htmlFor="copyFrom">Copy From Calendar *</Label>
            <Select
              value={copyFromId}
              onValueChange={setCopyFromId}
            >
              <SelectTrigger className={errors.copyFromId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select calendar to copy..." />
              </SelectTrigger>
              <SelectContent>
                {availableCalendarsForCopy.map(calendar => (
                  <SelectItem key={calendar.id} value={calendar.id}>
                    <div>
                      <div className="font-medium">{calendar.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {calendar.workingDays.length} working days
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.copyFromId && (
              <div className="text-sm text-red-500">{errors.copyFromId}</div>
            )}
          </div>
        )}

        {/* Preview */}
        {(calendarName.trim() || (mode === 'copy' && copyFromId)) && (
          <div className="border rounded-lg p-4 bg-primary/10">
            <Label className="text-sm font-medium mb-2">Calendar Preview</Label>
            <div className="text-sm space-y-1">
              <div>
                <strong>Name:</strong> {calendarName.trim() || 'Not specified'}
              </div>
              <div>
                <strong>Type:</strong> Base Calendar
              </div>
              <div>
                <strong>Mode:</strong> {mode === 'new' ? 'Create New' : 'Copy Existing'}
              </div>
              {mode === 'copy' && copyFromId && (
                <div>
                  <strong>Copy From:</strong> {
                    availableCalendarsForCopy.find(c => c.id === copyFromId)?.name || 'Unknown'
                  }
                </div>
              )}
              <div>
                <strong>Default Working Days:</strong> Monday - Friday
              </div>
              <div>
                <strong>Default Working Hours:</strong> 09:00 - 17:00
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold">{existingCalendars.length}</div>
            <div className="text-sm text-muted-foreground">Total Calendars</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {availableCalendarsForCopy.length}
            </div>
            <div className="text-sm text-muted-foreground">Base Calendars Available for Copy</div>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
};
