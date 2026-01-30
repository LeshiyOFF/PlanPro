import React from 'react';
import { ICalendarCell } from '@/domain/calendar/interfaces/ICalendarCell';
import { CalendarEvent } from './CalendarEvent';
import { cn } from '@/lib/utils';
import { ICalendarEvent } from '@/domain/calendar/interfaces/ICalendarEvent';

interface CalendarDayProps {
  day: ICalendarCell;
  onEventClick?: (event: ICalendarEvent) => void;
  onEventContextMenu?: (e: React.MouseEvent, event: ICalendarEvent) => void;
  onDragStart?: (e: React.DragEvent, event: ICalendarEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, date: Date) => void;
}

/**
 * Ячейка отдельного дня в сетке календаря
 */
export const CalendarDay: React.FC<CalendarDayProps> = ({ 
  day, 
  onEventClick,
  onEventContextMenu,
  onDragStart,
  onDragEnd,
  onDrop
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleLocalDrop = (e: React.DragEvent) => {
    setIsDragOver(false);
    onDrop?.(e, day.date);
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleLocalDrop}
      className={cn(
        "min-h-[100px] flex flex-col border-r border-b border-border/30 p-1 transition-colors relative",
        !day.isCurrentMonth ? "bg-slate-50 text-slate-400" : "bg-white",
        day.isWeekend && day.isCurrentMonth ? "bg-slate-50/50" : "",
        day.isToday ? "bg-primary/5 ring-1 ring-inset ring-primary/10" : "",
        isDragOver ? "bg-slate-100/50 border-primary/20" : ""
      )}
    >
      <div className="flex justify-between items-center mb-1">
        <span className={cn(
          "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
          day.isToday ? "bg-primary text-white" : "text-slate-600"
        )}>
          {day.date.getDate()}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {day.events.map(event => (
          <CalendarEvent 
            key={event.id} 
            event={event} 
            onClick={onEventClick}
            onContextMenu={onEventContextMenu}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  );
};


