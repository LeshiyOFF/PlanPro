import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BaseDialog } from '@/components/dialogs/base/BaseDialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/DatePicker';
import { 
  SplitTaskData, 
  IDialogActions, 
  DialogResult 
} from '@/types/dialog/DialogTypes';

export interface SplitTaskDialogProps {
  isOpen: boolean;
  onClose: (result: DialogResult<SplitTaskData>) => void;
  data: {
    taskId: string;
    taskName: string;
    startDate: Date;
    endDate: Date;
  };
}

/**
 * SplitTaskDialog - Диалог для настройки прерывания задачи.
 */
export const SplitTaskDialog: React.FC<SplitTaskDialogProps> = ({
  isOpen,
  onClose,
  data
}) => {
  const { t } = useTranslation();
  const [splitData, setSplitData] = useState<SplitTaskData>({
    id: `split_${Date.now()}`,
    title: t('dialogs.split_task.title') || 'Прерывание задачи',
    taskId: data.taskId,
    taskName: data.taskName,
    splitDate: new Date(data.startDate.getTime() + (data.endDate.getTime() - data.startDate.getTime()) / 2),
    gapDays: 1,
    timestamp: new Date()
  });

  const actions: IDialogActions = {
    onOk: async () => splitData,
    onCancel: () => onClose({ success: false, action: 'cancel' })
  };

  return (
    <BaseDialog<SplitTaskData>
      data={splitData}
      actions={actions}
      isOpen={isOpen}
      onClose={(res) => onClose({ ...res, data: splitData })}
      config={{ width: 400, height: 350, modal: true }}
    >
      <div className="space-y-4 p-6">
        <div className="grid gap-2">
          <Label>{t('dialogs.split_task.task_name') || 'Задача'}: {data.taskName}</Label>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="split-date">{t('dialogs.split_task.split_date') || 'Дата прерывания'}</Label>
          <DatePicker 
            date={splitData.splitDate} 
            onChange={(date) => date && setSplitData(prev => ({ ...prev, splitDate: date }))}
          />
          <p className="text-[10px] text-slate-500">
            {t('dialogs.split_task.split_hint') || 'Выберите дату внутри интервала задачи'}
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="gap-days">{t('dialogs.split_task.gap_duration') || 'Длительность паузы (дни)'}</Label>
          <Input 
            id="gap-days"
            type="number"
            min={1}
            value={splitData.gapDays}
            onChange={(e) => setSplitData(prev => ({ ...prev, gapDays: parseInt(e.target.value) || 1 }))}
          />
        </div>
      </div>
    </BaseDialog>
  );
};
