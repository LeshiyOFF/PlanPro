import React, { useCallback, useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { PreferencesSection } from './PreferencesSection';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { ICalendarPreferences } from '../interfaces/UserPreferencesInterfaces';
import { useDebouncedCallback } from '@/hooks/useDebounce';

/**
 * Компонент настроек календаря
 */
export const CalendarPreferences: React.FC = () => {
  const { preferences, updateCalendarPreferences } = useUserPreferences();
  const calendarPrefs = preferences.calendar as ICalendarPreferences;

  // Локальное состояние для текстовых полей
  const [localHoursPerDay, setLocalHoursPerDay] = useState((calendarPrefs.hoursPerDay ?? 8).toString());
  const [localHoursPerWeek, setLocalHoursPerWeek] = useState((calendarPrefs.hoursPerWeek ?? 40).toString());
  const [localDaysPerMonth, setLocalDaysPerMonth] = useState((calendarPrefs.daysPerMonth ?? 20).toString());

  useEffect(() => {
    setLocalHoursPerDay((calendarPrefs.hoursPerDay ?? 8).toString());
    setLocalHoursPerWeek((calendarPrefs.hoursPerWeek ?? 40).toString());
    setLocalDaysPerMonth((calendarPrefs.daysPerMonth ?? 20).toString());
  }, [calendarPrefs.hoursPerDay, calendarPrefs.hoursPerWeek, calendarPrefs.daysPerMonth]);

  const debouncedUpdate = useDebouncedCallback((updates: Partial<ICalendarPreferences>) => {
    updateCalendarPreferences(updates);
  }, 500);

  const handleHoursPerDayChange = useCallback((value: string) => {
    setLocalHoursPerDay(value);
    const val = parseFloat(value);
    if (!isNaN(val) && val > 0 && val <= 24) {
      debouncedUpdate({ hoursPerDay: val });
    }
  }, [debouncedUpdate]);

  const handleHoursPerWeekChange = useCallback((value: string) => {
    setLocalHoursPerWeek(value);
    const val = parseFloat(value);
    if (!isNaN(val) && val > 0 && val <= 168) {
      debouncedUpdate({ hoursPerWeek: val });
    }
  }, [debouncedUpdate]);

  const handleDaysPerMonthChange = useCallback((value: string) => {
    setLocalDaysPerMonth(value);
    const val = parseFloat(value);
    if (!isNaN(val) && val > 0 && val <= 31) {
      debouncedUpdate({ daysPerMonth: val });
    }
  }, [debouncedUpdate]);

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
    </PreferencesSection>
  );
};

