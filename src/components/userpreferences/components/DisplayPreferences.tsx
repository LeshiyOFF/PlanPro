import React, { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PreferencesSection } from './PreferencesSection';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { IDisplayPreferences, Theme } from '../interfaces/UserPreferencesInterfaces';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { APP_FONTS } from '../constants/FontConstants';

/**
 * Компонент настроек отображения
 */
export const DisplayPreferences: React.FC = () => {
  const { t } = useTranslation();
  const { preferences, updateDisplayPreferences, flush } = useUserPreferences();
  const displayPrefs = preferences.display as IDisplayPreferences;

  // Локальное состояние для слайдеров и сложных элементов
  const [localFontSize, setLocalFontSize] = useState(displayPrefs.fontSize);

  // Гарантированное сохранение при закрытии окна
  useEffect(() => {
    return () => {
      flush();
    };
  }, [flush]);

  useEffect(() => {
    setLocalFontSize(displayPrefs.fontSize);
  }, [displayPrefs.fontSize]);

  const debouncedUpdateDisplay = useDebouncedCallback((updates: Partial<IDisplayPreferences>) => {
    updateDisplayPreferences(updates);
  }, 300);

  /**
   * Немедленное сохранение при завершении взаимодействия (для Slider)
   */
  const handleFontSizeCommit = useCallback((value: number) => {
    updateDisplayPreferences({ fontSize: value });
  }, [updateDisplayPreferences]);

  const handleShowTipsChange = useCallback((checked: boolean) => {
    updateDisplayPreferences({ showTips: checked });
  }, [updateDisplayPreferences]);

  const handleShowWelcomeScreenChange = useCallback((checked: boolean) => {
    updateDisplayPreferences({ showWelcomeScreen: checked });
  }, [updateDisplayPreferences]);

  const handleAnimationEnabledChange = useCallback((checked: boolean) => {
    updateDisplayPreferences({ animationEnabled: checked });
  }, [updateDisplayPreferences]);

  const handleHighContrastChange = useCallback((checked: boolean) => {
    updateDisplayPreferences({ highContrast: checked });
  }, [updateDisplayPreferences]);

  const handleFontSizeChange = useCallback((value: number) => {
    setLocalFontSize(value);
    debouncedUpdateDisplay({ fontSize: value });
  }, [debouncedUpdateDisplay]);

  const handleFontFamilyChange = useCallback((value: string) => {
    updateDisplayPreferences({ fontFamily: value });
  }, [updateDisplayPreferences]);

  const handleThemeChange = useCallback((value: Theme) => {
    updateDisplayPreferences({ theme: value });
  }, [updateDisplayPreferences]);

  return (
    <PreferencesSection
      title={t('preferences.display_title')}
      description={t('preferences.display_desc')}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="showTips"
            checked={displayPrefs.showTips}
            onCheckedChange={handleShowTipsChange}
          />
          <Label htmlFor="showTips">{t('preferences.show_tips')}</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="showWelcomeScreen"
            checked={displayPrefs.showWelcomeScreen}
            onCheckedChange={handleShowWelcomeScreenChange}
          />
          <Label htmlFor="showWelcomeScreen">{t('preferences.welcome_screen')}</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="animationEnabled"
            checked={displayPrefs.animationEnabled}
            onCheckedChange={handleAnimationEnabledChange}
          />
          <Label htmlFor="animationEnabled">{t('preferences.animations')}</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="highContrast"
            checked={displayPrefs.highContrast}
            onCheckedChange={handleHighContrastChange}
          />
          <Label htmlFor="highContrast">{t('preferences.high_contrast')}</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fontSize">
            {t('preferences.font_size')}: {localFontSize}px
          </Label>
          <Slider
            id="fontSize"
            min={10}
            max={24}
            step={1}
            value={[localFontSize]}
            onValueChange={([value]) => handleFontSizeChange(value)}
            onValueCommit={([value]) => handleFontSizeCommit(value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10px</span>
            <span>24px</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fontFamily">{t('preferences.font_family')}</Label>
          <Select value={displayPrefs.fontFamily} onValueChange={handleFontFamilyChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APP_FONTS.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {t(font.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="theme">{t('preferences.theme')}</Label>
          <Select value={displayPrefs.theme} onValueChange={handleThemeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Theme.LIGHT}>{t('preferences.theme_light')}</SelectItem>
              <SelectItem value={Theme.DARK}>{t('preferences.theme_dark')}</SelectItem>
              <SelectItem value={Theme.HIGH_CONTRAST}>{t('preferences.theme_hc')}</SelectItem>
              <SelectItem value={Theme.AUTO}>{t('preferences.theme_auto')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accentColor">{t('preferences.accent_color')}</Label>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-3">
              <input
                id="accentColor"
                type="color"
                value={displayPrefs.accentColor || '#1F1F1F'}
                onChange={(e) => updateDisplayPreferences({ accentColor: e.target.value })}
                onBlur={(e) => updateDisplayPreferences({ accentColor: e.target.value })}
                className="h-10 w-20 cursor-pointer rounded-md border border-input bg-transparent p-1"
              />
              <span className="text-xs text-muted-foreground font-mono">
                {displayPrefs.accentColor?.toUpperCase() || '#1F1F1F'}
              </span>
            </div>
            
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t('preferences.presets')}</span>
              <div className="flex wrap gap-2">
                {[
                  { name: t('preferences.preset_graphite'), color: '#1F1F1F' },
                  { name: t('preferences.color_blue'), color: '#2563eb' },
                  { name: t('preferences.color_green'), color: '#16a34a' },
                  { name: t('preferences.color_red'), color: '#dc2626' },
                  { name: t('preferences.color_orange'), color: '#d97706' },
                  { name: t('preferences.color_purple'), color: '#7c3aed' }
                ].map((item) => (
                  <button
                    key={item.color}
                    onClick={() => updateDisplayPreferences({ accentColor: item.color })}
                    className={`group relative w-8 h-8 rounded-full border border-slate-200 transition-all hover:scale-110 ${displayPrefs.accentColor === item.color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'opacity-80 hover:opacity-100'}`}
                    style={{ backgroundColor: item.color }}
                    title={item.name}
                  >
                    {displayPrefs.accentColor === item.color && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PreferencesSection>
  );
};

