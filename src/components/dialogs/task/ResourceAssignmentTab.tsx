import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/checkbox';
import { Resource } from '@/types/resource-types';
import { ResourceAssignment } from '@/store/project/interfaces';

interface ResourceAssignmentTabProps {
  resources: Resource[];
  assignments: ResourceAssignment[];
  onAssignmentsChange: (assignments: ResourceAssignment[]) => void;
  t: (key: string, options?: Record<string, string>) => string;
}

/**
 * ResourceAssignmentTab - Вкладка назначения ресурсов на задачу
 * 
 * КРИТИЧНО: Использует resourceAssignments с units вместо устаревшего resourceIds.
 * Это исправляет баг с нулевыми трудозатратами в отчётах.
 * 
 * Clean Architecture: UI Component (Presentation Layer)
 * SOLID: Single Responsibility - управление назначениями ресурсов
 * 
 * @version 2.0 - Переход на resourceAssignments с units
 */
export const ResourceAssignmentTab: React.FC<ResourceAssignmentTabProps> = ({
  resources, assignments, onAssignmentsChange, t
}) => {
  const isResourceAssigned = (resourceId: string): boolean => {
    return assignments.some(a => a.resourceId === resourceId);
  };

  const getResourceUnits = (resourceId: string): number => {
    const assignment = assignments.find(a => a.resourceId === resourceId);
    return assignment?.units ?? 1.0;
  };

  const toggleResource = (resourceId: string) => {
    if (isResourceAssigned(resourceId)) {
      onAssignmentsChange(assignments.filter(a => a.resourceId !== resourceId));
    } else {
      onAssignmentsChange([...assignments, { resourceId, units: 1.0 }]);
    }
  };

  const updateUnits = (resourceId: string, units: number) => {
    const normalizedUnits = Math.max(0.01, Math.min(10, units));
    onAssignmentsChange(
      assignments.map(a => a.resourceId === resourceId ? { ...a, units: normalizedUnits } : a)
    );
  };

  return (
    <div className="space-y-4 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
      <Label className="text-sm font-semibold text-slate-700 tracking-wide block">
        {t('task_props.assign_resources', { defaultValue: 'Назначенные ресурсы' })}
      </Label>
      <p className="text-xs text-slate-500 mb-2">
        {t('task_props.units_hint', { defaultValue: 'Укажите % загрузки для каждого ресурса (100% = 1.0)' })}
      </p>
      <div className="border border-slate-200 rounded-xl p-4 max-h-[380px] overflow-y-auto space-y-2 bg-slate-50">
        {resources.length === 0 ? (
          <p className="text-center text-muted-foreground py-12 text-sm">
            {t('task_props.no_resources', { defaultValue: 'Список ресурсов пуст' })}
          </p>
        ) : (
          resources.map(res => (
            <ResourceRow
              key={res.id}
              resource={res}
              isAssigned={isResourceAssigned(res.id)}
              units={getResourceUnits(res.id)}
              onToggle={() => toggleResource(res.id)}
              onUnitsChange={(units) => updateUnits(res.id, units)}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface ResourceRowProps {
  resource: Resource;
  isAssigned: boolean;
  units: number;
  onToggle: () => void;
  onUnitsChange: (units: number) => void;
}

const ResourceRow: React.FC<ResourceRowProps> = ({
  resource, isAssigned, units, onToggle, onUnitsChange
}) => (
  <div className="flex items-center gap-3 p-3 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200">
    <Checkbox 
      id={`res-${resource.id}`} 
      checked={isAssigned}
      onCheckedChange={onToggle}
    />
    <label 
      htmlFor={`res-${resource.id}`} 
      className="text-base font-medium leading-none cursor-pointer flex-1"
      onClick={onToggle}
    >
      {resource.name}
      <span className="text-sm text-slate-500 ml-2">({resource.type})</span>
      {resource.standardRate > 0 && (
        <span className="text-xs text-green-600 ml-2">₽{resource.standardRate}/ч</span>
      )}
    </label>
    {isAssigned && (
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min="0.01"
          max="10"
          step="0.1"
          value={units}
          onChange={(e) => onUnitsChange(parseFloat(e.target.value) || 1.0)}
          className="w-16 h-8 text-center text-sm"
        />
        <span className="text-xs text-slate-500 w-6">{Math.round(units * 100)}%</span>
      </div>
    )}
  </div>
);
