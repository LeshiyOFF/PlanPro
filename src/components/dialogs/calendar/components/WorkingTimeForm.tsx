import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export interface WorkingTimeFormProps {
  workingTime: any;
  onWorkingTimeChange: (dayOfWeek: number, field: keyof any, value: any) => void;
}

export const WorkingTimeForm: React.FC<WorkingTimeFormProps> = ({ 
  workingTime, 
  onWorkingTimeChange 
}) => {
  const days = [
    { id: 1, name: 'Понедельник', short: 'Пн' },
    { id: 2, name: 'Вторник', short: 'Вт' },
    { id: 3, name: 'Среда', short: 'Ср' },
    { id: 4, name: 'Четверг', short: 'Чт' },
    { id: 5, name: 'Пятница', short: 'Пт' },
    { id: 6, name: 'Суббота', short: 'Сб' },
    { id: 0, name: 'Воскресенье', short: 'Вс' }
  ];

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">
        Рабочее время по дням недели
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div key={day.id} className="text-center text-xs font-medium">
            {day.short}
          </div>
        ))}
      </div>

      {days.map((day) => (
        <div key={day.id} className="grid grid-cols-7 gap-2">
          <div className="text-xs font-medium flex items-center">
            {day.name}
          </div>
          
          <div className="col-span-2">
            <Label htmlFor={`start-${day.id}`} className="text-xs">
              Начало
            </Label>
            <Input
              id={`start-${day.id}`}
              type="time"
              value={workingTime[`day${day.id}`]?.startTime || ''}
              onChange={(e) => onWorkingTimeChange(day.id, 'startTime', e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor={`end-${day.id}`} className="text-xs">
              Конец
            </Label>
            <Input
              id={`end-${day.id}`}
              type="time"
              value={workingTime[`day${day.id}`]?.endTime || ''}
              onChange={(e) => onWorkingTimeChange(day.id, 'endTime', e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="flex items-center">
            <Checkbox
              id={`working-${day.id}`}
              checked={workingTime[`day${day.id}`]?.isWorkingDay || false}
              onCheckedChange={(checked) => onWorkingTimeChange(day.id, 'isWorkingDay', checked)}
            />
            <Label htmlFor={`working-${day.id}`} className="text-xs ml-2">
              Рабочий
            </Label>
          </div>
        </div>
      ))}
    </div>
  );
};
