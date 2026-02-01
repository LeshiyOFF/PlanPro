import React from 'react'
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useDialogValidation } from '../hooks/useDialogValidation'

export interface TaskData {
  id: string;
  name: string;
  duration: number;
  startDate: string;
  finishDate: string;
  priority: 'low' | 'normal' | 'high';
  complete: number;
  resources: string[];
}

export interface UpdateTaskDialogProps extends Omit<BaseDialogProps, 'children'> {
  tasks?: TaskData[];
  selectedTaskIds?: string[];
  onUpdate?: (taskIds: string[], updates: Partial<TaskData>) => void;
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
]

export const UpdateTaskDialog: React.FC<UpdateTaskDialogProps> = ({
  tasks = [],
  selectedTaskIds = [],
  onUpdate,
  onClose,
  ...props
}) => {
  const [selectedTasks, setSelectedTasks] = React.useState<string[]>(selectedTaskIds)
  const [updates, setUpdates] = React.useState<Partial<TaskData>>({
    priority: 'normal',
    complete: 0,
    duration: 1,
  })

  const { validate, errors, isValid } = useDialogValidation({
    duration: {
      required: true,
      min: 0.1,
      validate: (value) => (value != null && typeof value === 'number' && value > 0) ? null : 'Duration must be greater than 0',
    },
    complete: {
      required: true,
      min: 0,
      max: 100,
      validate: (value) => (value != null && typeof value === 'number' && value >= 0 && value <= 100) ? null : 'Complete must be between 0 and 100',
    },
  })

  React.useEffect(() => {
    setSelectedTasks(selectedTaskIds)
  }, [selectedTaskIds])

  React.useEffect(() => {
    Object.keys(updates).forEach(key => {
      if (updates[key as keyof TaskData] !== undefined) {
        validate(key, updates[key as keyof TaskData])
      }
    })
  }, [updates])

  const handleTaskToggle = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId],
    )
  }

  const handleUpdateChange = (field: keyof TaskData, value: TaskData[keyof TaskData]) => {
    setUpdates(prev => ({ ...prev, [field]: value }))
  }

  const handleUpdate = () => {
    if (isValid() && selectedTasks.length > 0) {
      onUpdate?.(selectedTasks, updates)
      onClose?.()
    }
  }

  const canUpdate = isValid() && selectedTasks.length > 0
  const selectedTasksData = tasks.filter(task => selectedTasks.includes(task.id))

  const { title: _omitTitle, ...dialogProps } = props
  return (
    <BaseDialog
      {...dialogProps}
      title="Update Tasks"
      size="large"
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedTasks.length} task(s) selected
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={!canUpdate}>
              Update
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Task Selection */}
        <div className="space-y-3">
          <Label>Select Tasks to Update</Label>
          <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center space-x-2 py-1">
                <Checkbox
                  checked={selectedTasks.includes(task.id)}
                  onCheckedChange={() => handleTaskToggle(task.id)}
                />
                <span className="text-sm">{task.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Update Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={updates.priority}
              onValueChange={(value) => handleUpdateChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map(priority => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (days)</Label>
            <Input
              id="duration"
              type="number"
              step="0.1"
              value={updates.duration || ''}
              onChange={(e) => handleUpdateChange('duration', parseFloat(e.target.value))}
              className={errors.duration ? 'border-red-500' : ''}
            />
            {errors.duration && (
              <div className="text-sm text-red-500">{errors.duration}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="complete">Complete (%)</Label>
            <Input
              id="complete"
              type="number"
              min="0"
              max="100"
              value={updates.complete || ''}
              onChange={(e) => handleUpdateChange('complete', parseInt(e.target.value))}
              className={errors.complete ? 'border-red-500' : ''}
            />
            {errors.complete && (
              <div className="text-sm text-red-500">{errors.complete}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={updates.startDate || ''}
              onChange={(e) => handleUpdateChange('startDate', e.target.value)}
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="finishDate">Finish Date</Label>
            <Input
              id="finishDate"
              type="date"
              value={updates.finishDate || ''}
              onChange={(e) => handleUpdateChange('finishDate', e.target.value)}
            />
          </div>
        </div>

        {/* Preview */}
        {selectedTasksData.length > 0 && (
          <div className="border rounded-lg p-3 bg-muted/30">
            <Label className="text-sm font-medium mb-2">Preview Changes</Label>
            <div className="text-sm space-y-1">
              {selectedTasksData.map(task => (
                <div key={task.id} className="text-muted-foreground">
                  {task.name} →
                  {updates.priority && ` Priority: ${updates.priority}`}
                  {updates.duration && ` Duration: ${updates.duration}d`}
                  {updates.complete !== undefined && ` Complete: ${updates.complete}%`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseDialog>
  )
}

