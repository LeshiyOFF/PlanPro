import React from 'react';
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export interface BaselineDialogProps extends Omit<BaseDialogProps, 'children'> {
  hasTasksSelected?: boolean;
  projectBaselines?: number[];
  onSetBaseline?: (baselineNumber: number, entireProject: boolean) => void;
  onClearBaseline?: (baselineNumber: number) => void;
}

const BASELINE_NAMES: Record<number, string> = {
  0: 'Baseline',
  1: 'Baseline 1',
  2: 'Baseline 2',
  3: 'Baseline 3',
  4: 'Baseline 4',
  5: 'Baseline 5',
  6: 'Baseline 6',
  7: 'Baseline 7',
  8: 'Baseline 8',
  9: 'Baseline 9',
  10: 'Baseline 10'
};

export const BaselineDialog: React.FC<BaselineDialogProps> = ({
  hasTasksSelected = false,
  projectBaselines = [],
  onSetBaseline,
  onClearBaseline,
  onClose,
  ...props
}) => {
  const [mode, setMode] = React.useState<'set' | 'clear'>('set');
  const [scope, setScope] = React.useState<'selected' | 'entire'>('entire');
  const [baselineNumber, setBaselineNumber] = React.useState(0);

  const nextAvailableBaseline = React.useMemo(() => {
    for (let i = 0; i <= 10; i++) {
      if (!projectBaselines.includes(i)) {
        return i;
      }
    }
    return -1; // All baselines used
  }, [projectBaselines]);

  React.useEffect(() => {
    if (nextAvailableBaseline >= 0) {
      setBaselineNumber(nextAvailableBaseline);
    }
  }, [nextAvailableBaseline]);

  const handleSetBaseline = () => {
    onSetBaseline?.(baselineNumber, scope === 'entire');
    onClose?.();
  };

  const handleClearBaseline = () => {
    onClearBaseline?.(baselineNumber);
    onClose?.();
  };

  const canSetBaseline = nextAvailableBaseline >= 0 && 
    (scope === 'entire' || hasTasksSelected);

  const usedBaselines = projectBaselines.map(num => BASELINE_NAMES[num] || `Baseline ${num}`);
  const availableBaselines = Array.from({ length: 11 }, (_, i) => i)
    .filter(i => !projectBaselines.includes(i))
    .map(i => BASELINE_NAMES[i] || `Baseline ${i}`);

  return (
    <BaseDialog
      title="Manage Baselines"
      size="medium"
      {...props}
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {mode === 'set' ? `${availableBaselines.length} baselines available` : ''}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {mode === 'set' ? (
              <Button onClick={handleSetBaseline} disabled={!canSetBaseline}>
                Set Baseline
              </Button>
            ) : (
              <Button onClick={handleClearBaseline} disabled={!projectBaselines.includes(baselineNumber)}>
                Clear Baseline
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Mode Selection */}
        <div className="space-y-3">
          <Label>Operation</Label>
          <Select value={mode} onValueChange={(value) => setMode(value as 'set' | 'clear')}>
            <SelectTrigger>
              <SelectValue placeholder="Select operation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="set">Set baseline</SelectItem>
              <SelectItem value="clear">Clear baseline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Baseline Selection */}
        <div className="space-y-3">
          <Label>Baseline Number</Label>
          <div className="flex flex-wrap gap-2">
            {mode === 'set' ? (
              availableBaselines.map((name, index) => {
                const actualNumber = Array.from({ length: 11 }, (_, i) => i)
                  .filter(i => !projectBaselines.includes(i))[index];
                return (
                  <Button
                    key={name}
                    type="button"
                    variant={baselineNumber === actualNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBaselineNumber(actualNumber)}
                  >
                    {name}
                  </Button>
                );
              })
            ) : (
              projectBaselines.map(num => {
                const name = BASELINE_NAMES[num] || `Baseline ${num}`;
                return (
                  <Button
                    key={name}
                    type="button"
                    variant={baselineNumber === num ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBaselineNumber(num)}
                  >
                    {name}
                  </Button>
                );
              })
            )}
          </div>
        </div>

        {/* Scope Selection (only for set mode) */}
        {mode === 'set' && (
          <div className="space-y-3">
            <Label>Scope</Label>
            <Select value={scope} onValueChange={(value) => setScope(value as 'selected' | 'entire')}>
              <SelectTrigger>
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entire">Entire project</SelectItem>
                <SelectItem value="selected" disabled={!hasTasksSelected}>
                  Selected tasks only
                </SelectItem>
              </SelectContent>
            </Select>

            {!hasTasksSelected && scope === 'selected' && (
              <Alert>
                <AlertDescription>
                  No tasks are currently selected. Please select tasks or choose "Entire project".
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Status Information */}
        {mode === 'set' && nextAvailableBaseline < 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              All 10 baselines are already in use. Clear an existing baseline before creating a new one.
            </AlertDescription>
          </Alert>
        )}

        {/* Current Baselines Info */}
        {usedBaselines.length > 0 && (
          <div className="space-y-2">
            <Label>Current Baselines</Label>
            <div className="flex flex-wrap gap-1">
              {usedBaselines.map(name => (
                <Badge key={name} variant="secondary">
                  {name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseDialog>
  );
};
