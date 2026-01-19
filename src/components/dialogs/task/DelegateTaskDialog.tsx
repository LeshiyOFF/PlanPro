import React from 'react';
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDialogValidation } from '../hooks/useDialogValidation';

export interface Resource {
  id: string;
  name: string;
  email: string;
  department: string;
  available: boolean;
}

export interface TaskData {
  id: string;
  name: string;
  currentAssignee?: string;
  description?: string;
}

export interface DelegateTaskDialogProps extends Omit<BaseDialogProps, 'children'> {
  tasks?: TaskData[];
  resources?: Resource[];
  selectedTaskIds?: string[];
  onDelegate?: (taskIds: string[], assigneeId: string, note?: string) => void;
}

export const DelegateTaskDialog: React.FC<DelegateTaskDialogProps> = ({
  tasks = [],
  resources = [],
  selectedTaskIds = [],
  onDelegate,
  onClose,
  ...props
}) => {
  const [selectedTasks, setSelectedTasks] = React.useState<string[]>(selectedTaskIds);
  const [assigneeId, setAssigneeId] = React.useState('');
  const [note, setNote] = React.useState('');

  const { validate, errors, isValid } = useDialogValidation({
    assigneeId: {
      required: true,
      validate: (value) => value ? null : 'Please select an assignee'
    }
  });

  React.useEffect(() => {
    setSelectedTasks(selectedTaskIds);
  }, [selectedTaskIds]);

  React.useEffect(() => {
    validate('assigneeId', assigneeId);
  }, [assigneeId]);

  const handleTaskToggle = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleDelegate = () => {
    if (isValid() && selectedTasks.length > 0) {
      onDelegate?.(selectedTasks, assigneeId, note.trim());
      onClose?.();
    }
  };

  const canDelegate = isValid() && selectedTasks.length > 0;
  const availableResources = resources.filter(r => r.available);
  const selectedTasksData = tasks.filter(task => selectedTasks.includes(task.id));

  return (
    <BaseDialog
      title="Delegate Tasks"
      size="large"
      {...props}
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
            <Button onClick={handleDelegate} disabled={!canDelegate}>
              Delegate
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Task Selection */}
        <div className="space-y-3">
          <Label>Select Tasks to Delegate</Label>
          <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-2">
                  <Select
                    checked={selectedTasks.includes(task.id)}
                    onCheckedChange={() => handleTaskToggle(task.id)}
                  />
                  <div>
                    <div className="font-medium">{task.name}</div>
                    {task.currentAssignee && (
                      <div className="text-sm text-muted-foreground">
                        Currently: {task.currentAssignee}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assignee Selection */}
        <div className="space-y-2">
          <Label htmlFor="assignee">Delegate To *</Label>
          <Select
            value={assigneeId}
            onValueChange={setAssigneeId}
          >
            <SelectTrigger className={errors.assigneeId ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select a resource..." />
            </SelectTrigger>
            <SelectContent>
              {availableResources.map(resource => (
                <SelectItem key={resource.id} value={resource.id}>
                  <div>
                    <div className="font-medium">{resource.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {resource.department} • {resource.email}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.assigneeId && (
            <div className="text-sm text-red-500">{errors.assigneeId}</div>
          )}
        </div>

        {/* Delegation Note */}
        <div className="space-y-2">
          <Label htmlFor="note">Delegation Note (Optional)</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Add a note about this delegation..."
          />
        </div>

        {/* Preview */}
        {selectedTasksData.length > 0 && assigneeId && (
          <div className="border rounded-lg p-3 bg-primary/10">
            <Label className="text-sm font-medium mb-2">Delegation Summary</Label>
            <div className="text-sm space-y-1">
              <div>
                <strong>Tasks:</strong> {selectedTasksData.map(t => t.name).join(', ')}
              </div>
              <div>
                <strong>Delegate to:</strong> {
                  resources.find(r => r.id === assigneeId)?.name || 'Unknown'
                }
              </div>
              {note && (
                <div>
                  <strong>Note:</strong> {note}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </BaseDialog>
  );
};

