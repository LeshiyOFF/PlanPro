import React, { createContext, useContext, useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { UserPreferencesService } from '@/components/userpreferences/services/UserPreferencesService';
import { ThemeApplier } from '@/components/userpreferences/services/ThemeApplier';
import { PreferencesCategory } from '@/components/userpreferences/interfaces/UserPreferencesInterfaces';

/**
 * Интерфейс состояния контекста анимаций
 */
interface AnimationContextState {
  animationEnabled: boolean;
}

/**
 * Контекст для управления глобальными анимациями
 */
const AnimationContext = createContext<AnimationContextState>({
  animationEnabled: true,
});

/**
 * Провайдер анимаций
 * Управляет CSS-переходами и анимациями Framer Motion на основе пользовательских настроек
 */
export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [animationEnabled, setAnimationEnabled] = useState(true);

  useEffect(() => {
    const service = UserPreferencesService.getInstance();
    const displayPrefs = service.getDisplayPreferences();
    
    // Первичная инициализация при монтировании
    const currentEnabled = displayPrefs.animationEnabled;
    setAnimationEnabled(currentEnabled);
    ThemeApplier.applyAnimations(currentEnabled);

    // Подписка на изменения настроек отображения
    const unsubscribe = service.subscribe((event) => {
      if (
        event.key === 'load' || 
        event.key === 'import' || 
        (event.category === PreferencesCategory.DISPLAY && (event.key === 'display' || event.key === 'general'))
      ) {
        const raw = event.newValue;
        if (raw == null || typeof raw !== 'object') return;
        const prefs = (event.key === 'load' || event.key === 'import') 
          ? (raw as { display?: { animationEnabled?: boolean } }).display 
          : raw as { animationEnabled?: boolean };
          
        const enabled = prefs?.animationEnabled;
        if (enabled !== undefined) {
          setAnimationEnabled(enabled);
          ThemeApplier.applyAnimations(enabled);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AnimationContext.Provider value={{ animationEnabled }}>
      {/* 
        MotionConfig позволяет глобально управлять поведением Framer Motion.
        Если анимации отключены, мы устанавливаем duration: 0 для всех переходов.
      */}
      <MotionConfig transition={animationEnabled ? undefined : { duration: 0 }}>
        {children}
      </MotionConfig>
    </AnimationContext.Provider>
  );
};

/**
 * Хук для доступа к состоянию анимаций
 */
export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};

