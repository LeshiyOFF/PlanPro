import React from 'react';
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ProjectSummary {
  id: string;
  name: string;
  tasks: number;
  completedTasks: number;
  resources: number;
  startDate: string;
  finishDate: string;
  status: 'planning' | 'active' | 'completed' | 'archived';
  progress: number;
}

export interface ProjectsDialogProps extends Omit<BaseDialogProps, 'children'> {
  projects?: ProjectSummary[];
  onSelectProject?: (projectId: string) => void;
  onNewProject?: () => void;
  onOpenProject?: (projectId: string) => void;
  onDeleteProject?: (projectId: string) => void;
}

export const ProjectsDialog: React.FC<ProjectsDialogProps> = ({
  projects = [],
  onSelectProject,
  onNewProject,
  onOpenProject,
  onDeleteProject,
  onClose,
  ...props
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>('');

  const filteredProjects = React.useMemo(() => {
    return projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    onSelectProject?.(projectId);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      planning: 'outline',
      active: 'default',
      completed: 'secondary',
      archived: 'outline'
    };
    return variants[status] || 'outline';
  };

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  const { open: _open, onOpenChange: _onOpenChange, title: _title, ...dialogProps } = props;

  return (
    <BaseDialog
      title="Projects Management"
      size="fullscreen"
      open={props.open}
      onOpenChange={props.onOpenChange}
      {...dialogProps}
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {filteredProjects.length} of {totalProjects} projects
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onNewProject}>
              New Project
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeProjects}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{completedProjects}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Projects</Label>
          <Input
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by project name..."
          />
        </div>

        {/* Projects Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Resources</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Finish Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map(project => (
                <TableRow 
                  key={project.id}
                  className={`cursor-pointer hover:bg-muted/50 ${
                    selectedProjectId === project.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => handleProjectSelect(project.id)}
                >
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    {project.completedTasks}/{project.tasks}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-primary rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-sm">{project.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{project.resources}</TableCell>
                  <TableCell>{project.startDate}</TableCell>
                  <TableCell>{project.finishDate}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(project.status)}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenProject?.(project.id);
                        }}
                      >
                        Open
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject?.(project.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </BaseDialog>
  );
};

