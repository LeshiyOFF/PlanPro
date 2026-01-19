import { useCallback, useEffect } from 'react';
import { StatusBarService } from '../services/StatusBarService';
import { 
  IStatusBarService, 
  IStatusBarState, 
  StatusBarMessageType 
} from '../interfaces/StatusBarInterfaces';

/**
 * Хук для работы с статусбаром
 * Предоставляет удобный API для взаимодействия со статусбаром
 */
export const useStatusBar = (): IStatusBarService => {
  const statusBarService = StatusBarService.getInstance();

  const showMessage = useCallback((
    text: string, 
    type?: StatusBarMessageType, 
    timeout?: number
  ) => {
    statusBarService.showMessage(text, type, timeout);
  }, [statusBarService]);

  const showWarning = useCallback((text: string) => {
    statusBarService.showWarning(text);
  }, [statusBarService]);

  const showError = useCallback((text: string) => {
    statusBarService.showError(text);
  }, [statusBarService]);

  const showSuccess = useCallback((text: string) => {
    statusBarService.showSuccess(text);
  }, [statusBarService]);

  const showProgress = useCallback((text: string) => {
    statusBarService.showProgress(text);
  }, [statusBarService]);

  const clearMessage = useCallback(() => {
    statusBarService.clearMessage();
  }, [statusBarService]);

  const updateZoom = useCallback((zoom: number) => {
    statusBarService.updateZoom(zoom);
  }, [statusBarService]);

  const updateSelection = useCallback((selection: string) => {
    statusBarService.updateSelection(selection);
  }, [statusBarService]);

  const setReady = useCallback((ready: boolean) => {
    statusBarService.setReady(ready);
  }, [statusBarService]);

  const toggleVisibility = useCallback(() => {
    statusBarService.toggleVisibility();
  }, [statusBarService]);

  const isVisible = useCallback(() => {
    return statusBarService.isVisible();
  }, [statusBarService]);

  return {
    showMessage,
    showWarning,
    showError,
    showSuccess,
    showProgress,
    clearMessage,
    updateZoom,
    updateSelection,
    setReady,
    toggleVisibility,
    isVisible,
    addSection: statusBarService.addSection.bind(statusBarService),
    removeSection: statusBarService.removeSection.bind(statusBarService)
  };
};

/**
 * Хук для подписки на состояние статусбара
 */
export const useStatusBarState = (): IStatusBarState => {
  const statusBarService = StatusBarService.getInstance();
  const [state, setState] = React.useState(statusBarService.getState());

  useEffect(() => {
    const unsubscribe = statusBarService.subscribe(setState);
    return unsubscribe;
  }, [statusBarService]);

  return state;
};

