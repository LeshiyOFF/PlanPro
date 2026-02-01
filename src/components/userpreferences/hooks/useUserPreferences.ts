import { useCallback, useEffect, useState } from 'react';
import { UserPreferencesService } from '../services/UserPreferencesService';
import { 
  IUserPreferences, 
  IGeneralPreferences, 
  IDisplayPreferences, 
  IEditingPreferences, 
  ICalculationPreferences, 
  ISecurityPreferences,
  PreferencesCategory,
  IPreferencesChangeEvent,
  ISchedulePreferences,
  ICalendarPreferences,
  IGanttPreferences
} from '../interfaces/UserPreferencesInterfaces';

/**
 * Хук для работы с пользовательскими настройками
 * Предоставляет удобный React API для сервиса UserPreferencesService
 */
export const useUserPreferences = () => {
  const [isReady, setIsReady] = useState(() => {
    return UserPreferencesService.getInstance().isReady();
  });
  const [preferences, setPreferences] = useState<IUserPreferences>(() => {
    const service = UserPreferencesService.getInstance();
    return service.getPreferences();
  });

  // Подписка на изменения настроек
  useEffect(() => {
    const service = UserPreferencesService.getInstance();
    
    // Если сервис еще не инициализирован, дожидаемся
    if (!service.isReady()) {
      service.ensureInitialized().then(() => {
        setIsReady(true);
        setPreferences(service.getPreferences());
      });
    }

    const unsubscribe = service.subscribe((event: IPreferencesChangeEvent) => {
      setPreferences(currentPreferences => {
        // Если это полная перезагрузка (загрузка с диска, импорт или сброс настроек)
        if (event.key === 'load' || event.key === 'import' || event.key === 'reset') {
          const val = event.newValue;
          if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
            return { ...val } as IUserPreferences;
          }
          return currentPreferences;
        }

        // Если это обновление конкретной категории
        const newPreferences = { ...currentPreferences };
        const categoryKey = event.key as keyof IUserPreferences;
        if (Object.prototype.hasOwnProperty.call(newPreferences, categoryKey)) {
          (newPreferences as Record<keyof IUserPreferences, IUserPreferences[keyof IUserPreferences]>)[categoryKey] = event.newValue as IUserPreferences[keyof IUserPreferences];
        }
        return newPreferences;
      });
    });

    return unsubscribe;
  }, []);

  const updateGeneralPreferences = useCallback(async (updates: Partial<IGeneralPreferences>) => {
    const service = UserPreferencesService.getInstance();
    await service.updateGeneralPreferences(updates);
  }, []);

  const updateDisplayPreferences = useCallback(async (updates: Partial<IDisplayPreferences>) => {
    const service = UserPreferencesService.getInstance();
    await service.updateDisplayPreferences(updates);
  }, []);

  const updateEditingPreferences = useCallback(async (updates: Partial<IEditingPreferences>) => {
    const service = UserPreferencesService.getInstance();
    await service.updateEditingPreferences(updates);
  }, []);

  const updateCalculationPreferences = useCallback(async (updates: Partial<ICalculationPreferences>) => {
    const service = UserPreferencesService.getInstance();
    await service.updateCalculationPreferences(updates);
  }, []);

  const updateSecurityPreferences = useCallback(async (updates: Partial<ISecurityPreferences>) => {
    const service = UserPreferencesService.getInstance();
    await service.updateSecurityPreferences(updates);
  }, []);

  const updateSchedulePreferences = useCallback(async (updates: Partial<ISchedulePreferences>) => {
    const service = UserPreferencesService.getInstance();
    await service.updateSchedulePreferences(updates);
  }, []);

  const updateCalendarPreferences = useCallback(async (updates: Partial<ICalendarPreferences>) => {
    const service = UserPreferencesService.getInstance();
    await service.updateCalendarPreferences(updates);
  }, []);

  const updateGanttPreferences = useCallback(async (updates: Partial<IGanttPreferences>) => {
    const service = UserPreferencesService.getInstance();
    await service.updateGanttPreferences(updates);
  }, []);

  const resetToDefaults = useCallback(async (category?: PreferencesCategory) => {
    const service = UserPreferencesService.getInstance();
    await service.resetToDefaults(category);
  }, []);

  const flush = useCallback(async () => {
    const service = UserPreferencesService.getInstance();
    await service.flush();
  }, []);

  const exportPreferences = useCallback(() => {
    const service = UserPreferencesService.getInstance();
    return service.exportPreferences();
  }, []);

  const importPreferences = useCallback(async (data: string) => {
    const service = UserPreferencesService.getInstance();
    await service.importPreferences(data);
  }, []);

  return {
    preferences,
    isReady,
    updateGeneralPreferences,
    updateDisplayPreferences,
    updateEditingPreferences,
    updateCalculationPreferences,
    updateSecurityPreferences,
    updateSchedulePreferences,
    updateCalendarPreferences,
    updateGanttPreferences,
    resetToDefaults,
    flush,
    exportPreferences,
    importPreferences
  };
};

