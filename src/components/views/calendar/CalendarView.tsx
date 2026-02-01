import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ViewType, ViewSettings } from '@/types/ViewTypes'
import { TwoTierHeader } from '@/components/layout/ViewHeader'
import { CalendarService } from '@/domain/calendar/services/CalendarService'
import { useProjectStore, createTaskFromView } from '@/store/projectStore'
import { useHelpContent } from '@/hooks/useHelpContent'
import { CalendarGrid } from './CalendarGrid'
import { TaskPropertiesDialog } from '@/components/dialogs/TaskPropertiesDialog'
import { ICalendarEvent } from '@/domain/calendar/interfaces/ICalendarEvent'
import { useCalendarDnD } from '@/hooks/calendar/useCalendarDnD'
import { useContextMenu } from '@/presentation/contextmenu/providers/ContextMenuProvider'
import { ContextMenuType } from '@/domain/contextmenu/ContextMenuType'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Task } from '@/store/project/interfaces'
import { ITaskMenuTarget } from '@/types/contextmenu/IContextMenuTypes'
import type { JsonObject } from '@/types/json-types'

/**
 * CalendarView - Календарное представление проекта
 *
 * Использует TwoTierHeader + Dynamic Accent System.
 *
 * @version 8.14
 */
export const CalendarView: React.FC<{ viewType: ViewType; settings?: Partial<ViewSettings> }> = ({
  viewType: _viewType,
}) => {
  const { t } = useTranslation()
  const helpContent = useHelpContent()
  const [currentDate, setCurrentDate] = useState(new Date())
  const { tasks, addTask, deleteTask } = useProjectStore()
  const calendarService = useMemo(() => new CalendarService(), [])
  const { handleDragStart, handleDragEnd, handleDrop } = useCalendarDnD()
  const { showMenu } = useContextMenu()

  // Состояние диалога редактирования
  const [selectedEvent, setSelectedEvent] = useState<ICalendarEvent | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const days = useMemo(() =>
    calendarService.generateMonthDays(year, month, tasks),
  [year, month, tasks, calendarService],
  )

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const handleToday = () => setCurrentDate(new Date())

  const handleEventClick = (event: ICalendarEvent) => {
    setSelectedEvent(event)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedEvent(null)
  }

  const handleEventContextMenu = (e: React.MouseEvent, event: ICalendarEvent) => {
    const taskMenuTarget: ITaskMenuTarget = {
      ...event,
      type: 'task',
      onShowProperties: async (_task: Task) => {
        setSelectedEvent(event)
        setIsDialogOpen(true)
      },
      onDelete: async (task: Task) => {
        deleteTask(task.id)
      },
    }

    showMenu(ContextMenuType.TASK, {
      target: taskMenuTarget as JsonObject,
      position: { x: e.clientX, y: e.clientY },
    })
  }

  const handleAddEvent = () => {
    addTask(createTaskFromView({
      id: `TASK-${tasks.length + 1}`,
      name: t('sheets.new_task'),
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      progress: 0,
      color: 'hsl(var(--primary))',
      level: 1,
      predecessors: [],
    }))
  }

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
  )

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
            icon: <Plus className="w-4 h-4" />,
          },
          controls: navigationControls,
        }}
      />

      <div className="flex-1 overflow-hidden p-4">
        <div className="h-full bg-white rounded-xl shadow-lg border overflow-hidden soft-border">
          <CalendarGrid
            days={days}
            onEventClick={handleEventClick}
            onEventContextMenu={handleEventContextMenu}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
          />
        </div>
      </div>

      {isDialogOpen && selectedEvent && (
        <TaskPropertiesDialog
          taskId={selectedEvent.id}
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
        />
      )}
    </div>
  )
}
