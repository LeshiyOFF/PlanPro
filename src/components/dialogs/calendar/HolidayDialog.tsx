import React from 'react'
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDialogValidation } from '../hooks/useDialogValidation'

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'holiday' | 'nonworking' | 'working';
  recurring: boolean;
  calendarIds: string[];
}

export interface Calendar {
  id: string;
  name: string;
  isBase: boolean;
}

export interface HolidayDialogProps extends Omit<BaseDialogProps, 'children'> {
  calendars?: Calendar[];
  holidays?: Holiday[];
  currentHoliday?: Holiday;
  onSave?: (holiday: Omit<Holiday, 'id'>) => void;
  onUpdate?: (holiday: Holiday) => void;
  onDelete?: (holidayId: string) => void;
  onClose?: () => void;
}

const HOLIDAY_TYPES = [
  { value: 'holiday', label: 'Holiday', description: 'Non-working day with holiday pay' },
  { value: 'nonworking', label: 'Non-working', description: 'Non-working day without holiday pay' },
  { value: 'working', label: 'Working', description: 'Working day (override default schedule)' },
]

const RECURRING_OPTIONS = [
  { value: false, label: 'One-time', description: 'Occurs only on specified date' },
  { value: true, label: 'Recurring', description: 'Occurs every year on same date' },
]

