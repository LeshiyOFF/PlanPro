import React, { useEffect, useRef } from 'react';
import { useTypedDialog } from './context/TypedDialogContext';
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences';
import { logger } from '@/utils/logger';

/**
 * Компонент для автоматического запуска диалогов при старте приложения
 * Отвечает за логику показа WelcomeDialog
 */
export const StartupDialogLauncher: React.FC = () => {
  const { openDialog } = useTypedDialog();
  const { preferences, isReady } = useUserPreferences();
  const launchedRef = useRef(false);

  useEffect(() => {
    // Ждем, пока настройки будут загружены с диска
    if (!isReady) return undefined;

    // Предотвращаем повторный запуск в StrictMode или при ререндерах
    if (launchedRef.current) return undefined;

    const showWelcome = preferences.display.showWelcomeScreen;

    if (showWelcome) {
      logger.info('Launching WelcomeDialog at startup');
      // Небольшая задержка, чтобы UI успел отрисоваться
      const timer = setTimeout(() => {
        openDialog('welcome', { showOnStartup: preferences.display.showWelcomeScreen });
      }, 500);

      launchedRef.current = true;
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [openDialog, preferences.display.showWelcomeScreen, isReady]);

  return null; // Визуально ничего не рендерит
};

