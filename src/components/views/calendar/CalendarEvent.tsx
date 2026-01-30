import React from 'react';
import { ICalendarEvent } from '@/domain/calendar/interfaces/ICalendarEvent';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { toPercent } from '@/utils/ProgressFormatter';

interface CalendarEventProps {
  event: ICalendarEvent;
  onClick?: (event: ICalendarEvent) => void;
  onContextMenu?: (e: React.MouseEvent, event: ICalendarEvent) => void;
  onDragStart?: (e: React.DragEvent, event: ICalendarEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

/**
 * Компонент события в календаре.
 * 
 * <p><b>Отображение:</b></p>
 * <ul>
 *   <li>Вехи: ромб ◆, тёмный фон, статус "Выполнена"/"Не выполнена"</li>
 *   <li>Обычные задачи: светлый фон, прогресс-бар снизу, процент в tooltip</li>
 * </ul>
 */
export const CalendarEvent: React.FC<CalendarEventProps> = ({ 
  event, 
  onClick,
  onContextMenu,
  onDragStart,
  onDragEnd
}) => {
  const { t } = useTranslation();
  const isMilestone = event.isMilestone;
  
  const getTooltip = (): string => {
    if (isMilestone) {
      const statusKey = event.progress >= 0.5 ? 'milestone_completed' : 'milestone_pending';
      const status = t(`sheets.${statusKey}`, { 
        defaultValue: event.progress >= 0.5 ? 'Completed' : 'Pending' 
      });
      return `${event.title} (${t('calendar.milestone', { defaultValue: 'Веха' })}: ${status})`;
    }
    return `${event.title} (${toPercent(event.progress)}%)`;
  };
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, event)}
      onDragEnd={onDragEnd}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(event);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu?.(e, event);
      }}
      className={cn(
        "group relative flex items-center h-5 px-1.5 mb-1 text-[10px] rounded cursor-pointer transition-all truncate select-none hover:shadow-sm active:scale-[0.98]",
        event.isCritical ? "border-l-2 border-red-500" : "border-l-2 border-primary",
        isMilestone ? "bg-slate-800 text-white" : "bg-primary/10 text-slate-900 hover:bg-slate-100"
      )}
      title={getTooltip()}
    >
      {isMilestone && <span className="mr-1">◆</span>}
      <span className="truncate flex-1">{event.title}</span>
      
      {/* Прогресс-бар снизу события (только для обычных задач) */}
      {!isMilestone && (
        <div className="absolute bottom-0 left-0 h-[2px] bg-slate-300 opacity-50" style={{ width: '100%' }}>
          <div className="h-full bg-primary" style={{ width: `${toPercent(event.progress)}%` }} />
        </div>
      )}
    </div>
  );
};


