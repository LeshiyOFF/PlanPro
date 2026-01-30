import React from 'react';
import { IWorkCalendar } from '@/domain/calendar/interfaces/IWorkCalendar';
import { Clock } from 'lucide-react';
import { CalendarTemplateService } from '@/domain/calendar/services/CalendarTemplateService';

interface CalendarPreviewProps {
  calendar: IWorkCalendar;
  compact?: boolean;
}

/**
 * Компонент визуального превью календаря
 * Показывает сетку рабочих/выходных дней и рабочее время
 * Stage 8.15: Визуализация календаря для tooltip и списков
 */
export const CalendarPreview: React.FC<CalendarPreviewProps> = ({ 
  calendar, 
  compact = false 
}) => {
  const templateService = CalendarTemplateService.getInstance();
  const dayNames = compact 
    ? ['В', 'П', 'В', 'С', 'Ч', 'П', 'С']
    : ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  const workingDaysCount = calendar.workingDays.filter(wd => wd.isWorking).length;
  const firstWorkingDay = calendar.workingDays.find(wd => wd.isWorking);
  const dynamicShortDesc = templateService.generateShortDescription(calendar);

  return (
    <div className="space-y-3">
      {/* Основная информация */}
      <div className="space-y-1">
        <h4 className="font-semibold text-sm">{calendar.name}</h4>
        <p className="text-xs text-muted-foreground">
          {calendar.description || dynamicShortDesc}
        </p>
      </div>

      {/* Сетка дней недели */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Рабочая неделя:</p>
        <div className="flex gap-1.5">
          {calendar.workingDays
            .sort((a, b) => {
              const orderA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
              const orderB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
              return orderA - orderB;
            })
            .map((wd) => (
              <div
                key={wd.dayOfWeek}
                className={`
                  flex flex-col items-center justify-center
                  ${compact ? 'w-7 h-7' : 'w-10 h-10'}
                  rounded text-xs font-bold
                  ${wd.isWorking
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-slate-200 text-slate-400'
                  }
                `}
                title={`${dayNames[wd.dayOfWeek]}: ${wd.isWorking ? 'Рабочий' : 'Выходной'}`}
              >
                {dayNames[wd.dayOfWeek]}
              </div>
            ))}
        </div>
      </div>

      {/* Детали */}
      {!compact && (
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>
              Рабочих дней: <span className="font-semibold text-foreground">{workingDaysCount}</span> из 7
            </span>
          </div>
          {firstWorkingDay?.workingHours && (
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>
                Время работы: <span className="font-semibold text-foreground">
                  {firstWorkingDay.workingHours.start} - {firstWorkingDay.workingHours.end}
                </span>
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>
              Часов в дне: <span className="font-semibold text-foreground">{calendar.hoursPerDay}ч</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
