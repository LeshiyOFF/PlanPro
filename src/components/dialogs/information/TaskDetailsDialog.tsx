import React from 'react';
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface TaskDetails {
  id: string;
  name: string;
  wbs: string;
  duration: number;
  startDate: string;
  finishDate: string;
  actualStartDate?: string;
  actualFinishDate?: string;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  priority: 'low' | 'normal' | 'high' | 'critical';
  constraintType: 'asap' | 'aslate' | 'mso' | 'mfo' | 'snet' | 'snlt' | 'fnet' | 'fnlt';
  constraintDate?: string;
  predecessorCount: number;
  successorCount: number;
  resources: TaskResource[];
  assignments: TaskAssignment[];
  notes: TaskNote[];
  customFields: CustomField[];
}

export interface TaskResource {
  id: string;
  name: string;
  type: 'work' | 'material' | 'cost';
  units: number;
  work: number;
  cost: number;
}

export interface TaskAssignment {
  id: string;
  resourceName: string;
  units: number;
  work: number;
  remainingWork: number;
  actualWork: number;
  cost: number;
}

export interface TaskNote {
  id: string;
  date: string;
  author: string;
  content: string;
  category: string;
}

export interface CustomField {
  name: string;
  value: string | number | boolean;
  type: 'text' | 'number' | 'date' | 'boolean';
}

export interface TaskDetailsDialogProps extends Omit<BaseDialogProps, 'children'> {
  task?: TaskDetails;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onPrint?: (taskId: string) => void;
}

export const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
  task,
  onEdit,
  onDelete,
  onPrint,
  onClose,
  ...props
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-slate-100 text-slate-900';
      case 'delayed': return 'bg-red-100 text-red-800';
      case 'not-started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-slate-100 text-slate-900';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalWork = task?.assignments.reduce((sum, a) => sum + a.work, 0) || 0;
  const totalCost = task?.assignments.reduce((sum, a) => sum + a.cost, 0) || 0;
  const remainingWork = task?.assignments.reduce((sum, a) => sum + a.remainingWork, 0) || 0;

  if (!task) {
    return (
      <BaseDialog
        title="Task Details"
        size="fullscreen"
        {...props}
        onClose={onClose}
        footer={
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        }
      >
        <div className="text-center py-8">
          <div className="text-lg font-medium text-muted-foreground">
            No task selected
          </div>
        </div>
      </BaseDialog>
    );
  }

  return (
    <BaseDialog
      title={`Task Details - ${task.name}`}
      size="fullscreen"
      {...props}
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onPrint?.(task.id)}>
              Print
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => onEdit?.(task.id)}>
              Edit Task
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Task Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold mb-2">{task.name}</h2>
                <div className="text-sm text-muted-foreground mb-3">
                  WBS: {task.wbs}
                </div>
                <div className="flex space-x-2">
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.replace('-', ' ')}
                  </Badge>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold mb-1">{task.progress}%</div>
                <Progress value={task.progress} className="w-32" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{task.duration}d</div>
                  <div className="text-sm text-muted-foreground">
                    {task.duration > 1 ? 'days' : 'day'}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Dependencies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">
                    {task.predecessorCount} → {task.successorCount}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Predecessors → Successors
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalCost.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">
                    All assignments
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Custom Fields */}
            {task.customFields.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Custom Fields</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {task.customFields.map((field, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="font-medium">{field.name}:</span>
                        <span>
                          {typeof field.value === 'boolean' 
                            ? field.value ? 'Yes' : 'No'
                            : String(field.value)
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Planned Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Start Date:</span>
                      <span className="font-medium">{task.startDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Finish Date:</span>
                      <span className="font-medium">{task.finishDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{task.duration} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Constraint:</span>
                      <span className="font-medium">
                        {task.constraintType.toUpperCase()}
                        {task.constraintDate && ` (${task.constraintDate})`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actual Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Actual Start:</span>
                      <span className="font-medium">
                        {task.actualStartDate || 'Not started'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Actual Finish:</span>
                      <span className="font-medium">
                        {task.actualFinishDate || 'Not completed'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Progress:</span>
                      <span className="font-medium">{task.progress}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-4">
            {task.resources.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Allocated Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {task.resources.map((resource, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{resource.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Type: {resource.type}
                            </div>
                          </div>
                          <Badge variant="outline">{resource.units}%</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Work:</span>
                            <span className="ml-2 font-medium">
                              {resource.work.toFixed(1)}h
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Cost:</span>
                            <span className="ml-2 font-medium">
                              ${resource.cost.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Efficiency:</span>
                            <span className="ml-2 font-medium">
                              {((resource.work / (resource.units * task.duration * 8)) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8 border rounded-lg bg-muted/30">
                <div className="text-lg font-medium text-muted-foreground">
                  No resources allocated
                </div>
              </div>
            )}
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Work Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {task.assignments.map((assignment, index) => (
                    <div key={index} className="border rounded p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">{assignment.resourceName}</div>
                        <Badge variant="outline">{assignment.units}%</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total:</span>
                          <span className="ml-1">{assignment.work.toFixed(1)}h</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Actual:</span>
                          <span className="ml-1">{assignment.actualWork.toFixed(1)}h</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Remaining:</span>
                          <span className="ml-1">{assignment.remainingWork.toFixed(1)}h</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="ml-1">${assignment.cost.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Progress 
                          value={((assignment.work - assignment.remainingWork) / assignment.work) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Assignment Summary */}
                <div className="mt-4 p-3 bg-muted/30 rounded">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold">{totalWork.toFixed(1)}h</div>
                      <div className="text-muted-foreground">Total Work</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">{remainingWork.toFixed(1)}h</div>
                      <div className="text-muted-foreground">Remaining</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">${totalCost.toLocaleString()}</div>
                      <div className="text-muted-foreground">Total Cost</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">{task.assignments.length}</div>
                      <div className="text-muted-foreground">Assignments</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            {task.notes.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Task Notes ({task.notes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {task.notes.map((note, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{note.author}</div>
                            <div className="text-sm text-muted-foreground">
                              {note.date} • {note.category}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm whitespace-pre-wrap">
                          {note.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8 border rounded-lg bg-muted/30">
                <div className="text-lg font-medium text-muted-foreground">
                  No notes for this task
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </BaseDialog>
  );
};
