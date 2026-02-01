import React, { createContext, useContext, useEffect, useState } from 'react'
import { UserPreferencesService } from '@/components/userpreferences/services/UserPreferencesService';
import { ThemeApplier } from '@/components/userpreferences/services/ThemeApplier';
import { PreferencesCategory, Theme } from '@/components/userpreferences/interfaces/UserPreferencesInterfaces';

/**
 * Провайдер темы для приложения
 * Поддерживает светлую, темную и системную темы, а также динамический акцентный цвет
 */

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: Theme.SYSTEM,
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

/**
 * Провайдер темы для приложения
 * Поддерживает светлую, темную и системную темы
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = Theme.LIGHT,
  storageKey = 'projectlibre-ui-theme',
  ...props
}) => {
  const service = UserPreferencesService.getInstance();
  
  const [theme, setTheme] = useState<Theme>(() => {
    const prefs = service.getDisplayPreferences();
    return prefs.theme ?? (defaultTheme as Theme);
  })

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark', 'high-contrast')

    if (theme === 'system' || theme === 'auto') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
    } else if (theme === 'high_contrast') {
      root.classList.add('high-contrast')
    } else {
      root.classList.add(theme)
    }
    
    // После изменения основной темы обязательно переприменяем флаг высокой контрастности,
    // так как он может быть активен независимо от темы
    const prefs = service.getDisplayPreferences();
    ThemeApplier.applyHighContrast(prefs.highContrast);
  }, [theme])

  // Динамическое обновление настроек отображения из UserPreferencesService
  useEffect(() => {
    const displayPrefs = service.getDisplayPreferences();
    
    // Первичная инициализация при монтировании
    if (displayPrefs.accentColor) ThemeApplier.applyAccentColor(displayPrefs.accentColor);
    if (displayPrefs.fontSize) ThemeApplier.applyFontSize(displayPrefs.fontSize);
    if (displayPrefs.fontFamily) ThemeApplier.applyFontFamily(displayPrefs.fontFamily);
    ThemeApplier.applyHighContrast(displayPrefs.highContrast);

    // Подписываемся на изменения настроек отображения
    const unsubscribe = service.subscribe((event) => {
      // Обработка полной загрузки или обновления категории
      if (
        (event.key === 'load' || event.key === 'import') ||
        (event.category === PreferencesCategory.DISPLAY && (event.key === 'display' || event.key === 'general'))
      ) {
        const raw = event.newValue;
        if (raw == null || typeof raw !== 'object') return;
        const prefs = (event.key === 'load' || event.key === 'import')
          ? (raw as { display?: Record<string, string | number | boolean | undefined> }).display
          : raw as Record<string, string | number | boolean | undefined>;
        if (!prefs) return;
        
        if (typeof prefs.theme === 'string' && prefs.theme !== theme) {
          setTheme(prefs.theme as Theme);
        }
        if (typeof prefs.accentColor === 'string') ThemeApplier.applyAccentColor(prefs.accentColor);
        if (typeof prefs.fontSize === 'number') ThemeApplier.applyFontSize(prefs.fontSize);
        if (typeof prefs.fontFamily === 'string') ThemeApplier.applyFontFamily(prefs.fontFamily);
        if (typeof prefs.highContrast === 'boolean') {
          ThemeApplier.applyHighContrast(prefs.highContrast);
        }
      }
    });

    return () => unsubscribe();
  }, [theme])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      service.updateDisplayPreferences({ theme: newTheme });
      setTheme(newTheme);
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

/**
 * Хук для использования темы
 */
export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}

