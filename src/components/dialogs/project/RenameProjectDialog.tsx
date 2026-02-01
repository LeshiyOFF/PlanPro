import React from 'react';
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDialogValidation } from '../hooks/useDialogValidation';

export interface RenameProjectDialogProps extends Omit<BaseDialogProps, 'children'> {
  projectName?: string;
  existingNames?: string[];
  onRename?: (newName: string, saveAs: boolean) => void;
}

export const RenameProjectDialog: React.FC<RenameProjectDialogProps> = ({
  projectName = '',
  existingNames = [],
  onRename,
  onClose,
  ...props
}) => {
  const [newName, setNewName] = React.useState(projectName);
  const [saveAs, setSaveAs] = React.useState(false);
  
  const { validate, errors, isValid } = useDialogValidation({
    newName: {
      required: true,
      minLength: 1,
      maxLength: 255,
      custom: (value) => {
        if (!value || typeof value !== 'string') return 'Project name is required';
        if (!value.trim()) return 'Project name is required';
        if (existingNames.includes(value.trim()) && !saveAs) {
          return 'Project with this name already exists';
        }
        return null;
      }
    }
  });

  React.useEffect(() => {
    setNewName(projectName);
  }, [projectName]);

  React.useEffect(() => {
    validate({ newName });
  }, [newName, saveAs, existingNames]);

  const handleRename = () => {
    if (isValid()) {
      onRename?.(newName.trim(), saveAs);
      onClose?.();
    }
  };

  const canRename = isValid() && newName.trim() !== projectName;

  const { open: _open, onOpenChange: _onOpenChange, title: _title, ...dialogProps } = props;

  return (
    <BaseDialog
      title="Rename Project"
      size="medium"
      open={props.open}
      onOpenChange={props.onOpenChange}
      {...dialogProps}
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="saveAs" 
              checked={saveAs}
              onCheckedChange={(checked) => setSaveAs(checked as boolean)}
            />
            <Label htmlFor="saveAs">Save as new project</Label>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={!canRename}>
              {saveAs ? 'Save As' : 'Rename'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newName">New Project Name</Label>
          <Input
            id="newName"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter project name"
            className={errors.newName ? 'border-red-500' : ''}
          />
          {errors.newName && (
            <Alert variant="destructive">
              <AlertDescription>{errors.newName}</AlertDescription>
            </Alert>
          )}
        </div>

        {!saveAs && newName.trim() !== projectName && (
          <Alert>
            <AlertDescription>
              This will rename the current project from "{projectName}" to "{newName.trim()}".
            </AlertDescription>
          </Alert>
        )}

        {saveAs && (
          <Alert>
            <AlertDescription>
              This will create a copy of "{projectName}" with the new name "{newName.trim()}".
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground">
          Current name: <span className="font-medium">{projectName}</span>
        </div>
      </div>
    </BaseDialog>
  );
};

