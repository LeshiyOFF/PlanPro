import { useEffect } from 'react';
import { ProjectAutoSaveService } from '../services/ProjectAutoSaveService';

/**
 * Хук для инициализации сервиса автосохранения.
 * Связывает жизненный цикл сервиса с жизненным циклом приложения.
 */
export const useAutoSave = () => {
  useEffect(() => {
    const autoSaveService = ProjectAutoSaveService.getInstance();
    autoSaveService.start();

    return () => {
      autoSaveService.stop();
    };
  }, []);
};

