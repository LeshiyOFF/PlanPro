import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { Task } from '@/store/project/interfaces';
import { ProgressSection, TaskType } from './ProgressSection';

interface GeneralTabProps {
  formData: Partial<Task>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Task>>>;
  taskType: TaskType;
  onProgressChange: (value: number) => void;
  t: (key: string, options?: Record<string, string>) => string;
}

/**
 * GeneralTab - Вкладка общих свойств задачи
 * 
 * Clean Architecture: UI Component (Presentation Layer)
 * SOLID: Single Responsibility - управление общими свойствами
 * 
 * @version 1.0
 */
export const GeneralTab: React.FC<GeneralTabProps> = ({ 
  formData, setFormData, taskType, onProgressChange, t 
}) => (
  <>
    <div className="space-y-3 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
      <Label className="text-sm font-semibold text-slate-700">
        {t('task_props.name', { defaultValue: 'Название задачи' })}
      </Label>
      <Input 
        value={formData.name || ''} 
        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} 
        className="h-11 font-medium text-base" 
      />
    </div>
    
    <ProgressSection 
      taskType={taskType} 
      progress={formData.progress || 0} 
      onProgressChange={onProgressChange} 
      t={t} 
    />
    
    <div className="space-y-3 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
      <Label className="text-sm font-semibold text-slate-700 mb-2 block">
        {t('task_props.dates', { defaultValue: 'Сроки' })}
      </Label>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-500 uppercase">
            {t('task_props.start', { defaultValue: 'Начало' })}
          </Label>
          <DatePicker 
            date={formData.startDate} 
            onChange={(d) => d && setFormData(p => ({ ...p, startDate: d }))} 
            disabled={taskType === 'summary'} 
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-500 uppercase">
            {t('task_props.end', { defaultValue: 'Окончание' })}
          </Label>
          <DatePicker 
            date={formData.endDate} 
            onChange={(d) => d && setFormData(p => ({ ...p, endDate: d }))} 
            disabled={taskType === 'summary'} 
          />
        </div>
      </div>
    </div>
  </>
);
