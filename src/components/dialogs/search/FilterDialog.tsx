import React from 'react';
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface FilterField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  options?: string[];
  operator?: 'equals' | 'not-equals' | 'greater' | 'less' | 'contains' | 'starts-with' | 'ends-with';
}

export interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: any;
  enabled: boolean;
}

export interface SavedFilter {
  id: string;
  name: string;
  description: string;
  conditions: FilterCondition[];
  shared: boolean;
}

export interface FilterDialogProps extends Omit<BaseDialogProps, 'children'> {
  availableFields?: FilterField[];
  currentFilters?: FilterCondition[];
  savedFilters?: SavedFilter[];
  onSave?: (filters: FilterCondition[]) => void;
  onLoadFilter?: (filterId: string) => void;
  onSaveAsNew?: (name: string, description: string, filters: FilterCondition[]) => void;
}

const TEXT_OPERATORS = [
  { value: 'contains', label: 'Contains' },
  { value: 'starts-with', label: 'Starts with' },
  { value: 'ends-with', label: 'Ends with' },
  { value: 'equals', label: 'Equals' },
  { value: 'not-equals', label: 'Not equals' }
];

const NUMBER_OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not-equals', label: 'Not equals' },
  { value: 'greater', label: 'Greater than' },
  { value: 'less', label: 'Less than' },
  { value: 'greater-equal', label: 'Greater or equal' },
  { value: 'less-equal', label: 'Less or equal' }
];

const DATE_OPERATORS = [
  { value: 'equals', label: 'On' },
  { value: 'greater', label: 'After' },
  { value: 'less', label: 'Before' },
  { value: 'greater-equal', label: 'On or after' },
  { value: 'less-equal', label: 'On or before' }
];

const BOOLEAN_OPERATORS = [
  { value: 'equals', label: 'Is' },
  { value: 'not-equals', label: 'Is not' }
];

