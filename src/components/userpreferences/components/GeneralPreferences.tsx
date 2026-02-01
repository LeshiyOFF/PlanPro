import React, { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PreferencesSection } from './PreferencesSection';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { IGeneralPreferences } from '../interfaces/UserPreferencesInterfaces';
import { ViewType } from '@/types/ViewTypes';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { localizeFormatMask } from '@/utils/formatUtils';

/**
 * Компонент общих настроек
 */
export const GeneralPreferences: React.FC = () => {
  const { t } = useTranslation();
  const { preferences, updateGeneralPreferences, flush } = useUserPreferences();
  const generalPrefs = preferences.general as IGeneralPreferences;

  // Локальное состояние для текстовых полей (предотвращает лаги и потерю фокуса)
  const [localUserName, setLocalUserName] = useState(generalPrefs.userName || '');
  const [localCompanyName, setLocalCompanyName] = useState(generalPrefs.companyName || '');
  const [localStandardRate, setLocalStandardRate] = useState((generalPrefs.defaultStandardRate ?? 0).toString());
  const [localOvertimeRate, setLocalOvertimeRate] = useState((generalPrefs.defaultOvertimeRate ?? 0).toString());

  // Гарантированное сохранение при размонтировании (закрытии окна настроек)
  useEffect(() => {
    return () => {
      // Принудительно сбрасываем все изменения из дебаунса в хранилище
      flush();
    };
  }, [flush]);

  // Синхронизация локального состояния при внешнем изменении (например, импорт)
  useEffect(() => {
    setLocalUserName(generalPrefs.userName || '');
  }, [generalPrefs.userName]);

  useEffect(() => {
    setLocalCompanyName(generalPrefs.companyName || '');
  }, [generalPrefs.companyName]);

  useEffect(() => {
    setLocalStandardRate((generalPrefs.defaultStandardRate ?? 0).toString());
  }, [generalPrefs.defaultStandardRate]);

  useEffect(() => {
    setLocalOvertimeRate((generalPrefs.defaultOvertimeRate ?? 0).toString());
  }, [generalPrefs.defaultOvertimeRate]);

  // Дебаунс-обработчики для сохранения (фоновое)
  const debouncedUpdateGeneral = useDebouncedCallback((updates: Partial<IGeneralPreferences>) => {
    updateGeneralPreferences(updates);
  }, 500);

  /**
   * Немедленное сохранение при потере фокуса (onBlur)
   * Это гарантирует, что данные не потеряются, даже если окно закроется сразу после ввода
   */
  const handleBlur = useCallback((field: keyof IGeneralPreferences, value: string | number) => {
    updateGeneralPreferences({ [field]: value });
  }, [updateGeneralPreferences]);

  const handleUserNameChange = useCallback((value: string) => {
    setLocalUserName(value);
    debouncedUpdateGeneral({ userName: value });
  }, [debouncedUpdateGeneral]);

  const handleCompanyNameChange = useCallback((value: string) => {
    setLocalCompanyName(value);
    debouncedUpdateGeneral({ companyName: value });
  }, [debouncedUpdateGeneral]);

  const handleDefaultViewChange = useCallback((value: ViewType) => {
    updateGeneralPreferences({ defaultView: value });
  }, [updateGeneralPreferences]);

  const handleAutoSaveChange = useCallback((checked: boolean) => {
    updateGeneralPreferences({ autoSave: checked });
  }, [updateGeneralPreferences]);

  const handleAutoSaveIntervalChange = useCallback((value: string) => {
    updateGeneralPreferences({ autoSaveInterval: parseInt(value) || 5 });
  }, [updateGeneralPreferences]);

  const handleDateFormatChange = useCallback((value: string) => {
    updateGeneralPreferences({ dateFormat: value });
  }, [updateGeneralPreferences]);

  const handleTimeFormatChange = useCallback((value: string) => {
    updateGeneralPreferences({ timeFormat: value });
  }, [updateGeneralPreferences]);

  const handleCurrencyChange = useCallback((value: string) => {
    updateGeneralPreferences({ currency: value });
  }, [updateGeneralPreferences]);

  const handleLanguageChange = useCallback((value: string) => {
    updateGeneralPreferences({ language: value });
  }, [updateGeneralPreferences]);

  const handleDefaultStandardRateChange = useCallback((value: string) => {
    setLocalStandardRate(value);
    debouncedUpdateGeneral({ defaultStandardRate: parseFloat(value) || 0 });
  }, [debouncedUpdateGeneral]);

  const handleDefaultOvertimeRateChange = useCallback((value: string) => {
    setLocalOvertimeRate(value);
    debouncedUpdateGeneral({ defaultOvertimeRate: parseFloat(value) || 0 });
  }, [debouncedUpdateGeneral]);

  const handleDefaultCalendarChange = useCallback((value: string) => {
    updateGeneralPreferences({ defaultCalendar: value });
  }, [updateGeneralPreferences]);

  return (
    <PreferencesSection
      title={t('preferences.general_title')}
      description={t('preferences.general_desc')}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="userName">{t('preferences.user_name')}</Label>
          <Input
            id="userName"
            value={localUserName}
            onChange={(e) => handleUserNameChange(e.target.value)}
            onBlur={(e) => handleBlur('userName', e.target.value)}
            placeholder={t('preferences.user_name')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyName">{t('preferences.company_name')}</Label>
          <Input
            id="companyName"
            value={localCompanyName}
            onChange={(e) => handleCompanyNameChange(e.target.value)}
            onBlur={(e) => handleBlur('companyName', e.target.value)}
            placeholder={t('preferences.company_name')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultView">{t('preferences.default_view')}</Label>
          <Select value={generalPrefs.defaultView} onValueChange={(val: string) => handleDefaultViewChange(val as ViewType)}>
            <SelectTrigger id="defaultView">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gantt">{t('navigation.gantt')}</SelectItem>
              <SelectItem value="wbs">{t('navigation.wbs')}</SelectItem>
              <SelectItem value="network">{t('navigation.network')}</SelectItem>
              <SelectItem value="resource-sheet">{t('navigation.resource_sheet')}</SelectItem>
              <SelectItem value="calendar">{t('navigation.calendar')}</SelectItem>
              <SelectItem value="reports">{t('navigation.reports')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="autoSave"
            checked={generalPrefs.autoSave}
            onCheckedChange={handleAutoSaveChange}
          />
          <Label htmlFor="autoSave">{t('preferences.auto_save')}</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="autoSaveInterval">
            {t('preferences.auto_save_interval')}
          </Label>
          <Input
            id="autoSaveInterval"
            type="number"
            min="1"
            max="60"
            value={(generalPrefs.autoSaveInterval ?? 5).toString()}
            onChange={(e) => handleAutoSaveIntervalChange(e.target.value)}
            disabled={!generalPrefs.autoSave}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultCalendar">{t('preferences.default_calendar')}</Label>
          <Select value={generalPrefs.defaultCalendar} onValueChange={handleDefaultCalendarChange}>
            <SelectTrigger id="defaultCalendar">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Standard">{t('calendars.standard')}</SelectItem>
              <SelectItem value="Night Shift">{t('calendars.night_shift')}</SelectItem>
              <SelectItem value="24 Hours">{t('calendars.24_hours')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateFormat">{t('preferences.date_format')}</Label>
          <Select value={generalPrefs.dateFormat} onValueChange={handleDateFormatChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DD.MM.YYYY">
                {localizeFormatMask('DD.MM.YYYY', generalPrefs.language)}
              </SelectItem>
              <SelectItem value="MM/DD/YYYY">
                {localizeFormatMask('MM/DD/YYYY', generalPrefs.language)}
              </SelectItem>
              <SelectItem value="YYYY-MM-DD">
                {localizeFormatMask('YYYY-MM-DD', generalPrefs.language)}
              </SelectItem>
              <SelectItem value="DD/MM/YYYY">
                {localizeFormatMask('DD/MM/YYYY', generalPrefs.language)}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeFormat">{t('preferences.time_format')}</Label>
          <Select value={generalPrefs.timeFormat} onValueChange={handleTimeFormatChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HH:mm">
                {localizeFormatMask('HH:mm', generalPrefs.language)} (24h)
              </SelectItem>
              <SelectItem value="HH:mm:ss">
                {localizeFormatMask('HH:mm:ss', generalPrefs.language)} (24h)
              </SelectItem>
              <SelectItem value="hh:mm a">
                {localizeFormatMask('hh:mm', generalPrefs.language)} am/pm
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">{t('preferences.currency')}</Label>
          <Select value={generalPrefs.currency} onValueChange={handleCurrencyChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="RUB">RUB (₽)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="JPY">JPY (¥)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">{t('preferences.language')}</Label>
          <Select value={generalPrefs.language} onValueChange={handleLanguageChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ru-RU">{t('preferences.lang_ru')}</SelectItem>
              <SelectItem value="en-US">{t('preferences.lang_en')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultStandardRate">{t('preferences.std_rate')}</Label>
          <div className="relative">
            <Input
              id="defaultStandardRate"
              type="number"
              value={localStandardRate}
              onChange={(e) => handleDefaultStandardRateChange(e.target.value)}
              onBlur={(e) => handleBlur('defaultStandardRate', parseFloat(e.target.value) || 0)}
              className="pr-10"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
              {t('preferences.per_hour')}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultOvertimeRate">{t('preferences.ot_rate')}</Label>
          <div className="relative">
            <Input
              id="defaultOvertimeRate"
              type="number"
              value={localOvertimeRate}
              onChange={(e) => handleDefaultOvertimeRateChange(e.target.value)}
              onBlur={(e) => handleBlur('defaultOvertimeRate', parseFloat(e.target.value) || 0)}
              className="pr-10"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
              {t('preferences.per_hour')}
            </div>
          </div>
        </div>
      </div>
    </PreferencesSection>
  );
};

