import React from 'react'
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useDialogValidation } from '../hooks/useDialogValidation'
import { ResourceUnitsConverter } from '@/domain/resources/utils/ResourceUnitsConverter'

export interface Resource {
  id: string;
  name: string;
  type: 'work' | 'material' | 'cost';
  maxUnits: number;
  available: boolean;
  currentAssignments: number;
}

export interface Assignment {
  id: string;
  taskId: string;
  taskName: string;
  units: number;
  work: number;
  cost: number;
}

export interface ReplaceAssignmentDialogProps extends Omit<BaseDialogProps, 'children'> {
  currentResource?: Resource;
  assignments?: Assignment[];
  availableResources?: Resource[];
  onReplace?: (oldResourceId: string, newResourceId: string, assignments: Assignment[]) => void;
}

export const ReplaceAssignmentDialog: React.FC<ReplaceAssignmentDialogProps> = ({
  currentResource,
  assignments = [],
  availableResources = [],
  onReplace,
  onClose,
  ...props
}) => {
  const { title: _omitTitle, ...dialogProps } = props
  const [selectedResourceId, setSelectedResourceId] = React.useState('')
  const [keepPercentages, setKeepPercentages] = React.useState(true)

  const { validate, errors, isValid } = useDialogValidation({
    selectedResourceId: {
      required: true,
      validate: (value) => {
        if (!value) return 'Please select a replacement resource'
        if (value === currentResource?.id) return 'Cannot replace with the same resource'
        return null
      },
    },
  })

  React.useEffect(() => {
    validate('selectedResourceId', selectedResourceId)
  }, [selectedResourceId, currentResource])

  const handleReplace = () => {
    if (isValid() && currentResource && selectedResourceId) {
      const newResource = availableResources.find(r => r.id === selectedResourceId)

      if (newResource) {
        // UNITS-FIX v4.0: Все units/maxUnits в формате коэффициента (1.0 = 100%)
        const currentMax = ResourceUnitsConverter.toCoefficient(currentResource.maxUnits)
        const newMax = ResourceUnitsConverter.toCoefficient(newResource.maxUnits)

        const updatedAssignments = assignments.map(assignment => {
          const currentUnits = ResourceUnitsConverter.toCoefficient(assignment.units)
          let newUnits = currentUnits

          if (keepPercentages) {
            // Масштабируем units пропорционально ёмкости нового ресурса
            const scaleFactor = newMax / currentMax
            newUnits = Math.min(currentUnits * scaleFactor, newMax)
          } else {
            // Сохраняем units, но ограничиваем максимумом нового ресурса
            newUnits = Math.min(currentUnits, newMax)
          }

          const newWork = assignment.work * (newUnits / currentUnits)
          // Стоимость пересчитывается пропорционально работе
          const newCost = assignment.cost * (newWork / assignment.work)

          return {
            ...assignment,
            units: newUnits,
            work: newWork,
            cost: newCost,
          }
        })

        onReplace?.(currentResource.id, selectedResourceId, updatedAssignments)
        onClose?.()
      }
    }
  }

  const canReplace = isValid() && currentResource && selectedResourceId
  const selectedResource = availableResources.find(r => r.id === selectedResourceId)
  const totalWork = assignments.reduce((sum, a) => sum + a.work, 0)
  const totalCost = assignments.reduce((sum, a) => sum + a.cost, 0)

  return (
    <BaseDialog
      {...dialogProps}
      title="Replace Resource Assignments"
      size="large"
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="keepPercentages"
              checked={keepPercentages}
              onChange={(e) => setKeepPercentages(e.target.checked)}
            />
            <Label htmlFor="keepPercentages">Keep assignment percentages</Label>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleReplace} disabled={!canReplace}>
              Replace
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Current Resource Info */}
        {currentResource && (
          <div className="border rounded-lg p-4 bg-red-50">
            <Label className="text-sm font-medium mb-2">Current Resource</Label>
            <div className="text-sm space-y-1">
              <div>
                <strong>Name:</strong> {currentResource.name}
              </div>
              <div>
                <strong>Type:</strong> {currentResource.type}
              </div>
              <div>
                <strong>Capacity:</strong> {ResourceUnitsConverter.toPercent(currentResource.maxUnits)}%
              </div>
              <div>
                <strong>Assignments:</strong> {currentResource.currentAssignments}
              </div>
              <div>
                <strong>Status:</strong>
                <Badge variant={currentResource.available ? 'default' : 'destructive'}>
                  {currentResource.available ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Replacement Selection */}
        <div className="space-y-3">
          <Label htmlFor="replacementResource">Select Replacement Resource *</Label>
          <Select
            value={selectedResourceId}
            onValueChange={setSelectedResourceId}
          >
            <SelectTrigger className={errors.selectedResourceId ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select a resource to replace with..." />
            </SelectTrigger>
            <SelectContent>
              {availableResources
                .filter(r => r.id !== currentResource?.id && r.available)
                .map(resource => (
                  <SelectItem key={resource.id} value={resource.id}>
                    <div>
                      <div className="font-medium">{resource.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {resource.type} • {ResourceUnitsConverter.toPercent(resource.maxUnits)}% capacity • {resource.currentAssignments} current assignments
                      </div>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors.selectedResourceId && (
            <div className="text-sm text-red-500">{errors.selectedResourceId}</div>
          )}
        </div>

        {/* Preview of Changes */}
        {selectedResource && currentResource && (
          <div className="border rounded-lg p-4 bg-primary/10">
            <Label className="text-sm font-medium mb-2">Replacement Preview</Label>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium">Old Resource</Label>
                <div className="text-sm space-y-1">
                  <div><strong>{currentResource.name}</strong></div>
                  <div>Capacity: {ResourceUnitsConverter.toPercent(currentResource.maxUnits)}%</div>
                  <div>Assignments: {assignments.length}</div>
                  <div>Total Work: {totalWork.toFixed(1)}h</div>
                  <div>Total Cost: ${totalCost.toFixed(2)}</div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">New Resource</Label>
                <div className="text-sm space-y-1">
                  <div><strong>{selectedResource.name}</strong></div>
                  <div>Capacity: {ResourceUnitsConverter.toPercent(selectedResource.maxUnits)}%</div>
                  <div>Current Assignments: {selectedResource.currentAssignments}</div>
                  <div>Capacity Change:
                    <span className={
                      ResourceUnitsConverter.isGreater(selectedResource.maxUnits, currentResource.maxUnits)
                        ? 'text-green-600'
                        : 'text-red-600'
                    }>
                      {ResourceUnitsConverter.isGreater(selectedResource.maxUnits, currentResource.maxUnits) ? '+' : ''}
                      {ResourceUnitsConverter.differencePercent(selectedResource.maxUnits, currentResource.maxUnits)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignment Options */}
            <div className="mt-4 p-3 border rounded bg-white">
              <Label className="text-sm font-medium mb-2">Assignment Options</Label>
              <div className="text-sm space-y-1">
                <div>
                  <strong>Keep Percentages:</strong> {keepPercentages ? 'Yes' : 'No'}
                </div>
                {keepPercentages ? (
                  <div>
                    Assignments will be scaled to maintain the same percentage of the new resource's capacity.
                  </div>
                ) : (
                  <div>
                    Assignments will keep the same unit values, capped at the new resource's maximum capacity.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Current Assignments Table */}
        {assignments.length > 0 && (
          <div className="space-y-3">
            <Label>Current Assignments ({assignments.length})</Label>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Current Units</TableHead>
                    <TableHead>Work (h)</TableHead>
                    <TableHead>Cost ($)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map(assignment => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.taskName}</TableCell>
                      <TableCell>{ResourceUnitsConverter.toPercent(assignment.units)}%</TableCell>
                      <TableCell>{assignment.work.toFixed(1)}</TableCell>
                      <TableCell>${assignment.cost.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Warning */}
        {selectedResource && !selectedResource.available && (
          <Alert variant="destructive">
            <AlertDescription>
              The selected replacement resource is currently unavailable. Assignments may need to be manually adjusted after replacement.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </BaseDialog>
  )
}

