import React from 'react';
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface Resource {
  id: string;
  name: string;
  type: 'work' | 'material' | 'cost';
  maxUnits?: number;
  rate?: number;
  available: boolean;
}

export interface Task {
  id: string;
  name: string;
  duration: number;
  currentAssignments: Assignment[];
}

export interface Assignment {
  id: string;
  taskId: string;
  resourceId: string;
  units: number;
  work: number;
  cost: number;
}

export interface AssignmentDialogProps extends Omit<BaseDialogProps, 'children'> {
  tasks?: Task[];
  resources?: Resource[];
  currentAssignments?: Assignment[];
  onAssign?: (assignments: Assignment[]) => void;
  onRemove?: (assignmentIds: string[]) => void;
  onReplace?: (oldResourceId: string, newResourceId: string, assignments: Assignment[]) => void;
}

export const AssignmentDialog: React.FC<AssignmentDialogProps> = ({
  tasks = [],
  resources = [],
  currentAssignments = [],
  onAssign,
  onRemove,
  onReplace,
  onClose,
  ...props
}) => {
  const { title: _omitTitle, ...dialogProps } = props;
  const [selectedTasks, setSelectedTasks] = React.useState<string[]>([]);
  const [selectedResources, setSelectedResources] = React.useState<string[]>([]);
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [mode, setMode] = React.useState<'assign' | 'remove' | 'replace'>('assign');

  const availableResources = resources.filter(r => r.available);

  React.useEffect(() => {
    // Initialize assignments based on current assignments
    setAssignments(currentAssignments);
  }, [currentAssignments]);

  const handleTaskToggle = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleResourceToggle = (resourceId: string) => {
    setSelectedResources(prev => 
      prev.includes(resourceId)
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const handleUnitsChange = (assignmentId: string, units: number) => {
    setAssignments(prev => 
      prev.map(a => a.id === assignmentId ? { ...a, units } : a)
    );
  };

  const handleAssign = () => {
    if (selectedTasks.length > 0 && selectedResources.length > 0) {
      const newAssignments: Assignment[] = [];
      
      selectedTasks.forEach(taskId => {
        selectedResources.forEach(resourceId => {
          const resource = resources.find(r => r.id === resourceId);
          const task = tasks.find(t => t.id === taskId);
          
          if (resource && task) {
            const units = resource.maxUnits ? Math.min(100, resource.maxUnits) : 100;
            const work = task.duration * (units / 100);
            const cost = work * (resource.rate || 0);
            
            newAssignments.push({
              id: `${taskId}-${resourceId}-${Date.now()}`,
              taskId,
              resourceId,
              units,
              work,
              cost
            });
          }
        });
      });
      
      onAssign?.(newAssignments);
      onClose?.();
    }
  };

  const handleRemoveAssignments = () => {
    const assignmentIds = assignments
      .filter(a => selectedTasks.includes(a.taskId))
      .map(a => a.id);
    
    if (assignmentIds.length > 0) {
      onRemove?.(assignmentIds);
      onClose?.();
    }
  };

  const totalWork = assignments.reduce((sum, a) => sum + a.work, 0);
  const totalCost = assignments.reduce((sum, a) => sum + a.cost, 0);
  const overAllocatedResources = assignments.filter(a => a.units > 100).length;

  const canAssign = selectedTasks.length > 0 && selectedResources.length > 0;
  const canRemove = selectedTasks.length > 0;

  return (
    <BaseDialog
      {...dialogProps}
      title="Resource Assignments"
      size="fullscreen"
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              {assignments.length} assignment(s) total
            </div>
            {overAllocatedResources > 0 && (
              <Badge variant="destructive">
                {overAllocatedResources} over-allocated
              </Badge>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {mode === 'assign' && (
              <Button onClick={handleAssign} disabled={!canAssign}>
                Assign
              </Button>
            )}
            {mode === 'remove' && (
              <Button onClick={handleRemoveAssignments} disabled={!canRemove}>
                Remove
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Mode Selection */}
        <div className="flex space-x-2">
          <Button
            variant={mode === 'assign' ? 'default' : 'outline'}
            onClick={() => setMode('assign')}
          >
            Assign Resources
          </Button>
          <Button
            variant={mode === 'remove' ? 'default' : 'outline'}
            onClick={() => setMode('remove')}
          >
            Remove Assignments
          </Button>
          <Button
            variant={mode === 'replace' ? 'default' : 'outline'}
            onClick={() => setMode('replace')}
          >
            Replace Assignments
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Work</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{totalWork.toFixed(1)}h</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">${totalCost.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Resources Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {assignments.map(a => a.resourceId).filter((v, i, a) => a.indexOf(v) === i).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tasks Assigned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {assignments.map(a => a.taskId).filter((v, i, a) => a.indexOf(v) === i).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Task Selection */}
          <div className="space-y-3">
            <Label>Select Tasks</Label>
            <div className="border rounded-lg p-3 max-h-60 overflow-y-auto">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task.id)}
                    onChange={() => handleTaskToggle(task.id)}
                  />
                  <div>
                    <div className="font-medium text-sm">{task.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {task.duration}d • {task.currentAssignments.length} assignment(s)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resource Selection */}
          <div className="space-y-3">
            <Label>Select Resources</Label>
            <div className="border rounded-lg p-3 max-h-60 overflow-y-auto">
              {availableResources.map(resource => (
                <div key={resource.id} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    checked={selectedResources.includes(resource.id)}
                    onChange={() => handleResourceToggle(resource.id)}
                  />
                  <div>
                    <div className="font-medium text-sm">{resource.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {resource.type} • ${resource.rate || 0}/h 
                      {resource.maxUnits && ` • Max: ${resource.maxUnits}%`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current Assignments Table */}
        {assignments.length > 0 && (
          <div className="space-y-3">
            <Label>Current Assignments</Label>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Units (%)</TableHead>
                    <TableHead>Work (h)</TableHead>
                    <TableHead>Cost ($)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map(assignment => {
                    const task = tasks.find(t => t.id === assignment.taskId);
                    const resource = resources.find(r => r.id === assignment.resourceId);
                    
                    return (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">{task?.name || 'Unknown'}</TableCell>
                        <TableCell>{resource?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="200"
                            value={assignment.units}
                            onChange={(e) => handleUnitsChange(assignment.id, parseFloat(e.target.value) || 0)}
                            className="w-20 h-8"
                          />
                        </TableCell>
                        <TableCell>{assignment.work.toFixed(1)}</TableCell>
                        <TableCell>${assignment.cost.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </BaseDialog>
  );
};

