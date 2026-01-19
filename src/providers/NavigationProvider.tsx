import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ViewType, ViewSettings } from '@/types/ViewTypes';
import { ViewRouteManager } from '@/services/ViewRouteManager';

/**
 * Контекст для навигации представлений
 */
interface NavigationContextType {
  currentView: ViewType | null;
  currentSettings: Partial<ViewSettings>;
  navigateToView: (viewType: ViewType, settings?: Partial<ViewSettings>) => void;
  updateViewSettings: (settings: Partial<ViewSettings>) => void;
  canNavigateToView: (viewType: ViewType) => boolean;
  availableViews: { type: ViewType; title: string; path: string; }[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

/**
 * Navigation Provider
 * Следует SOLID принципу Single Responsibility
 */
export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const routeManager = ViewRouteManager.getInstance();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<ViewType | null>(null);
  const [currentSettings, setCurrentSettings] = useState<Partial<ViewSettings>>({});

  useEffect(() => {
    // Инициализация текущего представления из URL
    const path = window.location.pathname;
    const views = routeManager.getAvailableViews();
    
    const matchedView = views.find(view => view.path === path);
    if (matchedView) {
      setCurrentView(matchedView.type);
      const savedSettings = routeManager.getViewSettings(matchedView.type);
      setCurrentSettings(savedSettings);
    }
  }, []);

  const navigateToView = (viewType: ViewType, settings?: Partial<ViewSettings>) => {
    try {
      const viewConfig = routeManager.getViewConfig(viewType);
      if (viewConfig) {
        // Обновляем URL в React Router
        navigate(viewConfig.path);
        
        routeManager.navigateToView(viewType, settings);
        setCurrentView(viewType);
        
        if (settings) {
          const mergedSettings = { ...currentSettings, ...settings };
          setCurrentSettings(mergedSettings);
          routeManager.saveViewSettings(viewType, mergedSettings);
        } else {
          const savedSettings = routeManager.getViewSettings(viewType);
          setCurrentSettings(savedSettings);
        }
      }
    } catch (error) {
      // Error handling without logging
    }
  };

  const updateViewSettings = (settings: Partial<ViewSettings>) => {
    if (currentView) {
      const mergedSettings = { ...currentSettings, ...settings };
      setCurrentSettings(mergedSettings);
      routeManager.saveViewSettings(currentView, mergedSettings);
    }
  };

  const canNavigateToView = (viewType: ViewType): boolean => {
    return routeManager.canNavigateToView(viewType);
  };

  const availableViews = routeManager.getAvailableViews().map(view => ({
    type: view.type,
    title: view.title,
    path: view.path
  }));

  const value: NavigationContextType = {
    currentView,
    currentSettings,
    navigateToView,
    updateViewSettings,
    canNavigateToView,
    availableViews
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

/**
 * Hook для использования навигации
 */
export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

