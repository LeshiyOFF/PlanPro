import React, { useState, useEffect } from 'react';
import { BaseDialog } from '@/components/dialogs/base/BaseDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { logger } from '@/utils/logger';
import { 
  CalendarDialogData, 
  IDialogActions,
  DialogResult 
} from '@/types/dialog/DialogTypes';

// Импорт модульных компонентов
import { WorkingTimeForm } from './components/WorkingTimeForm';
import { CalendarExceptions } from './components/CalendarExceptions';

/**
 * Интерфейс для исключений календаря
 */
interface CalendarException {
  id: string;
  name: string;
  date: string;
  type: 'holiday' | 'working';
  startTime?: string;
  endTime?: string;
}

/**
 * Начальное состояние рабочего времени
 */
const getInitialWorkingTime = () => ({
  day0: { startTime: '', endTime: '', isWorkingDay: false }, // Воскресенье
  day1: { startTime: '09:00', endTime: '18:00', isWorkingDay: true }, // Понедельник
  day2: { startTime: '09:00', endTime: '18:00', isWorkingDay: true }, // Вторник
  day3: { startTime: '09:00', endTime: '18:00', isWorkingDay: true }, // Среда
  day4: { startTime: '09:00', endTime: '18:00', isWorkingDay: true }, // Четверг
  day5: { startTime: '09:00', endTime: '18:00', isWorkingDay: true }, // Пятница
  day6: { startTime: '', endTime: '', isWorkingDay: false }  // Суббота
});

/**
 * Обработчик изменения рабочего времени
 */
const handleWorkingTimeChange = (
  workingTime: any,
  setWorkingTime: React.Dispatch<React.SetStateAction<any>>,
  dayOfWeek: number,
  field: string,
  value: any
) => {
  setWorkingTime(prev => ({
    ...prev,
    [`day${dayOfWeek}`]: {
      ...prev[`day${dayOfWeek}`],
      [field]: value
    }
  }));
};

/**
 * Создание Actions для диалога календаря
 */
const createCalendarActions = (
  workingTime: any,
  exceptions: CalendarException[]
): IDialogActions => {
  return {
    onOk: async (data: CalendarDialogData) => {
      logger.info('Saving calendar data:', { workingTime, exceptions });
      
      try {
        // Сохранение в localStorage
        const calendarData = {
          workingTime,
          exceptions,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('calendar-settings', JSON.stringify(calendarData));
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        return data;
      } catch (error) {
        logger.error('Failed to save calendar data:', error);
        throw new Error('Не удалось сохранить настройки календаря');
      }
    },
    
    onCancel: () => {
      logger.info('Working time dialog cancelled');
    },
    
    onHelp: () => {
      logger.info('Opening working time help...');
      window.open('/help/calendar', '_blank');
    }
  };
};

/**
 * Загрузка настроек календаря
 */
const loadCalendarData = (): { workingTime: any; exceptions: CalendarException[] } => {
  try {
    const saved = localStorage.getItem('calendar-settings');
    if (saved) {
      const data = JSON.parse(saved);
      return {
        workingTime: data.workingTime || getInitialWorkingTime(),
        exceptions: data.exceptions || []
      };
    }
  } catch (error) {
    logger.error('Failed to load calendar data:', error);
  }
  
  return {
    workingTime: getInitialWorkingTime(),
    exceptions: []
  };
};

/**
 * Диалог изменения рабочего времени
 * Реализует SOLID принцип Single Responsibility
 */
export const ChangeWorkingTimeDialog: React.FC<CalendarDialogData> = (data) => {
  const [workingTime, setWorkingTime] = useState(getInitialWorkingTime());
  const [exceptions, setExceptions] = useState<CalendarException[]>([]);
  const [activeTab, setActiveTab] = useState('working-time');

  useEffect(() => {
    // Загрузка настроек при монтировании
    const loadedData = loadCalendarData();
    setWorkingTime(loadedData.workingTime);
    setExceptions(loadedData.exceptions);
  }, []);

  const onWorkingTimeChange = (dayOfWeek: number, field: string, value: any) => {
    handleWorkingTimeChange(workingTime, setWorkingTime, dayOfWeek, field, value);
  };

  const onExceptionsChange = (newExceptions: CalendarException[]) => {
    setExceptions(newExceptions);
  };

  const actions = createCalendarActions(workingTime, exceptions);

  // Статистика
  const workingDaysCount = Object.values(workingTime).filter((day: any) => day.isWorkingDay).length;
  const totalHours = Object.values(workingTime).reduce((total: number, day: any) => {
    if (!day.isWorkingDay || !day.startTime || !day.endTime) return total;
    
    const start = new Date(`2000-01-01T${day.startTime}`);
    const end = new Date(`2000-01-01T${day.endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return total + hours;
  }, 0);

  return (
    <BaseDialog
      data={{
        ...data,
        workingTime,
        exceptions,
        actions
      }}
      config={{
        width: 800,
        height: 600,
        modal: true
      }}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="working-time">Рабочее время</TabsTrigger>
          <TabsTrigger value="exceptions">Исключения</TabsTrigger>
          <TabsTrigger value="summary">Сводка</TabsTrigger>
        </TabsList>

        <TabsContent value="working-time" className="space-y-4">
          <WorkingTimeForm
            workingTime={workingTime}
            onWorkingTimeChange={onWorkingTimeChange}
          />
        </TabsContent>

        <TabsContent value="exceptions" className="space-y-4">
          <CalendarExceptions
            exceptions={exceptions}
            onExceptionsChange={onExceptionsChange}
          />
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Рабочих дней в неделю
              </div>
              <div className="text-2xl font-bold">
                {workingDaysCount}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Всего часов в неделю
              </div>
              <div className="text-2xl font-bold">
                {Math.round(totalHours)}
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              График работы
            </div>
            <div className="grid grid-cols-7 gap-2 text-xs">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => {
                const dayData = workingTime[`day${index === 6 ? 0 : index + 1}`];
                return (
                  <div key={day} className="text-center">
                    <div className="font-medium">{day}</div>
                    <div className={`p-2 rounded text-xs ${
                      dayData?.isWorkingDay 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {dayData?.isWorkingDay ? (
                        `${dayData.startTime}-${dayData.endTime}`
                      ) : (
                        'Выходной'
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {exceptions.length > 0 && (
            <div className="border rounded-lg p-4">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Исключения ({exceptions.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {exceptions.map((exception) => (
                  <Badge 
                    key={exception.id} 
                    variant={exception.type === 'holiday' ? 'destructive' : 'default'}
                  >
                    {exception.name || exception.date}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="outline" onClick={() => actions.onCancel()}>
          Отмена
        </Button>
        <Button onClick={async () => {
          try {
            await actions.onOk({ workingTime, exceptions });
          } catch (error) {
            logger.error('Failed to save calendar settings:', error);
          }
        }}
      >
          Сохранить
        </Button>
      </div>
    </BaseDialog>
  );
};

