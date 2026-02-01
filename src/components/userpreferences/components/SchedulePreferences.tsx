import React, { useCallback, useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PreferencesSection } from './PreferencesSection'
import { useUserPreferences } from '../hooks/useUserPreferences'
import { ISchedulePreferences } from '../interfaces/UserPreferencesInterfaces'
import { useDebouncedCallback } from '@/hooks/useDebounce'

/**
 * Компонент настроек планирования
 */
export const SchedulePreferences: React.FC = () => {
  const { preferences, updateSchedulePreferences } = useUserPreferences()
  const schedulePrefs = preferences.schedule as ISchedulePreferences

  // Локальное состояние для предотвращения лагов селекторов
  const [localDurationIn, setLocalDurationIn] = useState((schedulePrefs.durationEnteredIn ?? 5).toString())
  const [localWorkUnit, setLocalWorkUnit] = useState((schedulePrefs.workUnit ?? 4).toString())

  useEffect(() => {
    setLocalDurationIn((schedulePrefs.durationEnteredIn ?? 5).toString())
  }, [schedulePrefs.durationEnteredIn])

  useEffect(() => {
    setLocalWorkUnit((schedulePrefs.workUnit ?? 4).toString())
  }, [schedulePrefs.workUnit])

  const debouncedUpdate = useDebouncedCallback((updates: Partial<ISchedulePreferences>) => {
    updateSchedulePreferences(updates)
  }, 400)

  const handleSchedulingRuleChange = useCallback((value: string) => {
    updateSchedulePreferences({ schedulingRule: parseInt(value) })
  }, [updateSchedulePreferences])

  const handleEffortDrivenChange = useCallback((checked: boolean) => {
    updateSchedulePreferences({ effortDriven: checked })
  }, [updateSchedulePreferences])

  const handleDurationEnteredInChange = useCallback((value: string) => {
    setLocalDurationIn(value)
    debouncedUpdate({ durationEnteredIn: parseInt(value) })
  }, [debouncedUpdate])

  const handleWorkUnitChange = useCallback((value: string) => {
    setLocalWorkUnit(value)
    debouncedUpdate({ workUnit: parseInt(value) })
  }, [debouncedUpdate])

  const handleNewTasksStartTodayChange = useCallback((checked: boolean) => {
    updateSchedulePreferences({ newTasksStartToday: checked })
  }, [updateSchedulePreferences])

  const handleHonorRequiredDatesChange = useCallback((checked: boolean) => {
    updateSchedulePreferences({ honorRequiredDates: checked })
  }, [updateSchedulePreferences])

  return (
    <PreferencesSection
      title="Настройки планирования"
      description="Параметры автоматического расчета и единицы измерения времени"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="schedulingRule">Тип планирования по умолчанию</Label>
          <Select
            value={(schedulePrefs.schedulingRule ?? 0).toString()}
            onValueChange={handleSchedulingRuleChange}
          >
            <SelectTrigger id="schedulingRule">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Фиксированные единицы (Fixed Units)</SelectItem>
              <SelectItem value="1">Фиксированная длительность (Fixed Duration)</SelectItem>
              <SelectItem value="2">Фиксированный объем работ (Fixed Work)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2 pt-8">
          <Switch
            id="effortDriven"
            checked={schedulePrefs.effortDriven}
            onCheckedChange={handleEffortDrivenChange}
          />
          <Label htmlFor="effortDriven">Планирование от объема работ (Effort driven)</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="durationEnteredIn">Длительность вводится в</Label>
          <Select
            value={localDurationIn}
            onValueChange={handleDurationEnteredInChange}
          >
            <SelectTrigger id="durationEnteredIn">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Минуты</SelectItem>
              <SelectItem value="4">Часы</SelectItem>
              <SelectItem value="5">Дни</SelectItem>
              <SelectItem value="6">Недели</SelectItem>
              <SelectItem value="7">Месяцы</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="workUnit">Трудозатраты выводятся в</Label>
          <Select
            value={localWorkUnit}
            onValueChange={handleWorkUnitChange}
          >
            <SelectTrigger id="workUnit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Минуты</SelectItem>
              <SelectItem value="4">Часы</SelectItem>
              <SelectItem value="5">Дни</SelectItem>
              <SelectItem value="6">Недели</SelectItem>
              <SelectItem value="7">Месяцы</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="newTasksStartToday"
            checked={schedulePrefs.newTasksStartToday}
            onCheckedChange={handleNewTasksStartTodayChange}
          />
          <Label htmlFor="newTasksStartToday">Новые задачи начинаются сегодня</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="honorRequiredDates"
            checked={schedulePrefs.honorRequiredDates}
            onCheckedChange={handleHonorRequiredDatesChange}
          />
          <Label htmlFor="honorRequiredDates">Соблюдать обязательные даты (Honor required dates)</Label>
        </div>
      </div>
    </PreferencesSection>
  )
}

