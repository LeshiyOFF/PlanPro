import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useProjectStore } from '@/store/projectStore'
import { useTranslation } from 'react-i18next'
import { Calendar, X, AlertCircle } from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { ScheduleModeInfo } from './ScheduleModeInfo'
import { FirstTimeHintService } from '@/services/FirstTimeHintService'
import { useToast } from '@/hooks/use-toast'

interface ProjectPropertiesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Диалог свойств проекта с поддержкой imposed finish date (VB.5).
 * Дизайн согласован с TaskPropertiesDialog и DependencyConflictDialog:
 * акцентная шапка, белое тело, градиенты и глубина.
 *
 * Clean Architecture: UI Component (Presentation Layer)
 * SOLID: Single Responsibility - управление метаданными проекта
 *
 * @version 1.0 - VB.5 Imposed Finish Date
 * @version 1.1 - VB.9 Clear Deadline, VB.12 Schedule from End validation
 */
export const ProjectPropertiesDialog: React.FC<ProjectPropertiesDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { imposedFinishDate, setImposedFinishDate, tasks, isForward } = useProjectStore()

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [validationError, setValidationError] = useState<string>('')
  const hintService = React.useMemo(() => FirstTimeHintService.getInstance(), [])

  // VB.12: Проверка режима планирования (по умолчанию true = Schedule from Start)
  const isScheduleFromStart = isForward ?? true
  const canSetDeadline = isScheduleFromStart

  // Минимальная дата начала проекта (самая ранняя задача)
  const projectStartDate = React.useMemo(() => {
    if (tasks.length === 0) return new Date()
    const starts = tasks.map(t => t.startDate.getTime()).filter(d => d > 0)
    return new Date(Math.min(...starts))
  }, [tasks])

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(imposedFinishDate ?? undefined)
      setValidationError('')
    }
  }, [isOpen, imposedFinishDate])

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date)
    setValidationError('')

    // VB.12: Валидация режима планирования
    if (date && !canSetDeadline) {
      setValidationError(
        t('project_props.deadline_not_supported_in_backward', {
          defaultValue: 'Жёсткий дедлайн не поддерживается в режиме планирования от даты окончания. Переключитесь на планирование от даты начала.',
        })
      )
      return
    }

    if (date && date < projectStartDate) {
      setValidationError(
        t('project_props.deadline_before_start', {
          defaultValue: 'Дедлайн не может быть раньше даты начала проекта',
        })
      )
    }
  }

  const handleClear = () => {
    setSelectedDate(undefined)
    setValidationError('')
  }

  const handleSave = () => {
    if (validationError) return

    // VB.12: Дополнительная проверка перед сохранением
    if (selectedDate && !canSetDeadline) {
      setValidationError(
        t('project_props.deadline_not_supported_in_backward', {
          defaultValue: 'Жёсткий дедлайн не поддерживается в режиме планирования от даты окончания.',
        })
      )
      return
    }

    // VB.11: Показать подсказку при первой установке imposed deadline
    const wasDeadlineSet = imposedFinishDate !== null
    const willBeDeadlineSet = selectedDate !== undefined
    
    if (!wasDeadlineSet && willBeDeadlineSet && !hintService.isHintShown('imposed_deadline_first_time')) {
      hintService.markHintAsShown('imposed_deadline_first_time')
      toast({
        title: t('project_props.first_time_hint_title', {
          defaultValue: 'ℹ️ Информация о жёстком дедлайне',
        }),
        description: t('project_props.first_time_hint_description', {
          defaultValue:
            'При просрочке задачи с отрицательным резервом покажут просрочку; критический путь может быть прерывистым. Используйте опцию «Показать отрицательный slack» в настройках Ганта для отображения всех просроченных задач.',
        }),
        duration: 8000,
      })
    }

    setImposedFinishDate(selectedDate ?? null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="p-0 border-none overflow-hidden w-[600px] max-h-[85vh] rounded-2xl shadow-2xl bg-[hsl(var(--primary))] gap-0 flex flex-col"
        hideClose
      >
        {/* Шапка с акцентным цветом */}
        <div className="p-10 pb-8 text-white relative shadow-lg">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 opacity-70 hover:opacity-100 transition-all p-2 rounded-full hover:bg-white/10 z-50"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center p-3 shadow-lg">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-extrabold tracking-tight mb-1">
                {t('project_props.title', { defaultValue: 'Свойства проекта' })}
              </h2>
              <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                {t('project_props.subtitle', {
                  defaultValue: 'Настройки расписания и дедлайнов',
                })}
              </p>
            </div>
          </div>
        </div>

              {/* Тело с белым фоном */}
              <div className="bg-white rounded-t-2xl flex-1 p-8 space-y-6">
                {/* VB.12: Информация о режиме планирования */}
                <ScheduleModeInfo canSetDeadline={canSetDeadline} />

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700">
                    {t('project_props.imposed_finish_date', {
                      defaultValue: 'Жёсткий дедлайн (Must Finish By)',
                    })}
                  </Label>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t('project_props.imposed_finish_date_hint', {
                      defaultValue:
                        'Укажите крайний срок завершения проекта. При просрочке задачи критического пути получат отрицательный резерв времени.',
                    })}
                  </p>
                  {/* VB.11: Расширенная документация о поведении критического пути при imposed deadline */}
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <p className="text-xs text-blue-800 leading-relaxed">
                      <strong className="font-semibold">
                        {t('project_props.critical_path_behavior_title', {
                          defaultValue: 'ℹ️ Поведение критического пути:',
                        })}
                      </strong>
                      <br />
                      {t('project_props.critical_path_behavior_text', {
                        defaultValue:
                          'При просрочке (фактический конец позже дедлайна) критический путь может стать прерывистым: часть задач будет с отрицательным резервом, часть — с положительным. Это ожидаемое поведение CPM (как в MS Project).',
                      })}
                      <br />
                      <br />
                      {t('project_props.critical_path_visualization_hint', {
                        defaultValue:
                          'Для отображения всех просроченных задач используйте опцию «Показать отрицательный slack» в настройках диаграммы Ганта.',
                      })}
                    </p>
                  </div>
                   <div className="flex gap-3">
                     <DatePicker
                       date={selectedDate}
                       onChange={handleDateChange}
                       className="flex-1"
                       placeholder={t('project_props.no_deadline', {
                         defaultValue: 'Автоматический режим',
                       })}
                       disabled={!canSetDeadline}
                     />
                     <Button
                       variant="outline"
                       onClick={handleClear}
                       disabled={!canSetDeadline || !selectedDate}
                       className="h-11 px-6 rounded-xl border-slate-300 hover:bg-slate-100 font-semibold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {t('common.clear', { defaultValue: 'Очистить' })}
                     </Button>
                   </div>
            {validationError && (
              <div className="flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">{validationError}</p>
              </div>
            )}
            {selectedDate && !validationError && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <p className="text-sm text-emerald-800 font-medium">
                  ⏰ {t('project_props.deadline_set', { defaultValue: 'Дедлайн установлен' })}:{' '}
                  {selectedDate.toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Футер с кнопками */}
        <DialogFooter className="p-6 px-8 bg-white flex flex-row gap-4 sm:space-x-0 border-t border-slate-200">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 h-12 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl text-base border border-slate-200"
          >
            {t('common.cancel', { defaultValue: 'Отмена' })}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!!validationError}
            className="flex-1 h-12 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white font-bold shadow-md rounded-xl text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.save', { defaultValue: 'Сохранить' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ProjectPropertiesDialog
