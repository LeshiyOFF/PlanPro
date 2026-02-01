import React from 'react'
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useDialogValidation } from '../hooks/useDialogValidation'

export interface ResourceData {
  [key: string]: string | number | boolean | undefined;
  name: string;
  type: 'work' | 'material' | 'cost';
  initials: string;
  group: string;
  code: string;
  email: string;
  maxUnits: number;
  standardRate: number;
  overtimeRate: number;
  costPerUse: number;
  accrueAt: 'start' | 'end' | 'prorated';
  calendar: string;
  notes: string;
  generic: boolean;
}

export interface ResourceAdditionDialogProps extends Omit<BaseDialogProps, 'children'> {
  calendars?: string[];
  groups?: string[];
  onSave?: (resource: ResourceData) => void;
}

const RESOURCE_TYPES = [
  { value: 'work', label: 'Work Resource', description: 'Human resources with time-based capacity' },
  { value: 'material', label: 'Material Resource', description: 'Consumable materials' },
  { value: 'cost', label: 'Cost Resource', description: 'Fixed costs or budget items' },
]

const ACCRUAL_OPTIONS = [
  { value: 'start', label: 'At Start' },
  { value: 'end', label: 'At End' },
  { value: 'prorated', label: 'Prorated' },
]

export const ResourceAdditionDialog: React.FC<ResourceAdditionDialogProps> = ({
  calendars = [],
  groups = [],
  onSave,
  onClose,
  ...props
}) => {
  const [resourceData, setResourceData] = React.useState<ResourceData>({
    name: '',
    type: 'work',
    initials: '',
    group: '',
    code: '',
    email: '',
    maxUnits: 100,
    standardRate: 0,
    overtimeRate: 0,
    costPerUse: 0,
    accrueAt: 'start',
    calendar: '',
    notes: '',
    generic: false,
  })

  const { validate, errors, isValid } = useDialogValidation({
    name: {
      required: true,
      minLength: 1,
      maxLength: 255,
      custom: (value) => {
        if (!value || typeof value !== 'string') return 'Resource name is required'
        return value.trim() ? null : 'Resource name is required'
      },
    },
    initials: {
      required: true,
      minLength: 1,
      maxLength: 10,
      custom: (value) => {
        if (!value || typeof value !== 'string') return 'Initials are required'
        return value.trim() ? null : 'Initials are required'
      },
    },
    maxUnits: {
      required: true,
      custom: (value) => {
        const numValue = Number(value)
        return (numValue > 0 && numValue <= 1000) ? null : 'Max units must be between 0.1 and 1000'
      },
    },
    standardRate: {
      required: true,
      custom: (value) => {
        const numValue = Number(value)
        return numValue >= 0 ? null : 'Standard rate must be non-negative'
      },
    },
  })

  React.useEffect(() => {
    validate(resourceData)
  }, [resourceData])

  const handleFieldChange = (field: keyof ResourceData, value: ResourceData[keyof ResourceData]) => {
    setResourceData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (isValid()) {
      onSave?.(resourceData)
      onClose?.()
    }
  }

  const canSave = isValid()

  const getTypeDescription = (type: string) => {
    return RESOURCE_TYPES.find(t => t.value === type)?.description || ''
  }

  const { open: _open, onOpenChange: _onOpenChange, title: _title, ...dialogProps } = props

  return (
    <BaseDialog
      title="Add New Resource"
      size="large"
      open={props.open}
      onOpenChange={props.onOpenChange}
      {...dialogProps}
      onClose={onClose}
      footer={
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            Add Resource
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Resource Type Selection */}
        <div className="space-y-3">
          <Label>Resource Type</Label>
          <div className="grid grid-cols-3 gap-4">
            {RESOURCE_TYPES.map(type => (
              <div
                key={type.value}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  resourceData.type === type.value
                    ? 'border-blue-500 bg-primary/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleFieldChange('type', type.value)}
              >
                <div className="font-medium">{type.label}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {type.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Resource Name *</Label>
            <Input
              id="name"
              value={resourceData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <div className="text-sm text-red-500">{errors.name}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="initials">Initials *</Label>
            <Input
              id="initials"
              value={resourceData.initials}
              onChange={(e) => handleFieldChange('initials', e.target.value)}
              className={errors.initials ? 'border-red-500' : ''}
            />
            {errors.initials && (
              <div className="text-sm text-red-500">{errors.initials}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="group">Group</Label>
            <Select
              value={resourceData.group}
              onValueChange={(value) => handleFieldChange('group', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select group..." />
              </SelectTrigger>
              <SelectContent>
                {groups.map(group => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Resource Code</Label>
            <Input
              id="code"
              value={resourceData.code}
              onChange={(e) => handleFieldChange('code', e.target.value)}
              placeholder="Optional resource code"
            />
          </div>

          {resourceData.type === 'work' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={resourceData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  placeholder="resource@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="calendar">Base Calendar</Label>
                <Select
                  value={resourceData.calendar}
                  onValueChange={(value) => handleFieldChange('calendar', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Default Calendar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Default Calendar</SelectItem>
                    {calendars.map(calendar => (
                      <SelectItem key={calendar} value={calendar}>
                        {calendar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2 col-span-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="generic"
                checked={resourceData.generic}
                onCheckedChange={(checked) => handleFieldChange('generic', checked as boolean)}
              />
              <Label htmlFor="generic">Generic Resource (can be assigned to multiple tasks)</Label>
            </div>
          </div>
        </div>

        {/* Capacity and Rates */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxUnits">Max Units (%) *</Label>
            <Input
              id="maxUnits"
              type="number"
              min="0.1"
              max="1000"
              step="0.1"
              value={resourceData.maxUnits}
              onChange={(e) => handleFieldChange('maxUnits', parseFloat(e.target.value) || 0)}
              className={errors.maxUnits ? 'border-red-500' : ''}
            />
            {errors.maxUnits && (
              <div className="text-sm text-red-500">{errors.maxUnits}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="standardRate">Standard Rate ($) *</Label>
            <Input
              id="standardRate"
              type="number"
              min="0"
              step="0.01"
              value={resourceData.standardRate}
              onChange={(e) => handleFieldChange('standardRate', parseFloat(e.target.value) || 0)}
              className={errors.standardRate ? 'border-red-500' : ''}
            />
            {errors.standardRate && (
              <div className="text-sm text-red-500">{errors.standardRate}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="overtimeRate">Overtime Rate ($)</Label>
            <Input
              id="overtimeRate"
              type="number"
              min="0"
              step="0.01"
              value={resourceData.overtimeRate}
              onChange={(e) => handleFieldChange('overtimeRate', parseFloat(e.target.value) || 0)}
            />
          </div>

          {resourceData.type === 'cost' && (
            <div className="space-y-2 col-span-3">
              <Label htmlFor="costPerUse">Cost Per Use ($)</Label>
              <Input
                id="costPerUse"
                type="number"
                min="0"
                step="0.01"
                value={resourceData.costPerUse}
                onChange={(e) => handleFieldChange('costPerUse', parseFloat(e.target.value) || 0)}
              />
            </div>
          )}

          {resourceData.type === 'cost' && (
            <div className="space-y-2 col-span-3">
              <Label htmlFor="accrueAt">Accrue At</Label>
              <Select
                value={resourceData.accrueAt}
                onValueChange={(value) => handleFieldChange('accrueAt', value as ResourceData['accrueAt'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCRUAL_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2 col-span-3">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={resourceData.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              rows={4}
              placeholder="Additional resource information..."
            />
          </div>
        </div>

        {/* Preview */}
        <div className="border rounded-lg p-4 bg-primary/10">
          <Label className="text-sm font-medium mb-2">Resource Preview</Label>
          <div className="text-sm space-y-1">
            <div>
              <strong>Name:</strong> {resourceData.name || 'Not specified'}
            </div>
            <div>
              <strong>Type:</strong> {resourceData.type} - {getTypeDescription(resourceData.type)}
            </div>
            <div>
              <strong>Capacity:</strong> {resourceData.maxUnits}% max
            </div>
            {resourceData.type === 'work' && (
              <div>
                <strong>Rate:</strong> ${resourceData.standardRate}/hour
                {resourceData.overtimeRate > 0 && ` (OT: $${resourceData.overtimeRate}/hour)`}
              </div>
            )}
            {resourceData.type === 'cost' && (
              <div>
                <strong>Cost:</strong> ${resourceData.costPerUse} per use
                <span className="ml-2">
                  (Accrue: {resourceData.accrueAt})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseDialog>
  )
}

