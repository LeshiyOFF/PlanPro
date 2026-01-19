import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { formatDate } from '@/utils/formatUtils';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DatePickerProps {
  date?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Профессиональный компонент выбора даты.
 * Соответствует принципам SOLID:
 * - Single Responsibility: Только выбор и отображение даты.
 * - Interface Segregation: Минимально необходимый набор пропсов.
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  date,
  onChange,
  placeholder = 'Выберите дату',
  className,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (onChange) {
      onChange(selectedDate);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal h-10',
            !date && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? formatDate(date) : <span>{placeholder}</span>}
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="p-0 w-auto border-none" 
        hideClose
        aria-describedby={undefined}
      >
        {/* Невидимый заголовок для соответствия стандартам доступности Radix UI */}
        <DialogTitle className="sr-only">Выбор даты</DialogTitle>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
      </DialogContent>
    </Dialog>
  );
};

