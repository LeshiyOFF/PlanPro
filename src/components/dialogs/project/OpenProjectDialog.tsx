import React from 'react';
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export interface Project {
  id: string;
  name: string;
  path: string;
  lastModified: string;
  size: string;
  isMaster: boolean;
  status: 'active' | 'completed' | 'archived';
}

export interface OpenProjectDialogProps extends Omit<BaseDialogProps, 'children'> {
  projects?: Project[];
  currentProjectIds?: string[];
  allowMaster?: boolean;
  allowOpenAs?: boolean;
  onOpen?: (projectIds: string[], readOnly?: boolean) => void;
}

export const OpenProjectDialog: React.FC<OpenProjectDialogProps> = ({
  projects = [],
  currentProjectIds = [],
  allowMaster = false,
  allowOpenAs = true,
  onOpen,
  onClose,
  ...props
}) => {
  const [selectedProjects, setSelectedProjects] = React.useState<string[]>([]);
  const [readOnly, setReadOnly] = React.useState(false);

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleOpen = () => {
    onOpen?.(selectedProjects, readOnly);
    onClose?.();
  };

  const canOpen = selectedProjects.length > 0;

  return (
    <BaseDialog
      title="Open Project"
      size="large"
      {...props}
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <div className="flex items-center space-x-4">
            {allowOpenAs && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="readonly" 
                  checked={readOnly}
                  onCheckedChange={setReadOnly}
                />
                <Label htmlFor="readonly">Open Read-Only</Label>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleOpen} disabled={!canOpen}>
              Open
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Select project(s) to open from the list below:
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Select</TableHead>
                <TableHead>Project Name</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                {allowMaster && <TableHead>Type</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map(project => (
                <TableRow 
                  key={project.id}
                  className={currentProjectIds.includes(project.id) ? 'bg-muted/50' : ''}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedProjects.includes(project.id)}
                      onCheckedChange={() => handleProjectSelect(project.id)}
                      disabled={currentProjectIds.includes(project.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {project.path}
                  </TableCell>
                  <TableCell>{project.lastModified}</TableCell>
                  <TableCell>{project.size}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        project.status === 'active' ? 'default' :
                        project.status === 'completed' ? 'secondary' : 'outline'
                      }
                    >
                      {project.status}
                    </Badge>
                  </TableCell>
                  {allowMaster && (
                    <TableCell>
                      <Badge variant={project.isMaster ? 'secondary' : 'outline'}>
                        {project.isMaster ? 'Master' : 'Standard'}
                      </Badge>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {selectedProjects.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {selectedProjects.length} project(s) selected
          </div>
        )}
      </div>
    </BaseDialog>
  );
};
