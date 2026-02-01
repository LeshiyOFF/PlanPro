import React, { useState, useCallback, useEffect } from 'react';
import { BaseDialog } from '@/components/dialogs/base/BaseDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { logger } from '@/utils/logger';
import { useTranslation } from 'react-i18next';
import { 
  TypedDialogActions,
  DialogResult,
  IDialogData
} from '@/types/dialog/DialogTypes';
import { CalendarException } from '@/types/calendar-types';
import { TypedWorkingTimeDialog as WorkingTimeForm } from './components/WorkingTimeForm';
import { CalendarExceptions } from './components/CalendarExceptions';

/**
 * Типизированные данные для диалога рабочего времени
 */
export interface ChangeWorkingTimeDialogData extends IDialogData {
  workingTime: Record<string, { startTime: string; endTime: string; isWorkingDay: boolean }>;
  exceptions?: CalendarException[];
}

/**
 * Типизированный результат
 */
export type WorkingTimeResult = DialogResult<{
  success: boolean;
  message?: string;
}>;

/**
 * Типизированные действия
 */
interface WorkingTimeActions extends TypedDialogActions<ChangeWorkingTimeDialogData, WorkingTimeResult> {
  onOk: () => Promise<void>;
}

/**
 * Компонент диалога для изменения рабочего времени
 * Соответствует SOLID и Clean Architecture.
 */
export const ChangeWorkingTimeDialog: React.FC<{
  isOpen: boolean;
  data?: ChangeWorkingTimeDialogData;
  onClose: () => void;
}> = ({ 
  isOpen, 
  data, 
  onClose 
}) => {
  const { t } = useTranslation();
  const [exceptions, setExceptions] = useState<CalendarException[]>([]);
  const [activeTab, setActiveTab] = useState('working-time');
  const [workingTime, setWorkingTime] = useState<Record<string, { startTime: string; endTime: string; isWorkingDay: boolean }>>({});

  useEffect(() => {
    if (!isOpen || !data) return;
    
    const saved = localStorage.getItem('calendar-working-time');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.workingTime) {
          setWorkingTime(parsed.workingTime);
          setExceptions(parsed.exceptions || []);
        }
      } catch (error) {
        logger.error('Failed to load working time settings', error instanceof Error ? error : new Error(String(error)));
      }
    } else if (data.workingTime) {
      setWorkingTime(data.workingTime);
      setExceptions(data.exceptions || []);
    }
  }, [isOpen, data]);

  const calculateTotalHours = useCallback((): number => {
    return Object.values(workingTime).reduce((total, day) => {
      if (!day.isWorkingDay || !day.startTime || !day.endTime) return total;
      const start = new Date(`2000-01-01T${day.startTime}`);
      const end = new Date(`2000-01-01T${day.endTime}`);
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);
  }, [workingTime]);

  const actions: WorkingTimeActions = {
    onOk: async (_data?: ChangeWorkingTimeDialogData): Promise<void> => {
      try {
        const calendarData = { workingTime, exceptions, lastUpdated: new Date().toISOString() };
        localStorage.setItem('calendar-working-time', JSON.stringify(calendarData));
        logger.info('Working time saved successfully');
      } catch (error) {
        logger.error('Failed to save working time', error instanceof Error ? error : new Error(String(error)));
      }
    },
    onCancel: () => {
      logger.info('Working time dialog cancelled');
      onClose();
    },
    onValidate: (_data: ChangeWorkingTimeDialogData): boolean => {
      return true;
    }
  };

  return (
    <BaseDialog 
      isOpen={isOpen} 
      onClose={onClose} 
      data={{
        id: 'change-working-time',
        title: t('working_time.title'),
        timestamp: new Date(),
        workingTime,
        exceptions
      }}
      config={{
        width: 800,
        modal: true
      }}
      actions={actions}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-50 border-b p-2">
          <TabsTrigger value="working-time">{t('working_time.tab_work_time')}</TabsTrigger>
          <TabsTrigger value="exceptions">
            <Badge variant="destructive" className="ml-2">{t('working_time.tab_exceptions')} {exceptions.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="summary">{t('working_time.tab_summary')}</TabsTrigger>
        </TabsList>
        <TabsContent value="working-time" className="space-y-4">
          <WorkingTimeForm 
            isOpen={isOpen} 
            data={{
              id: 'working-time-form',
              title: '',
              timestamp: new Date(),
              workingTime
            }} 
            onClose={() => {}} 
          />
        </TabsContent>
        <TabsContent value="exceptions" className="space-y-4">
          <CalendarExceptions exceptions={exceptions} onExceptionsChange={setExceptions} />
        </TabsContent>
        <TabsContent value="summary" className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">{t('working_time.stats_description')}</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">{t('working_time.stats.working_days')}</div>
                <div className="text-2xl font-bold">{calculateTotalHours()}</div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </BaseDialog>
  );
};
