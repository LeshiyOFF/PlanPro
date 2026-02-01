import React, { ReactNode, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import type { StoreExtendedAppState } from '../store/appStore';

// Re-export useAppStore for convenience
export { useAppStore } from '../store/appStore';

interface AppStoreProviderProps {
  children: ReactNode;
  initialState?: Partial<StoreExtendedAppState>;
}

export const AppStoreProvider: React.FC<AppStoreProviderProps> = ({ 
  children, 
  initialState 
}) => {
  const initializeStore = useAppStore((state) => state.initializeStore);
  const clearNotification = useAppStore((state) => state.clearNotification);
  const notification = useAppStore((state) => state.ui.notifications[0] ?? null);

  // Initialize store with initial state if provided
  useEffect(() => {
    if (initialState) {
      initializeStore(initialState);
    }
  }, [initializeStore, initialState]);

  // Auto-clear notification after 5 seconds
  useEffect(() => {
    if (!notification) return undefined;
    const timer = setTimeout(() => {
      clearNotification();
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification, clearNotification]);

  // Handle window before unload to save state if needed
  useEffect(() => {
    const handleBeforeUnload = (): void => {
      const state = useAppStore.getState();
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
  initialState?: Partial<StoreExtendedAppState>
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
export const useInitializeAppStore = (initialState?: Partial<StoreExtendedAppState>) => {
  const initializeStore = useAppStore((state) => state.initializeStore);

  useEffect(() => {
    initializeStore(initialState);
  }, [initializeStore, initialState]);
};

// Export types for external usage
export type { AppStoreProviderProps };

