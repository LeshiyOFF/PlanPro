import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ViewType, ViewSettings } from '@/types/ViewTypes';
import { TwoTierHeader } from '@/components/layout/ViewHeader';
import { CalendarService } from '@/domain/calendar/services/CalendarService';
import { useProjectStore } from '@/store/projectStore';
import { useHelpContent } from '@/hooks/useHelpContent';
import { CalendarGrid } from './CalendarGrid';
import { TaskInformationDialog } from '@/components/dialogs/task/TaskInformationDialog';
import { ICalendarEvent } from '@/domain/calendar/interfaces/ICalendarEvent';
import { useCalendarDnD } from '@/hooks/calendar/useCalendarDnD';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * CalendarView - Календарное представление проекта
 * 
 * Использует TwoTierHeader + Dynamic Accent System.
 * 
 * @version 8.14
 */
export const CalendarView: React.FC<{ viewType: ViewType; settings?: Partial<ViewSettings> }> = ({ 
  viewType 
}) => {
  const { t } = useTranslation();
  const helpContent = useHelpContent();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { tasks, updateTask, addTask } = useProjectStore();
  const calendarService = useMemo(() => new CalendarService(), []);
  const { handleDragStart, handleDragEnd, handleDrop } = useCalendarDnD();
  
  // Состояние диалога редактирования
  const [selectedEvent, setSelectedEvent] = useState<ICalendarEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = useMemo(() => 
    calendarService.generateMonthDays(year, month, tasks),
    [year, month, tasks, calendarService]
  );

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleEventClick = (event: ICalendarEvent) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (result: any) => {
    setIsDialogOpen(false);
    if (result && result.success && result.data && selectedEvent) {
      updateTask(selectedEvent.id, result.data);
    }
    setSelectedEvent(null);
  };

  const handleAddEvent = () => {
    addTask({
      id: `TASK-${tasks.length + 1}`,
      name: t('sheets.new_task'),
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      progress: 0,
      color: 'hsl(var(--primary))',
      level: 1,
      predecessors: []
    });
  };

  // Навигационные контролы
  const navigationControls = (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 bg-white border rounded-lg px-3 py-1.5 shadow-sm soft-border">
        <CalendarIcon className="h-4 w-4 text-primary" />
        <span className="text-sm font-bold text-slate-800 min-w-[140px] text-center">
          {calendarService.getMonthName(month)} {year}
        </span>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleToday} 
        className="h-9 hover:bg-primary/5 text-primary font-medium soft-border"
      >
        {t('view_controls.today')}
      </Button>
      <div className="flex items-center bg-white border rounded-lg overflow-hidden shadow-sm soft-border">
        <Button variant="ghost" size="sm" onClick={handlePrevMonth} className="h-9 w-9 p-0 hover:bg-primary/5 hover:text-primary">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="w-[1px] h-4 bg-slate-100" />
        <Button variant="ghost" size="sm" onClick={handleNextMonth} className="h-9 w-9 p-0 hover:bg-primary/5 hover:text-primary">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <TwoTierHeader
        title={t('navigation.calendar')}
        description={t('descriptions.calendar')}
        icon={<CalendarIcon />}
        help={helpContent.CALENDAR}
        actionBar={{
          primaryAction: {
            label: t('sheets.add_task'),
            onClick: handleAddEvent,
            icon: <Plus className="w-4 h-4" />
          },
          controls: navigationControls
        }}
      />

      <div className="flex-1 overflow-hidden p-4">
        <div className="h-full bg-white rounded-xl shadow-lg border overflow-hidden soft-border">
          <CalendarGrid 
            days={days} 
            onEventClick={handleEventClick}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
          />
        </div>
      </div>

      {isDialogOpen && selectedEvent && (
        <TaskInformationDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          data={{
            ...selectedEvent.originalTask,
            taskId: selectedEvent.id
          }}
        />
      )}
    </div>
  );
};
