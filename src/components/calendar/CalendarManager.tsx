import React, { useState } from 'react'
import { useProjectStore } from '@/store/projectStore'
import { CalendarEditorDialog } from '@/components/dialogs/calendar/CalendarEditorDialog'
import { IWorkCalendar } from '@/domain/calendar/interfaces/IWorkCalendar'
import { CalendarTemplateService } from '@/domain/calendar/services/CalendarTemplateService'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Calendar, Lock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CalendarManagerProps {
  className?: string;
}

/**
 * Менеджер календарей проекта
 * Предоставляет интерфейс для создания, редактирования и удаления рабочих графиков
 * Stage 8.15: Эталонное управление календарями
 */
export const CalendarManager: React.FC<CalendarManagerProps> = ({ className = '' }) => {
  const { toast } = useToast()
  const { calendars, addCalendar, updateCalendar, deleteCalendar } = useProjectStore()
  const templateService = CalendarTemplateService.getInstance()

  const [editorOpen, setEditorOpen] = useState(false)
  const [editingCalendar, setEditingCalendar] = useState<IWorkCalendar | undefined>()

  const handleCreate = () => {
    setEditingCalendar(undefined)
    setEditorOpen(true)
  }

  const handleEdit = (calendar: IWorkCalendar) => {
    setEditingCalendar(calendar)
    setEditorOpen(true)
  }

  const handleDelete = (calendar: IWorkCalendar) => {
    if (calendar.isBase) {
      toast({
        title: 'Ошибка',
        description: 'Базовые календари нельзя удалять',
        variant: 'destructive',
      })
      return
    }

    const confirmed = window.confirm(`Удалить календарь "${calendar.name}"?`)
    if (confirmed) {
      deleteCalendar(calendar.id)
      toast({
        title: 'Успех',
        description: `Календарь "${calendar.name}" удален`,
      })
    }
  }

  const handleSave = (calendar: IWorkCalendar) => {
    if (editingCalendar) {
      updateCalendar(calendar.id, calendar)
      toast({
        title: 'Успех',
        description: `Календарь "${calendar.name}" обновлен`,
      })
    } else {
      addCalendar(calendar)
      toast({
        title: 'Успех',
        description: `Календарь "${calendar.name}" создан`,
      })
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Заголовок и кнопка создания */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Рабочие календари</h3>
        </div>
        <Button onClick={handleCreate} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Создать календарь
        </Button>
      </div>

      {/* Список календарей */}
      <div className="grid gap-3">
        {calendars.map((calendar) => {
          const dynamicShortDesc = templateService.generateShortDescription(calendar)

          return (
            <div
              key={calendar.id}
              className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{calendar.name}</h4>
                    {calendar.isBase && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Базовый
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">
                    {calendar.description || dynamicShortDesc}
                  </p>

                  {/* Визуальная полоска дней */}
                  <div className="flex gap-1">
                    {calendar.workingDays
                      .sort((a, b) => {
                        const orderA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek
                        const orderB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek
                        return orderA - orderB
                      })
                      .map((wd) => (
                        <div
                          key={wd.dayOfWeek}
                          className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold ${
                            wd.isWorking
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                          title={wd.isWorking ? 'Рабочий' : 'Выходной'}
                        >
                          {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][wd.dayOfWeek].substring(0, 1)}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Действия */}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(calendar)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!calendar.isBase && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(calendar)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Диалог редактирования */}
      <CalendarEditorDialog
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
        calendar={editingCalendar}
      />
    </div>
  )
}