export const FilterDialog: React.FC<FilterDialogProps> = ({
  availableFields = [],
  currentFilters = [],
  savedFilters = [],
  onSave,
  onLoadFilter,
  onSaveAsNew,
  onClose,
  ...props
}) => {
  const [activeTab, setActiveTab] = React.useState('create');
  const [filters, setFilters] = React.useState<FilterCondition[]>(currentFilters);
  const [saveFilterName, setSaveFilterName] = React.useState('');
  const [saveFilterDescription, setSaveFilterDescription] = React.useState('');

  const addFilter = () => {
    const newFilter: FilterCondition = {
      id: `filter-${Date.now()}`,
      field: availableFields[0]?.id || '',
      operator: 'equals',
      value: '',
      enabled: true
    };
    setFilters(prev => [...prev, newFilter]);
  };

  const updateFilter = (filterId: string, updates: Partial<FilterCondition>) => {
    setFilters(prev => 
      prev.map(filter => 
        filter.id === filterId ? { ...filter, ...updates } : filter
      )
    );
  };

  const removeFilter = (filterId: string) => {
    setFilters(prev => prev.filter(filter => filter.id !== filterId));
  };

  const toggleFilter = (filterId: string) => {
    setFilters(prev => 
      prev.map(filter => 
        filter.id === filterId ? { ...filter, enabled: !filter.enabled } : filter
      )
    );
  };

  const getOperatorsForField = (field: FilterField) => {
    switch (field.type) {
      case 'text': return TEXT_OPERATORS;
      case 'number': return NUMBER_OPERATORS;
      case 'date': return DATE_OPERATORS;
      case 'boolean': return BOOLEAN_OPERATORS;
      default: return TEXT_OPERATORS;
    }
  };

  const renderValueInput = (filter: FilterCondition) => {
    const field = availableFields.find(f => f.id === filter.field);
    if (!field) return null;

    switch (field.type) {
      case 'select':
        return (
          <Select
            value={filter.value}
            onValueChange={(value) => updateFilter(filter.id, { value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'boolean':
        return (
          <Select
            value={String(filter.value)}
            onValueChange={(value) => updateFilter(filter.id, { value: value === 'true' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'number':
        return (
          <Input
            type="number"
            value={filter.value}
            onChange={(e) => updateFilter(filter.id, { value: parseFloat(e.target.value) || 0 })}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={filter.value}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
          />
        );
      default:
        return (
          <Input
            value={filter.value}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
          />
        );
    }
  };

  const handleSave = () => {
    const activeFilters = filters.filter(f => f.enabled);
    onSave?.(activeFilters);
    onClose?.();
  };

  const handleLoadFilter = (filterId: string) => {
    const filter = savedFilters.find(f => f.id === filterId);
    if (filter) {
      setFilters(filter.conditions);
      onLoadFilter?.(filterId);
    }
  };

  const handleSaveAsNew = () => {
    if (saveFilterName.trim()) {
      const activeFilters = filters.filter(f => f.enabled);
      onSaveAsNew?.(saveFilterName.trim(), saveFilterDescription.trim(), activeFilters);
      setSaveFilterName('');
      setSaveFilterDescription('');
      setActiveTab('saved');
    }
  };

  const activeFiltersCount = filters.filter(f => f.enabled).length;

  return (
    <BaseDialog
      title="Filter Data"
      size="large"
      {...props}
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {activeFiltersCount} active filter(s)
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={activeFiltersCount === 0}>
              Apply Filters
            </Button>
          </div>
        </div>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Filter</TabsTrigger>
          <TabsTrigger value="saved">Saved Filters</TabsTrigger>
          <TabsTrigger value="save">Save Filter</TabsTrigger>
        </TabsList>

        {/* Create Filter Tab */}
        <TabsContent value="create" className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Filter Conditions</Label>
            <Button onClick={addFilter}>
              Add Condition
            </Button>
          </div>

          {filters.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-muted/30">
              <div className="text-lg font-medium text-muted-foreground mb-2">
                No filter conditions
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                Add conditions to filter your data
              </div>
              <Button onClick={addFilter}>
                Add First Condition
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filters.map((filter, index) => {
                const field = availableFields.find(f => f.id === filter.field);
                const operators = field ? getOperatorsForField(field) : [];

                return (
                  <div key={filter.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={filter.enabled}
                          onCheckedChange={() => toggleFilter(filter.id)}
                        />
                        <Label className="text-sm font-medium">
                          Condition {index + 1}
                        </Label>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFilter(filter.id)}
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs">Field</Label>
                        <Select
                          value={filter.field}
                          onValueChange={(value) => updateFilter(filter.id, { field: value })}
                          disabled={!filter.enabled}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableFields.map(field => (
                              <SelectItem key={field.id} value={field.id}>
                                {field.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs">Operator</Label>
                        <Select
                          value={filter.operator}
                          onValueChange={(value) => updateFilter(filter.id, { operator: value })}
                          disabled={!filter.enabled}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map(operator => (
                              <SelectItem key={operator.value} value={operator.value}>
                                {operator.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-2">
                        <Label className="text-xs">Value</Label>
                        {renderValueInput(filter)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Saved Filters Tab */}
        <TabsContent value="saved" className="space-y-4">
          <Label>Saved Filters</Label>
          {savedFilters.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-muted/30">
              <div className="text-lg font-medium text-muted-foreground mb-2">
                No saved filters
              </div>
              <div className="text-sm text-muted-foreground">
                Save your frequently used filter combinations
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {savedFilters.map(filter => (
                <div key={filter.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">{filter.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {filter.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {filter.conditions.filter(c => c.enabled).length} condition(s) • 
                        {filter.shared ? ' Shared' : ' Private'}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLoadFilter(filter.id)}
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setFilters(filter.conditions)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Save Filter Tab */}
        <TabsContent value="save" className="space-y-4">
          <Label>Save Current Filter</Label>
          <div className="space-y-3">
            <div>
              <Label htmlFor="filterName">Filter Name *</Label>
              <Input
                id="filterName"
                value={saveFilterName}
                onChange={(e) => setSaveFilterName(e.target.value)}
                placeholder="Enter filter name..."
              />
            </div>

            <div>
              <Label htmlFor="filterDescription">Description</Label>
              <Input
                id="filterDescription"
                value={saveFilterDescription}
                onChange={(e) => setSaveFilterDescription(e.target.value)}
                placeholder="Optional description..."
              />
            </div>

            <div className="text-center pt-4">
              <Button 
                onClick={handleSaveAsNew} 
                disabled={!saveFilterName.trim() || activeFiltersCount === 0}
              >
                Save Filter
              </Button>
              {activeFiltersCount === 0 && (
                <div className="text-sm text-muted-foreground mt-2">
                  Add at least one active filter condition to save
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </BaseDialog>
  );
};

