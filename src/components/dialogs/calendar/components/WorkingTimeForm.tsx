import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarDialogData, IDialogData } from '@/types/dialog/DialogTypes'
import { TypedDialogActions } from '@/types/dialog/DialogStateTypes'
import { logger } from '@/utils/logger'
import { Button } from '@/components/ui/button'

/**
 * Типизированный интерфейс для данных рабочего времени
 * Наследует индексную сигнатуру из IDialogData (DialogDataValue)
 */
export interface TypedWorkingTimeFormData extends IDialogData {
  workingTime: CalendarDialogData['workingTime'];
}

/**
 * Типизированный результат
 */
export interface WorkingTimeResult {
  success: boolean;
  message?: string;
}

/**
 * Actions для диалога рабочего времени
 */
export interface WorkingTimeActions extends TypedDialogActions<TypedWorkingTimeFormData, WorkingTimeResult> {
  onOk: () => Promise<void>;
}

/**
 * Компонент формы для настройки рабочего времени
 */
const WorkingTimeFormComponent: React.FC<{
  workingTime: Record<string, { startTime: string; endTime: string; isWorkingDay: boolean }>;
  onChange: (day: number, field: string, value: string) => void;
}> = ({ workingTime, onChange }) => {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {[0, 1, 2, 3, 4, 5, 6].map(day => {
          const dayData = workingTime[`day${day}`] || { startTime: '09:00', endTime: '17:00', isWorkingDay: true }
          return (
            <div key={day} className="border rounded-lg p-3 space-y-2">
              <div className="text-xs font-semibold uppercase text-slate-500">
                {t(`days.${day}`)}
              </div>
              <div className="flex flex-col gap-1">
                <input
                  type="time"
                  value={dayData.startTime}
                  onChange={(e) => onChange(day, 'start', e.target.value)}
                  className="text-xs border rounded p-1"
                  disabled={!dayData.isWorkingDay}
                />
                <input
                  type="time"
                  value={dayData.endTime}
                  onChange={(e) => onChange(day, 'end', e.target.value)}
                  className="text-xs border rounded p-1"
                  disabled={!dayData.isWorkingDay}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// export const WorkingTimeForm = WorkingTimeFormComponent; // Removed to avoid redeclaration conflict

/**
 * Компонент диалога для настройки рабочего времени (Legacy)
 */
export const TypedWorkingTimeDialog: React.FC<{
  isOpen: boolean;
  data?: CalendarDialogData;
  onClose: () => void;
}> = ({ data, onClose }) => {
  const { t } = useTranslation()
  const [workingTime, setWorkingTime] = useState<Record<string, { startTime: string; endTime: string; isWorkingDay: boolean }>>(() => {
    return data?.workingTime ?? {}
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      localStorage.setItem('calendar-working-time', JSON.stringify({ workingTime }))
      onClose()
    } catch (error) {
      logger.error('Failed to save working time settings:', error instanceof Error ? error : new Error(String(error)))
    } finally {
      setIsSaving(false)
    }
  }

  if (!data) return null

  return (
    <div className="p-4">
      <WorkingTimeFormComponent
        workingTime={workingTime}
        onChange={(day: number, field: string, value: string) => {
          setWorkingTime((prev: Record<string, { startTime: string; endTime: string; isWorkingDay: boolean }>) => {
            const dayKey = `day${day}`
            const currentDay = prev[dayKey] || { startTime: '09:00', endTime: '17:00', isWorkingDay: true }
            return {
              ...prev,
              [dayKey]: {
                ...currentDay,
                [field === 'start' ? 'startTime' : 'endTime']: value,
              },
            }
          })
        }}
      />
      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          {t('common.cancel')}
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>
    </div>
  )
}

/**
 * Экспорт для обратной совместимости
 */
export const WorkingTimeFormLegacy = TypedWorkingTimeDialog
export type WorkingTimeFormProps = React.ComponentProps<typeof TypedWorkingTimeDialog>;
