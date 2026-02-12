import React, { useCallback, useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PreferencesSection } from './PreferencesSection'
import { useUserPreferences } from '../hooks/useUserPreferences'
import { ICalendarPreferences, DurationCalculationMode } from '../interfaces/UserPreferencesInterfaces'
import { useDebouncedCallback } from '@/hooks/useDebounce'

/**
 * Компонент настроек календаря
 */
export const CalendarPreferences: React.FC = () => {
  const { preferences, updateCalendarPreferences } = useUserPreferences()
  const calendarPrefs = preferences.calendar as ICalendarPreferences

  // Локальное состояние для текстовых полей
  const [localHoursPerDay, setLocalHoursPerDay] = useState((calendarPrefs.hoursPerDay ?? 8).toString())
  const [localHoursPerWeek, setLocalHoursPerWeek] = useState((calendarPrefs.hoursPerWeek ?? 40).toString())
  const [localDaysPerMonth, setLocalDaysPerMonth] = useState((calendarPrefs.daysPerMonth ?? 20).toString())

  useEffect(() => {
    setLocalHoursPerDay((calendarPrefs.hoursPerDay ?? 8).toString())
    setLocalHoursPerWeek((calendarPrefs.hoursPerWeek ?? 40).toString())
    setLocalDaysPerMonth((calendarPrefs.daysPerMonth ?? 20).toString())
  }, [calendarPrefs.hoursPerDay, calendarPrefs.hoursPerWeek, calendarPrefs.daysPerMonth])

  const debouncedUpdate = useDebouncedCallback((updates: Partial<ICalendarPreferences>) => {
    updateCalendarPreferences(updates)
  }, 500)

  const handleHoursPerDayChange = useCallback((value: string) => {
    setLocalHoursPerDay(value)
    const val = parseFloat(value)
    if (!isNaN(val) && val > 0 && val <= 24) {
      debouncedUpdate({ hoursPerDay: val })
    }
  }, [debouncedUpdate])

  const handleHoursPerWeekChange = useCallback((value: string) => {
    setLocalHoursPerWeek(value)
    const val = parseFloat(value)
    if (!isNaN(val) && val > 0 && val <= 168) {
      debouncedUpdate({ hoursPerWeek: val })
    }
  }, [debouncedUpdate])

  const handleDaysPerMonthChange = useCallback((value: string) => {
    setLocalDaysPerMonth(value)
    const val = parseFloat(value)
    if (!isNaN(val) && val > 0 && val <= 31) {
      debouncedUpdate({ daysPerMonth: val })
    }
  }, [debouncedUpdate])

  const handleDurationModeChange = useCallback((value: DurationCalculationMode) => {
    updateCalendarPreferences({ durationCalculationMode: value })
  }, [updateCalendarPreferences])

  return (
    <PreferencesSection
      title="Настройки календаря"
      description="Определение рабочих интервалов для конвертации времени"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="hoursPerDay">Часов в дне</Label>
          <Input
            id="hoursPerDay"
            type="number"
            step="0.5"
            value={localHoursPerDay}
            onChange={(e) => handleHoursPerDayChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Используется при вводе "1д"</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hoursPerWeek">Часов в неделе</Label>
          <Input
            id="hoursPerWeek"
            type="number"
            value={localHoursPerWeek}
            onChange={(e) => handleHoursPerWeekChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Используется при вводе "1н"</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="daysPerMonth">Дней в месяце</Label>
          <Input
            id="daysPerMonth"
            type="number"
            value={localDaysPerMonth}
            onChange={(e) => handleDaysPerMonthChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Используется при вводе "1мес"</p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="space-y-2 max-w-md">
          <Label htmlFor="durationMode">Режим расчёта длительности</Label>
          <Select
            value={calendarPrefs.durationCalculationMode ?? 'working'}
            onValueChange={handleDurationModeChange}
          >
            <SelectTrigger id="durationMode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="working">
                Рабочее время ({calendarPrefs.hoursPerDay}ч/день)
              </SelectItem>
              <SelectItem value="calendar">
                Календарное время (24ч/сутки)
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {calendarPrefs.durationCalculationMode === 'calendar'
              ? 'Длительность считается в календарных сутках (24 часа). Рабочие графики учитываются только на уровне ресурсов.'
              : 'Длительность считается на основе рабочих часов в день. Классический режим MS Project.'}
          </p>
        </div>
      </div>
    </PreferencesSection>
  )
}

