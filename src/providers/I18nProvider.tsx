import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPreferencesService } from '@/components/userpreferences/services/UserPreferencesService';
import { PreferencesCategory } from '@/components/userpreferences/interfaces/UserPreferencesInterfaces';

interface I18nProviderProps {
  children: React.ReactNode;
}

/**
 * Провайдер для синхронизации i18next с настройками пользователя.
 * Слушает изменения в UserPreferencesService и обновляет язык приложения.
 */
export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const service = UserPreferencesService.getInstance();

  useEffect(() => {
    // 1. Инициализация языка при монтировании
    const generalPrefs = service.getGeneralPreferences();
    const currentLang = generalPrefs.language || 'ru-RU';
    
    // Преобразуем ru-RU -> ru, en-US -> en для i18next
    const langCode = currentLang.split('-')[0];
    if (i18n.language !== langCode) {
      i18n.changeLanguage(langCode);
    }

    // 2. Подписка на изменения настроек
    const unsubscribe = service.subscribe((event) => {
      if (
        event.key === 'load' || 
        event.key === 'import' || 
        (event.category === PreferencesCategory.GENERAL && event.key === 'general')
      ) {
        const prefs = (event.key === 'load' || event.key === 'import') 
          ? event.newValue.general 
          : event.newValue;
          
        const newLang = prefs?.language;
        if (newLang) {
          const newLangCode = newLang.split('-')[0];
          if (i18n.language !== newLangCode) {
            i18n.changeLanguage(newLangCode);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [i18n]);

  return <>{children}</>;
};

