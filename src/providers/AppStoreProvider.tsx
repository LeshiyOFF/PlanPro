import React, { ReactNode, useEffect } from 'react';
import type { ExtendedAppState } from '../types/Master_Functionality_Catalog';
import { useAppStore } from '../store/appStore';

// Re-export useAppStore for convenience
export { useAppStore } from '../store/appStore';

interface AppStoreProviderProps {
  children: ReactNode;
  initialState?: Partial<ExtendedAppState>;
}

export const AppStoreProvider: React.FC<AppStoreProviderProps> = ({ 
  children, 
  initialState 
}) => {
  const initializeStore = useAppStore((state) => state.initializeStore);
  const clearNotification = useAppStore((state) => state.clearNotification);
  const notification = useAppStore((state) => state.ui.notification);

  // Initialize store with initial state if provided
  useEffect(() => {
    if (initialState) {
      initializeStore(initialState);
    }
  }, [initializeStore, initialState]);

  // Auto-clear notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, clearNotification]);

  // Handle window before unload to save state if needed
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Here you can persist state to localStorage if needed
      const state = useAppStore.getState();
      // Persist state to localStorage
      localStorage.setItem('appState', JSON.stringify(state));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return <>{children}</>;
};

// Higher-order component for easy integration
export const withAppStore = <P extends object>(
  Component: React.ComponentType<P>,
  initialState?: Partial<AppState>
) => {
  const WrappedComponent = (props: P) => (
    <AppStoreProvider initialState={initialState}>
      <Component {...props} />
    </AppStoreProvider>
  );

  WrappedComponent.displayName = `withAppStore(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for store initialization outside React
export const useInitializeAppStore = (initialState?: Partial<AppState>) => {
  const initializeStore = useAppStore((state) => state.initializeStore);

  useEffect(() => {
    initializeStore(initialState);
  }, [initializeStore, initialState]);
};

// Export types for external usage
export type { AppStoreProviderProps };
