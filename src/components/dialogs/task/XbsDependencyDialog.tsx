import React from 'react';
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';

export interface ExtendedDependency {
  id: string;
  predecessorId: string;
  successorId: string;
  type: 'FS' | 'SS' | 'FF' | 'SF';
  lag: number;
  leadTime?: number;
  critical?: boolean;
  calendar?: string;
}

export interface Task {
  id: string;
  name: string;
  wbs: string;
  duration: number;
}

export interface XbsDependencyDialogProps extends Omit<BaseDialogProps, 'children'> {
  tasks?: Task[];
  dependencies?: ExtendedDependency[];
  calendars?: string[];
  onSave?: (dependencies: ExtendedDependency[]) => void;
}

const DEPENDENCY_TYPES = [
  { value: 'FS', label: 'Finish-to-Start' },
  { value: 'SS', label: 'Start-to-Start' },
  { value: 'FF', label: 'Finish-to-Finish' },
  { value: 'SF', label: 'Start-to-Finish' }
];

export const XbsDependencyDialog: React.FC<XbsDependencyDialogProps> = ({
  tasks = [],
  dependencies = [],
  calendars = [],
  onSave,
  onClose,
  ...props
}) => {
  const [selectedDependencies, setSelectedDependencies] = React.useState<string[]>(
    dependencies.map(d => d.id)
  );
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [bulkUpdate, setBulkUpdate] = React.useState({
    type: 'FS' as const,
    leadTime: 0,
    critical: false,
    calendar: ''
  });

  const handleDependencyToggle = (dependencyId: string) => {
    setSelectedDependencies(prev => 
      prev.includes(dependencyId)
        ? prev.filter(id => id !== dependencyId)
        : [...prev, dependencyId]
    );
  };

  const handleBulkApply = () => {
    // Apply bulk updates to selected dependencies
    // This would be implemented in the actual business logic
    console.log('Bulk update applied to:', selectedDependencies, bulkUpdate);
  };

  const handleSave = () => {
    const updatedDependencies = dependencies
      .filter(d => selectedDependencies.includes(d.id))
      .map(d => ({
        ...d,
        ...(showAdvanced && {
          type: bulkUpdate.type,
          leadTime: bulkUpdate.leadTime,
          critical: bulkUpdate.critical,
          calendar: bulkUpdate.calendar
        })
      }));
    
    onSave?.(updatedDependencies);
    onClose?.();
  };

  const selectedDependenciesData = dependencies.filter(d => 
    selectedDependencies.includes(d.id)
  );

  const getTaskName = (taskId: string) => {
    return tasks.find(t => t.id === taskId)?.name || 'Unknown';
  };

  const getTypeBadgeVariant = (type: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      'FS': 'default',
      'SS': 'secondary',
      'FF': 'outline',
      'SF': 'outline'
    };
    return variants[type] || 'outline';
  };

  return (
    <BaseDialog
      title="Extended Dependencies Management"
      size="fullscreen"
      {...props}
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showAdvanced"
                checked={showAdvanced}
                onCheckedChange={setShowAdvanced}
              />
              <Label htmlFor="showAdvanced">Advanced Options</Label>
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedDependencies.length} of {dependencies.length} selected
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {showAdvanced && (
              <Button variant="secondary" onClick={handleBulkApply} disabled={selectedDependencies.length === 0}>
                Apply Bulk
              </Button>
            )}
            <Button onClick={handleSave} disabled={selectedDependencies.length === 0}>
              Save
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Dependencies Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Select</TableHead>
                <TableHead>Predecessor</TableHead>
                <TableHead>Successor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Lag</TableHead>
                {showAdvanced && (
                  <>
                    <TableHead>Lead Time</TableHead>
                    <TableHead>Critical</TableHead>
                    <TableHead>Calendar</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {dependencies.map(dependency => (
                <TableRow 
                  key={dependency.id}
                  className={selectedDependencies.includes(dependency.id) ? 'bg-muted/50' : ''}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedDependencies.includes(dependency.id)}
                      onCheckedChange={() => handleDependencyToggle(dependency.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {getTaskName(dependency.predecessorId)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {getTaskName(dependency.successorId)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeBadgeVariant(dependency.type)}>
                      {dependency.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{dependency.lag}d</TableCell>
                  {showAdvanced && (
                    <>
                      <TableCell>
                        {dependency.leadTime || '-'}
                      </TableCell>
                      <TableCell>
                        {dependency.critical ? (
                          <Badge variant="destructive">Critical</Badge>
                        ) : (
                          <Badge variant="outline">Normal</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {dependency.calendar || 'Default'}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="border rounded-lg p-4 bg-muted/30">
            <Label className="text-sm font-medium mb-4">Bulk Update Options</Label>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bulkType">Dependency Type</Label>
                <Select
                  value={bulkUpdate.type}
                  onValueChange={(value) => setBulkUpdate(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPENDENCY_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leadTime">Lead Time (days)</Label>
                <Input
                  id="leadTime"
                  type="number"
                  step="0.1"
                  value={bulkUpdate.leadTime}
                  onChange={(e) => setBulkUpdate(prev => ({ 
                    ...prev, 
                    leadTime: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="critical">Critical Path</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="critical"
                    checked={bulkUpdate.critical}
                    onCheckedChange={(checked) => setBulkUpdate(prev => ({ 
                      ...prev, 
                      critical: checked as boolean 
                    }))}
                  />
                  <Label htmlFor="critical">Mark as Critical</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="calendar">Calendar</Label>
                <Select
                  value={bulkUpdate.calendar}
                  onValueChange={(value) => setBulkUpdate(prev => ({ ...prev, calendar: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select calendar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Default Calendar</SelectItem>
                    {calendars.map(calendar => (
                      <SelectItem key={calendar} value={calendar}>
                        {calendar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{dependencies.length}</div>
            <div className="text-sm text-muted-foreground">Total Dependencies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{selectedDependencies.length}</div>
            <div className="text-sm text-muted-foreground">Selected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {dependencies.filter(d => d.critical).length}
            </div>
            <div className="text-sm text-muted-foreground">Critical Path</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {dependencies.reduce((sum, d) => sum + (d.lag || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Lag Days</div>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
};