export const HolidayDialog: React.FC<HolidayDialogProps> = ({
  calendars = [],
  holidays = [],
  currentHoliday,
  onSave,
  onUpdate,
  onDelete,
  onClose,
  ...props
}) => {
  type HolidayType = 'holiday' | 'nonworking' | 'working';

  const [holiday, setHoliday] = React.useState<{
    name: string;
    date: string;
    type: HolidayType;
    recurring: boolean;
    calendarIds: string[];
  }>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    type: 'holiday',
    recurring: false,
    calendarIds: calendars.filter(c => c.isBase).map(c => c.id),
  })

  const isEditing = !!currentHoliday?.id

  const { validate, errors, isValid } = useDialogValidation({
    name: {
      required: true,
      minLength: 1,
      maxLength: 255,
      custom: (value) => {
        if (!value || typeof value !== 'string') return 'Holiday name is required'
        return value.trim() ? null : 'Holiday name is required'
      },
    },
    date: {
      required: true,
      custom: (value) => {
        if (!value || typeof value !== 'string') return 'Date is required'
        const date = new Date(value)
        return !isNaN(date.getTime()) ? null : 'Invalid date format'
      },
    },
    calendarIds: {
      required: true,
      custom: (value) => {
        if (!value || !Array.isArray(value)) return 'At least one calendar must be selected'
        return value.length > 0 ? null : 'At least one calendar must be selected'
      },
    },
  })

  React.useEffect(() => {
    if (currentHoliday) {
      setHoliday({
        name: currentHoliday.name,
        date: currentHoliday.date,
        type: currentHoliday.type,
        recurring: currentHoliday.recurring,
        calendarIds: currentHoliday.calendarIds,
      })
    }
  }, [currentHoliday])

  React.useEffect(() => {
    Object.keys(holiday).forEach(key => {
      validate(key, holiday[key as keyof typeof holiday])
    })
  }, [holiday])

  type HolidayField = keyof typeof holiday;
  type HolidayFieldValue = string | boolean | string[];

  const handleFieldChange = (field: HolidayField, value: HolidayFieldValue) => {
    setHoliday(prev => ({ ...prev, [field]: value }))
  }

  const handleCalendarToggle = (calendarId: string) => {
    setHoliday(prev => ({
      ...prev,
      calendarIds: prev.calendarIds.includes(calendarId)
        ? prev.calendarIds.filter(id => id !== calendarId)
        : [...prev.calendarIds, calendarId],
    }))
  }

  const handleSave = () => {
    if (isValid()) {
      const holidayData = {
        name: holiday.name.trim(),
        date: holiday.date,
        type: holiday.type,
        recurring: holiday.recurring,
        calendarIds: holiday.calendarIds,
      }

      if (isEditing) {
        onUpdate?.({ ...currentHoliday, ...holidayData })
      } else {
        onSave?.(holidayData)
      }
      onClose?.()
    }
  }

  const handleDelete = () => {
    if (currentHoliday?.id) {
      onDelete?.(currentHoliday.id)
      onClose?.()
    }
  }

  const canSave = isValid()
  const getTypeDescription = (type: string) => {
    return HOLIDAY_TYPES.find(t => t.value === type)?.description || ''
  }

  const selectedCalendars = calendars.filter(c => holiday.calendarIds.includes(c.id))

  const { open: _open, onOpenChange: _onOpenChange, title: _title, ...dialogProps } = props

  return (
    <BaseDialog
      title={isEditing ? 'Edit Holiday' : 'Add Holiday'}
      size="large"
      open={props.open}
      onOpenChange={props.onOpenChange}
      {...dialogProps}
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <div className="flex space-x-2">
            {isEditing && (
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!canSave}>
              {isEditing ? 'Update' : 'Add'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Holiday Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Holiday Name *</Label>
            <Input
              id="name"
              value={holiday.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <div className="text-sm text-red-500">{errors.name}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={holiday.date}
              onChange={(e) => handleFieldChange('date', e.target.value)}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && (
              <div className="text-sm text-red-500">{errors.date}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Holiday Type</Label>
            <Select
              value={holiday.type}
              onValueChange={(value: string) => handleFieldChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HOLIDAY_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {type.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Recurring</Label>
            <div className="space-y-2">
              {RECURRING_OPTIONS.map(option => (
                <div key={String(option.value)} className="flex items-center space-x-2">
                  <Checkbox
                    id={`recurring-${String(option.value)}`}
                    checked={holiday.recurring === option.value}
                    onCheckedChange={() => handleFieldChange('recurring', option.value)}
                  />
                  <Label htmlFor={`recurring-${String(option.value)}`}>
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Selection */}
        <div className="space-y-3">
          <Label>Apply to Calendars *</Label>
          <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
            {calendars.map(calendar => (
              <div key={calendar.id} className="flex items-center space-x-2 py-1">
                <Checkbox
                  checked={holiday.calendarIds.includes(calendar.id)}
                  onCheckedChange={() => handleCalendarToggle(calendar.id)}
                />
                <div>
                  <div className="font-medium text-sm">{calendar.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {calendar.isBase ? 'Base Calendar' : 'Resource Calendar'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {errors.calendarIds && (
            <div className="text-sm text-red-500">{errors.calendarIds}</div>
          )}
        </div>

        {/* Preview */}
        {holiday.name.trim() && (
          <div className="border rounded-lg p-4 bg-primary/10">
            <Label className="text-sm font-medium mb-2">Holiday Preview</Label>
            <div className="text-sm space-y-1">
              <div>
                <strong>Name:</strong> {holiday.name.trim()}
              </div>
              <div>
                <strong>Date:</strong> {holiday.date}
                {holiday.recurring && ' (Recurring annually)'}
              </div>
              <div>
                <strong>Type:</strong> {holiday.type} - {getTypeDescription(holiday.type)}
              </div>
              <div>
                <strong>Calendars:</strong> {selectedCalendars.map(c => c.name).join(', ')}
              </div>
            </div>
          </div>
        )}

        {/* Existing Holidays Summary */}
        {holidays.length > 0 && !isEditing && (
          <div className="space-y-2">
            <Label>Existing Holidays ({holidays.length})</Label>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Recurring</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays.slice(0, 5).map(holiday => (
                    <TableRow key={holiday.id}>
                      <TableCell className="font-medium">{holiday.name}</TableCell>
                      <TableCell>{holiday.date}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          holiday.type === 'holiday' ? 'bg-red-100 text-red-800' :
                            holiday.type === 'nonworking' ? 'bg-gray-100 text-gray-800' :
                              'bg-green-100 text-green-800'
                        }`}>
                          {holiday.type}
                        </span>
                      </TableCell>
                      <TableCell>{holiday.recurring ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {holidays.length > 5 && (
                <div className="text-sm text-muted-foreground p-2 text-center">
                  ... and {holidays.length - 5} more holidays
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </BaseDialog>
  )
}

