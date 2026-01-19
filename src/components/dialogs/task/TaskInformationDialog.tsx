import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BaseDialog } from '@/components/dialogs/base/BaseDialog';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/DatePicker';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  TaskInformationData, 
  IDialogActions, 
  DialogResult 
} from '@/types/dialog/DialogTypes';

/**
 * Интерфейс для TaskInformationDialog компонента
 */
export interface TaskInformationDialogProps {
  data?: Partial<TaskInformationData>;
  isOpen: boolean;
  onClose: (result: DialogResult<TaskInformationData>) => void;
}

/**
 * Диалог для редактирования информации о задаче (стиль ProjectLibre)
 */
export const TaskInformationDialog: React.FC<TaskInformationDialogProps> = ({
  data = {},
  isOpen,
  onClose
}) => {
  const { t } = useTranslation();
  const [taskData, setTaskData] = useState<TaskInformationData>({
    id: `task_${Date.now()}`,
    title: t('dialogs.task_info.title'),
    description: t('dialogs.task_info.subtitle'),
    timestamp: new Date(),
    taskId: '',
    name: '',
    duration: 0,
    progress: 0,
    startDate: new Date(),
    endDate: new Date(),
    predecessors: [],
    successors: [],
    resources: [],
    notes: '',
    priority: 3,
    ...data
  });

  // Локальное состояние для ввода процентов, чтобы избежать проблем с фокусом и стиранием
  const [percentInput, setPercentInput] = useState(String(Math.round((data.progress || 0) * 100)));

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setTaskData(prev => ({
        ...prev,
        ...data,
        id: prev.id,
        timestamp: new Date()
      }));
      setPercentInput(String(Math.round((data.progress || 0) * 100)));
    }
  }, [data]);

  const handleChange = (field: keyof TaskInformationData, value: any) => {
    setTaskData(prev => ({ ...prev, [field]: value }));
    
    // Синхронизируем текстовое поле если меняем прогресс через слайдер
    if (field === 'progress') {
      setPercentInput(String(Math.round(value * 100)));
    }
  };

  const handlePercentInputChange = (val: string) => {
    setPercentInput(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const limited = Math.max(0, Math.min(100, num));
      setTaskData(prev => ({ ...prev, progress: limited / 100 }));
    }
  };

  const actions: IDialogActions = {
    onOk: async (data: TaskInformationData) => {
      return taskData;
    },
    onCancel: () => {
      onClose({ success: false, action: 'cancel' });
    }
  };

  return (
    <BaseDialog<TaskInformationData>
      data={taskData}
      actions={actions}
      isOpen={isOpen}
      onClose={(res) => onClose({ ...res, data: taskData })}
      config={{
        width: 500,
        height: 550,
        modal: true,
        showHelp: false
      }}
    >
      <div className="space-y-6 p-6">
        {/* Основные поля */}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="task-name">{t('dialogs.task_info.name_label')}</Label>
            <Input 
              id="task-name" 
              value={taskData.name} 
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder={t('dialogs.task_info.name_placeholder')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="task-start">{t('dialogs.task_info.start_label')}</Label>
              <DatePicker 
                date={taskData.startDate} 
                onChange={(date) => date && handleChange('startDate', date)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-end">{t('dialogs.task_info.end_label')}</Label>
              <DatePicker 
                date={taskData.endDate} 
                onChange={(date) => date && handleChange('endDate', date)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="task-predecessors">{t('dialogs.task_info.predecessors_label')}</Label>
            <Input 
              id="task-predecessors" 
              value={Array.isArray(taskData.predecessors) ? taskData.predecessors.join(', ') : ''} 
              onChange={(e) => handleChange('predecessors', e.target.value.split(',').map(s => s.trim()).filter(s => s !== ''))}
              placeholder={t('dialogs.task_info.predecessors_placeholder')}
            />
          </div>

          {/* Отслеживание прогресса */}
          <div className="space-y-4 pt-2 pb-2 border-y border-border/10">
            <div className="flex justify-between items-center">
              <Label className="text-slate-800 font-semibold">{t('dialogs.task_info.progress_label')}</Label>
              <div className="flex items-center gap-2">
                <Input 
                  className="w-16 h-8 text-center" 
                  type="text" // Используем text для более стабильного ввода
                  value={percentInput}
                  onChange={(e) => handlePercentInputChange(e.target.value)}
                />
                <span className="text-sm font-medium">%</span>
              </div>
            </div>
            <Slider 
              value={[taskData.progress * 100]} 
              max={100} 
              step={1} 
              onValueChange={(val) => handleChange('progress', val[0] / 100)}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="task-notes">{t('dialogs.task_info.notes_label')}</Label>
            <Input 
              id="task-notes" 
              value={taskData.notes} 
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder={t('dialogs.task_info.notes_placeholder')}
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="task-estimated" 
              checked={!!taskData.estimated} 
              onCheckedChange={(checked) => handleChange('estimated', !!checked)}
            />
            <Label htmlFor="task-estimated" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t('dialogs.task_info.estimated_label') || 'Оценочный срок'}
            </Label>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
};

export default TaskInformationDialog;
