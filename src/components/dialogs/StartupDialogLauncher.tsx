import React, { useEffect, useRef } from 'react';
import { useDialogContext } from './DialogContext';
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences';
import { logger } from '@/utils/logger';

/**
 * Компонент для автоматического запуска диалогов при старте приложения
 * Отвечает за логику показа WelcomeDialog
 */
export const StartupDialogLauncher: React.FC = () => {
  const { openDialog } = useDialogContext();
  const { preferences, isReady } = useUserPreferences();
  const launchedRef = useRef(false);

  useEffect(() => {
    // Ждем, пока настройки будут загружены с диска
    if (!isReady) return;

    // Предотвращаем повторный запуск в StrictMode или при ререндерах
    if (launchedRef.current) return;

    const showWelcome = preferences.display.showWelcomeScreen;
    
    if (showWelcome) {
      logger.info('Launching WelcomeDialog at startup');
      // Небольшая задержка, чтобы UI успел отрисоваться
      const timer = setTimeout(() => {
        openDialog('welcome');
      }, 500);
      
      launchedRef.current = true;
      return () => clearTimeout(timer);
    }
  }, [openDialog, preferences.display.showWelcomeScreen, isReady]);

  return null; // Визуально ничего не рендерит
};
