import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarHeaderProps {
  monthName: string;
  year: number;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

/**
 * Заголовок календаря с навигацией
 */
export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  monthName,
  year,
  onPrev,
  onNext,
  onToday
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-slate-800">
            {monthName} {year}
          </h2>
        </div>
        <Button variant="outline" size="sm" onClick={onToday}>
          Сегодня
        </Button>
      </div>
      
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onPrev}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onNext}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};


