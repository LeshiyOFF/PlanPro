import React from 'react';
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

export interface ProjectStats {
  id: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  criticalTasks: number;
  milestones: number;
  totalDuration: number;
  actualDuration: number;
  remainingDuration: number;
  startDate: string;
  finishDate: string;
  actualStartDate?: string;
  actualFinishDate?: string;
  totalCost: number;
  actualCost: number;
  remainingCost: number;
  resources: number;
  assignments: number;
  issues: number;
  risks: number;
}

export interface TaskBreakdown {
  phase: string;
  planned: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  percentage: number;
}

export interface ResourceUsage {
  name: string;
  type: 'work' | 'material' | 'cost';
  allocated: number;
  used: number;
  percentage: number;
  overAllocated: boolean;
}

export interface ProjectStatisticsDialogProps extends Omit<BaseDialogProps, 'children'> {
  projectStats?: ProjectStats;
  taskBreakdown?: TaskBreakdown[];
  resourceUsage?: ResourceUsage[];
  onExport?: (format: 'pdf' | 'excel' | 'csv') => void;
}

export const ProjectStatisticsDialog: React.FC<ProjectStatisticsDialogProps> = ({
  projectStats,
  taskBreakdown = [],
  resourceUsage = [],
  onExport,
  onClose,
  ...props
}) => {
  const completionPercentage = projectStats ? (projectStats.completedTasks / projectStats.totalTasks * 100) : 0;
  const costVariance = projectStats ? projectStats.actualCost - projectStats.totalCost : 0;
  const scheduleVariance = projectStats ? projectStats.actualDuration - projectStats.totalDuration : 0;

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getVarianceColor = (variance: number) => {
    if (variance <= 0) return 'text-green-600';
    if (variance <= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!projectStats) {
    return (
      <BaseDialog
        title="Project Statistics"
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
            No project statistics available
          </div>
        </div>
      </BaseDialog>
    );
  }

  return (
    <BaseDialog
      title={`Statistics - ${projectStats.name}`}
      size="fullscreen"
      {...props}
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => onExport?.('pdf')}
            >
              Export PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onExport?.('excel')}
            >
              Export Excel
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onExport?.('csv')}
            >
              Export CSV
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Project Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold">{completionPercentage.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Complete</div>
                <Progress value={completionPercentage} className="mt-2" />
              </div>
              <div>
                <div className="text-2xl font-bold">{projectStats.totalTasks}</div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
                <div className="text-xs space-y-1 mt-2">
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <span>{projectStats.completedTasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>In Progress:</span>
                    <span>{projectStats.inProgressTasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Not Started:</span>
                    <span>{projectStats.notStartedTasks}</span>
                  </div>
                </div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${getStatusColor(completionPercentage)}`}>
                  {projectStats.criticalTasks}
                </div>
                <div className="text-sm text-muted-foreground">Critical Tasks</div>
                {projectStats.criticalTasks > 0 && (
                  <Badge variant="destructive" className="mt-2">
                    Attention Required
                  </Badge>
                )}
              </div>
              <div>
                <div className="text-2xl font-bold">{projectStats.milestones}</div>
                <div className="text-sm text-muted-foreground">Milestones</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium mb-3">Timeline</Label>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Start Date:</span>
                    <span>{projectStats.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Finish Date:</span>
                    <span>{projectStats.finishDate}</span>
                  </div>
                  {projectStats.actualStartDate && (
                    <div className="flex justify-between">
                      <span>Actual Start:</span>
                      <span>{projectStats.actualStartDate}</span>
                    </div>
                  )}
                  {projectStats.actualFinishDate && (
                    <div className="flex justify-between">
                      <span>Actual Finish:</span>
                      <span>{projectStats.actualFinishDate}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-3">Duration Analysis</Label>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Planned:</span>
                    <span>{projectStats.totalDuration} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Actual:</span>
                    <span>{projectStats.actualDuration} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining:</span>
                    <span>{projectStats.remainingDuration} days</span>
                  </div>
                  <div className={`flex justify-between font-medium ${getVarianceColor(scheduleVariance)}`}>
                    <span>Variance:</span>
                    <span>{scheduleVariance > 0 ? '+' : ''}{scheduleVariance} days</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold">${projectStats.totalCost.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Planned Cost</div>
              </div>
              <div>
                <div className="text-2xl font-bold">${projectStats.actualCost.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Actual Cost</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${getVarianceColor(costVariance)}`}>
                  ${Math.abs(costVariance).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {costVariance > 0 ? 'Over Budget' : 'Under Budget'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Breakdown by Phase */}
        {taskBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Task Breakdown by Phase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phase</TableHead>
                      <TableHead>Planned</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>In Progress</TableHead>
                      <TableHead>Not Started</TableHead>
                      <TableHead>Complete %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taskBreakdown.map((phase, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{phase.phase}</TableCell>
                        <TableCell>{phase.planned}</TableCell>
                        <TableCell className="text-green-600">{phase.completed}</TableCell>
                        <TableCell className="text-yellow-600">{phase.inProgress}</TableCell>
                        <TableCell className="text-red-600">{phase.notStarted}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={phase.percentage} className="w-16" />
                            <span className="text-sm">{phase.percentage.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resource Usage */}
        {resourceUsage.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium mb-3">Summary</Label>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Resources:</span>
                      <span>{resourceUsage.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Over-allocated:</span>
                      <span className="text-red-600">
                        {resourceUsage.filter(r => r.overAllocated).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Work Resources:</span>
                      <span>{resourceUsage.filter(r => r.type === 'work').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Material Resources:</span>
                      <span>{resourceUsage.filter(r => r.type === 'material').length}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3">Top Resources</Label>
                  <div className="space-y-2 text-sm">
                    {resourceUsage
                      .sort((a, b) => b.percentage - a.percentage)
                      .slice(0, 5)
                      .map((resource, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{resource.name}</span>
                          <span className={resource.overAllocated ? 'text-red-600' : ''}>
                            {resource.percentage.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Issues and Risks */}
        <Card>
          <CardHeader>
            <CardTitle>Issues and Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{projectStats.issues}</div>
                <div className="text-sm text-muted-foreground">Active Issues</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">{projectStats.risks}</div>
                <div className="text-sm text-muted-foreground">Identified Risks</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </BaseDialog>
  );
};

