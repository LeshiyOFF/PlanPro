import React from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Типизированные props для формы рабочего времени
 */
export interface TypedWorkingTimeFormProps {
  workingTime: Record<string, { startTime: string; endTime: string; isWorkingDay: boolean }>;
  onChange: (dayOfWeek: number, field: string, value: string) => void;
}

/**
 * Компонент формы для редактирования рабочего времени
 */
export const WorkingTimeFormBase: React.FC<TypedWorkingTimeFormProps> = ({
  workingTime,
  onChange,
}) => {
  const { t } = useTranslation()

  const daysOfWeek: number[] = [1, 2, 3, 4, 5, 6, 0]

  return (
    <div className="space-y-6">
      {daysOfWeek.map((day) => {
        const dayData = workingTime[`day${day}`] || {
          startTime: '',
          endTime: '',
          isWorkingDay: false,
        }

        const isWorkingDayLabel = dayData.isWorkingDay
          ? t('calendar.working_day', { defaultValue: 'Рабочий' })
          : t('calendar.weekend', { defaultValue: 'Выходной' })

        return (
          <div key={day} className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">
                {t(`calendar.day_${day}`)}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium">
                  {isWorkingDayLabel}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-500">{t('calendar.start_time')}</label>
                <input
                  type="time"
                  value={dayData.startTime}
                  onChange={(e) => onChange(day, 'start', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500">{t('calendar.end_time')}</label>
                <input
                  type="time"
                  value={dayData.endTime}
                  onChange={(e) => onChange(day, 'end', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
