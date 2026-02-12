import React from 'react'
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDialogValidation } from '../hooks/useDialogValidation'
import { generateMappingId } from '@/utils/id-utils'

export interface ResourceMapping {
  id: string;
  sourceField: string;
  targetField: string;
  editorType: 'text' | 'number' | 'date' | 'select';
  accessLevel: 'read' | 'write' | 'admin';
}

export interface ResourceMappingDialogProps extends Omit<BaseDialogProps, 'children'> {
  mappings?: ResourceMapping[];
  availableFields?: string[];
  editorTypes?: string[];
  accessLevels?: string[];
  localProject?: boolean;
  masterProject?: boolean;
  onSave?: (mappings: ResourceMapping[]) => void;
}

const EDITOR_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'number', label: 'Number Input' },
  { value: 'date', label: 'Date Picker' },
  { value: 'select', label: 'Dropdown Select' },
]

const ACCESS_LEVELS = [
  { value: 'read', label: 'Read Only' },
  { value: 'write', label: 'Read/Write' },
  { value: 'admin', label: 'Administrator' },
]

export const ResourceMappingDialog: React.FC<ResourceMappingDialogProps> = ({
  mappings = [],
  availableFields = [],
  editorTypes: _editorTypes = EDITOR_TYPES.map(t => t.value),
  accessLevels: _accessLevels = ACCESS_LEVELS.map(l => l.value),
  localProject = false,
  masterProject = false,
  onSave,
  onClose,
  ...props
}) => {
  const [currentMappings, setCurrentMappings] = React.useState<ResourceMapping[]>(mappings)
  const [newMapping, setNewMapping] = React.useState<Partial<ResourceMapping>>({
    sourceField: '',
    targetField: '',
    editorType: 'text',
    accessLevel: 'read',
  })

  const { errors } = useDialogValidation({
    sourceField: {
      required: true,
      validate: (value) => {
        const str = typeof value === 'string' ? value : String(value ?? '')
        if (!str.trim()) return 'Source field is required'
        if (currentMappings.some(m => m.sourceField === str)) {
          return 'Source field already mapped'
        }
        return null
      },
    },
    targetField: {
      required: true,
      validate: (value) => {
        const str = typeof value === 'string' ? value : String(value ?? '')
        if (!str.trim()) return 'Target field is required'
        if (currentMappings.some(m => m.targetField === str)) {
          return 'Target field already mapped'
        }
        return null
      },
    },
  })

  const handleAddMapping = () => {
    if (newMapping.sourceField && newMapping.targetField) {
      const mapping: ResourceMapping = {
        id: generateMappingId(),
        sourceField: newMapping.sourceField!,
        targetField: newMapping.targetField!,
        editorType: (newMapping.editorType ?? 'text') as ResourceMapping['editorType'],
        accessLevel: (newMapping.accessLevel ?? 'read') as ResourceMapping['accessLevel'],
      }

      setCurrentMappings(prev => [...prev, mapping])
      setNewMapping({
        sourceField: '',
        targetField: '',
        editorType: 'text',
        accessLevel: 'read',
      })
    }
  }

  const handleRemoveMapping = (mappingId: string) => {
    setCurrentMappings(prev => prev.filter(m => m.id !== mappingId))
  }

  const handleMappingChange = (mappingId: string, field: keyof ResourceMapping, value: string | number | boolean | string[]) => {
    setCurrentMappings(prev =>
      prev.map(m => m.id === mappingId ? { ...m, [field]: value } : m),
    )
  }

  const handleSave = () => {
    onSave?.(currentMappings)
    onClose?.()
  }

  const canAddMapping = newMapping.sourceField?.trim() && newMapping.targetField?.trim() &&
    !currentMappings.some(m => m.sourceField === newMapping.sourceField) &&
    !currentMappings.some(m => m.targetField === newMapping.targetField)

  const { title: _omitTitle, ...dialogProps } = props
  return (
    <BaseDialog
      {...dialogProps}
      title="Resource Mapping Configuration"
      size="large"
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="localProject"
                checked={localProject}
                disabled
              />
              <Label htmlFor="localProject">Local Project</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="masterProject"
                checked={masterProject}
                disabled
              />
              <Label htmlFor="masterProject">Master Project</Label>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Mappings
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* New Mapping Form */}
        <div className="border rounded-lg p-4 bg-muted/30">
          <Label className="text-sm font-medium mb-3">Add New Mapping</Label>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sourceField">Source Field *</Label>
              <Select
                value={newMapping.sourceField || ''}
                onValueChange={(value) => setNewMapping(prev => ({ ...prev, sourceField: value }))}
              >
                <SelectTrigger className={errors.sourceField ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select source field..." />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map(field => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sourceField && (
                <div className="text-sm text-red-500">{errors.sourceField}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetField">Target Field *</Label>
              <Select
                value={newMapping.targetField || ''}
                onValueChange={(value) => setNewMapping(prev => ({ ...prev, targetField: value }))}
              >
                <SelectTrigger className={errors.targetField ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select target field..." />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map(field => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.targetField && (
                <div className="text-sm text-red-500">{errors.targetField}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="editorType">Editor Type</Label>
              <Select
                value={newMapping.editorType}
                onValueChange={(value) => setNewMapping(prev => ({ ...prev, editorType: value as ResourceMapping['editorType'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EDITOR_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessLevel">Access Level</Label>
              <Select
                value={newMapping.accessLevel}
                onValueChange={(value) => setNewMapping(prev => ({ ...prev, accessLevel: value as ResourceMapping['accessLevel'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCESS_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-3">
            <Button onClick={handleAddMapping} disabled={!canAddMapping}>
              Add Mapping
            </Button>
          </div>
        </div>

        {/* Current Mappings Table */}
        {currentMappings.length > 0 && (
          <div className="space-y-3">
            <Label>Current Mappings ({currentMappings.length})</Label>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source Field</TableHead>
                    <TableHead>Target Field</TableHead>
                    <TableHead>Editor Type</TableHead>
                    <TableHead>Access Level</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentMappings.map(mapping => (
                    <TableRow key={mapping.id}>
                      <TableCell className="font-medium">{mapping.sourceField}</TableCell>
                      <TableCell className="font-medium">{mapping.targetField}</TableCell>
                      <TableCell>
                        <Select
                          value={mapping.editorType}
                          onValueChange={(value) => handleMappingChange(mapping.id, 'editorType', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {EDITOR_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={mapping.accessLevel}
                          onValueChange={(value) => handleMappingChange(mapping.id, 'accessLevel', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ACCESS_LEVELS.map(level => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveMapping(mapping.id)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold">{currentMappings.length}</div>
            <div className="text-sm text-muted-foreground">Total Mappings</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {currentMappings.filter(m => m.accessLevel === 'write').length}
            </div>
            <div className="text-sm text-muted-foreground">Write Access</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {currentMappings.filter(m => m.accessLevel === 'admin').length}
            </div>
            <div className="text-sm text-muted-foreground">Admin Access</div>
          </div>
        </div>
      </div>
    </BaseDialog>
  )
}

