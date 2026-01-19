import React from 'react';
import { ICalendarEvent } from '@/domain/calendar/interfaces/ICalendarEvent';
import { cn } from '@/lib/utils';

interface CalendarEventProps {
  event: ICalendarEvent;
  onClick?: (event: ICalendarEvent) => void;
  onDragStart?: (e: React.DragEvent, event: ICalendarEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

/**
 * Компонент события в календаре
 */
export const CalendarEvent: React.FC<CalendarEventProps> = ({ 
  event, 
  onClick,
  onDragStart,
  onDragEnd
}) => {
  const isMilestone = event.isMilestone;
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, event)}
      onDragEnd={onDragEnd}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(event);
      }}
      className={cn(
        "group relative flex items-center h-5 px-1.5 mb-1 text-[10px] rounded cursor-pointer transition-all truncate select-none hover:shadow-sm active:scale-[0.98]",
        event.isCritical ? "border-l-2 border-red-500" : "border-l-2 border-primary",
        isMilestone ? "bg-slate-800 text-white" : "bg-primary/10 text-slate-900 hover:bg-slate-100"
      )}
      title={`${event.title} (${event.progress}%)`}
    >
      {isMilestone && <span className="mr-1">◆</span>}
      <span className="truncate flex-1">{event.title}</span>
      
      {/* Прогресс-бар снизу события */}
      {!isMilestone && (
        <div className="absolute bottom-0 left-0 h-[2px] bg-slate-300 opacity-50" style={{ width: '100%' }}>
          <div className="h-full bg-primary" style={{ width: `${event.progress}%` }} />
        </div>
      )}
    </div>
  );
};

