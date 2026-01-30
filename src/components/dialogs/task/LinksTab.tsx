import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/Input';

interface LinksTabProps {
  predecessorsInput: string;
  setPredecessorsInput: (value: string) => void;
  successors: string[];
  t: (key: string, options?: Record<string, string>) => string;
}

/**
 * LinksTab - Вкладка связей задачи
 * 
 * Clean Architecture: UI Component (Presentation Layer)
 * SOLID: Single Responsibility - управление связями (predecessors/successors)
 * 
 * @version 1.0
 */
export const LinksTab: React.FC<LinksTabProps> = ({ 
  predecessorsInput, setPredecessorsInput, successors, t 
}) => (
  <>
    <div className="space-y-3 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
      <Label className="text-sm font-semibold text-slate-700">
        {t('task_props.predecessors', { defaultValue: 'Предшественники' })}
      </Label>
      <Input 
        value={predecessorsInput} 
        onChange={(e) => setPredecessorsInput(e.target.value)} 
        placeholder="TASK-1, TASK-2" 
        className="h-11 font-mono" 
      />
      <p className="text-xs text-slate-500">
        {t('task_props.predecessors_hint', { defaultValue: 'ID задач через запятую' })}
      </p>
    </div>
    
    <div className="space-y-3 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
      <Label className="text-sm font-semibold text-slate-700">
        {t('task_props.successors', { defaultValue: 'Последователи' })}
      </Label>
      <div className="p-4 bg-slate-50 rounded-lg border min-h-[56px] flex items-center">
        {successors.length > 0 ? (
          <p className="font-mono text-slate-700">{successors.join(', ')}</p>
        ) : (
          <p className="text-slate-400 italic">
            {t('task_props.no_successors', { defaultValue: 'Нет зависимых задач' })}
          </p>
        )}
      </div>
      <p className="text-xs text-slate-500">
        {t('task_props.successors_hint', { defaultValue: 'Задачи, зависящие от текущей' })}
      </p>
    </div>
  </>
);
