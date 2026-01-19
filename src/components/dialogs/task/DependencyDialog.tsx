import React from 'react';
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDialogValidation } from '../hooks/useDialogValidation';

export interface Task {
  id: string;
  name: string;
  wbs: string;
  startDate: string;
  finishDate: string;
}

export interface Dependency {
  id: string;
  predecessorId: string;
  successorId: string;
  type: 'FS' | 'SS' | 'FF' | 'SF';
  lag: number;
}

export interface DependencyDialogProps extends Omit<BaseDialogProps, 'children'> {
  tasks?: Task[];
  currentDependency?: Dependency;
  predecessorId?: string;
  successorId?: string;
  onSave?: (dependency: Omit<Dependency, 'id'>) => void;
  onDelete?: (dependencyId: string) => void;
}

const DEPENDENCY_TYPES = [
  { value: 'FS', label: 'Finish-to-Start (FS)', description: 'Predecessor must finish before successor starts' },
  { value: 'SS', label: 'Start-to-Start (SS)', description: 'Predecessor must start before successor starts' },
  { value: 'FF', label: 'Finish-to-Finish (FF)', description: 'Predecessor must finish before successor finishes' },
  { value: 'SF', label: 'Start-to-Finish (SF)', description: 'Predecessor must start before successor finishes' }
];

export const DependencyDialog: React.FC<DependencyDialogProps> = ({
  tasks = [],
  currentDependency,
  predecessorId,
  successorId,
  onSave,
  onDelete,
  onClose,
  ...props
}) => {
  const [dependency, setDependency] = React.useState({
    predecessorId: predecessorId || '',
    successorId: successorId || '',
    type: 'FS' as const,
    lag: 0
  });

  const { validate, errors, isValid } = useDialogValidation({
    predecessorId: {
      required: true,
      validate: (value) => value ? null : 'Predecessor task is required'
    },
    successorId: {
      required: true,
      validate: (value) => value ? null : 'Successor task is required'
    },
    lag: {
      required: true,
      validate: (value) => !isNaN(value) ? null : 'Lag must be a valid number'
    }
  });

  React.useEffect(() => {
    if (currentDependency) {
      setDependency({
        predecessorId: currentDependency.predecessorId,
        successorId: currentDependency.successorId,
        type: currentDependency.type,
        lag: currentDependency.lag
      });
    }
  }, [currentDependency]);

  React.useEffect(() => {
    Object.keys(dependency).forEach(key => {
      validate(key, dependency[key as keyof typeof dependency]);
    });
  }, [dependency]);

  const handleFieldChange = (field: keyof typeof dependency, value: any) => {
    setDependency(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (isValid()) {
      onSave?.(dependency);
      onClose?.();
    }
  };

  const handleDelete = () => {
    if (currentDependency?.id) {
      onDelete?.(currentDependency.id);
      onClose?.();
    }
  };

  const canSave = isValid() && dependency.predecessorId && dependency.successorId;
  const isEditing = !!currentDependency?.id;
  const wouldCreateCycle = dependency.predecessorId === dependency.successorId;

  const getTaskInfo = (taskId: string) => {
    return tasks.find(t => t.id === taskId);
  };

  const getTypeDescription = (type: string) => {
    return DEPENDENCY_TYPES.find(t => t.value === type)?.description || '';
  };

  return (
    <BaseDialog
      title={isEditing ? "Edit Dependency" : "Create Dependency"}
      size="medium"
      {...props}
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
            <Button onClick={handleSave} disabled={!canSave || wouldCreateCycle}>
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Predecessor Selection */}
        <div className="space-y-2">
          <Label htmlFor="predecessor">Predecessor Task *</Label>
          <Select
            value={dependency.predecessorId}
            onValueChange={(value) => handleFieldChange('predecessorId', value)}
            disabled={isEditing}
          >
            <SelectTrigger className={errors.predecessorId ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select predecessor task..." />
            </SelectTrigger>
            <SelectContent>
              {tasks.map(task => (
                <SelectItem key={task.id} value={task.id}>
                  <div>
                    <div className="font-medium">{task.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {task.wbs} • {task.finishDate}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.predecessorId && (
            <div className="text-sm text-red-500">{errors.predecessorId}</div>
          )}
        </div>

        {/* Successor Selection */}
        <div className="space-y-2">
          <Label htmlFor="successor">Successor Task *</Label>
          <Select
            value={dependency.successorId}
            onValueChange={(value) => handleFieldChange('successorId', value)}
            disabled={isEditing}
          >
            <SelectTrigger className={errors.successorId ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select successor task..." />
            </SelectTrigger>
            <SelectContent>
              {tasks.map(task => (
                <SelectItem key={task.id} value={task.id}>
                  <div>
                    <div className="font-medium">{task.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {task.wbs} • {task.startDate}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.successorId && (
            <div className="text-sm text-red-500">{errors.successorId}</div>
          )}
        </div>

        {/* Dependency Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Dependency Type</Label>
          <Select
            value={dependency.type}
            onValueChange={(value) => handleFieldChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEPENDENCY_TYPES.map(type => (
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

        {/* Lag */}
        <div className="space-y-2">
          <Label htmlFor="lag">Lag (days)</Label>
          <Input
            id="lag"
            type="number"
            step="0.1"
            value={dependency.lag}
            onChange={(e) => handleFieldChange('lag', parseFloat(e.target.value) || 0)}
            className={errors.lag ? 'border-red-500' : ''}
          />
          {errors.lag && (
            <div className="text-sm text-red-500">{errors.lag}</div>
          )}
        </div>

        {/* Cycle Warning */}
        {wouldCreateCycle && (
          <Alert variant="destructive">
            <AlertDescription>
              A task cannot be dependent on itself. Please select different predecessor and successor tasks.
            </AlertDescription>
          </Alert>
        )}

        {/* Preview */}
        {dependency.predecessorId && dependency.successorId && !wouldCreateCycle && (
          <div className="border rounded-lg p-3 bg-primary/10">
            <Label className="text-sm font-medium mb-2">Dependency Preview</Label>
            <div className="text-sm space-y-1">
              <div>
                <strong>From:</strong> {getTaskInfo(dependency.predecessorId)?.name}
              </div>
              <div>
                <strong>To:</strong> {getTaskInfo(dependency.successorId)?.name}
              </div>
              <div>
                <strong>Type:</strong> {getTypeDescription(dependency.type)}
              </div>
              <div>
                <strong>Lag:</strong> {dependency.lag} day(s)
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseDialog>
  );
};
