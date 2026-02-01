import React from 'react'
import { ICalendarCell } from '@/domain/calendar/interfaces/ICalendarCell'
import { CalendarDay } from './CalendarDay'
import { ICalendarEvent } from '@/domain/calendar/interfaces/ICalendarEvent'

interface CalendarGridProps {
  days: ICalendarCell[];
  onEventClick?: (event: ICalendarEvent) => void;
  onEventContextMenu?: (e: React.MouseEvent, event: ICalendarEvent) => void;
  onDragStart?: (e: React.DragEvent, event: ICalendarEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, date: Date) => void;
}

/**
 * Сетка календаря
 */
export const CalendarGrid: React.FC<CalendarGridProps> = ({
  days,
  onEventClick,
  onEventContextMenu,
  onDragStart,
  onDragEnd,
  onDrop,
}) => {
  const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Заголовки дней недели */}
      <div className="grid grid-cols-7 border-b border-border/30 bg-muted/20">
        {weekdays.map(day => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 border-r border-border/30 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Сетка дней */}
      <div className="grid grid-cols-7 flex-1 overflow-hidden">
        {days.map((day, index) => (
          <CalendarDay
            key={`${day.date.getTime()}-${index}`}
            day={day}
            onEventClick={onEventClick}
            onEventContextMenu={onEventContextMenu}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDrop={onDrop}
          />
        ))}
      </div>
    </div>
  )
}


