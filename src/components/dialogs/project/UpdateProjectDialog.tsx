import React from 'react'
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useDialogValidation } from '../hooks/useDialogValidation'

export interface ProjectData {
  [key: string]: string | number | boolean | undefined;
  name: string;
  manager: string;
  notes: string;
  startDate: string;
  projectType: number;
  projectStatus: number;
}

export interface UpdateProjectDialogProps extends Omit<BaseDialogProps, 'children'> {
  projectData?: ProjectData;
  onUpdate?: (data: Partial<ProjectData>) => void;
}

const PROJECT_TYPES = [
  { value: 0, label: 'Standard' },
  { value: 1, label: 'Template' },
  { value: 2, label: 'Master' },
]

const PROJECT_STATUS = [
  { value: 0, label: 'Planning' },
  { value: 1, label: 'Active' },
  { value: 2, label: 'On Hold' },
  { value: 3, label: 'Completed' },
  { value: 4, label: 'Archived' },
]

export const UpdateProjectDialog: React.FC<UpdateProjectDialogProps> = ({
  projectData,
  onUpdate,
  onClose,
  ...props
}) => {
  const [formData, setFormData] = React.useState<ProjectData>(
    projectData || {
      name: '',
      manager: '',
      notes: '',
      startDate: new Date().toISOString().split('T')[0],
      projectType: 0,
      projectStatus: 0,
    },
  )

  const { validate, errors, isValid } = useDialogValidation({
    name: {
      required: true,
      minLength: 1,
      maxLength: 255,
    },
    manager: {
      required: true,
      minLength: 1,
      maxLength: 100,
    },
    startDate: {
      required: true,
      custom: (value) => {
        if (!value || typeof value !== 'string') return 'Invalid date format'
        const date = new Date(value)
        return !isNaN(date.getTime()) ? null : 'Invalid date format'
      },
    },
  })

  React.useEffect(() => {
    if (projectData) {
      setFormData(projectData)
    }
  }, [projectData])

  React.useEffect(() => {
    validate(formData)
  }, [formData])

  const handleFieldChange = (field: keyof ProjectData, value: ProjectData[keyof ProjectData]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleUpdate = () => {
    if (isValid()) {
      onUpdate?.(formData)
      onClose?.()
    }
  }

  const canUpdate = isValid()

  const { open: _open, onOpenChange: _onOpenChange, title: _title, ...dialogProps } = props

  return (
    <BaseDialog
      title="Update Project"
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
          <Button onClick={handleUpdate} disabled={!canUpdate}>
            Update
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <div className="text-sm text-red-500">{errors.name}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="manager">Project Manager *</Label>
            <Input
              id="manager"
              value={formData.manager}
              onChange={(e) => handleFieldChange('manager', e.target.value)}
              className={errors.manager ? 'border-red-500' : ''}
            />
            {errors.manager && (
              <div className="text-sm text-red-500">{errors.manager}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleFieldChange('startDate', e.target.value)}
              className={errors.startDate ? 'border-red-500' : ''}
            />
            {errors.startDate && (
              <div className="text-sm text-red-500">{errors.startDate}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectType">Project Type</Label>
            <Select
              value={formData.projectType.toString()}
              onValueChange={(value) => handleFieldChange('projectType', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value.toString()}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="projectStatus">Project Status</Label>
            <Select
              value={formData.projectStatus.toString()}
              onValueChange={(value) => handleFieldChange('projectStatus', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUS.map(status => (
                  <SelectItem key={status.value} value={status.value.toString()}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              rows={4}
              placeholder="Additional project notes..."
            />
          </div>
        </div>
      </div>
    </BaseDialog>
  )
}

