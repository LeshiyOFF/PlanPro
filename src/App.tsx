import React, { useEffect, useCallback, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/components/layout/ViewLayout'
import { GanttView } from '@/components/views/GanttView'
import { NetworkView } from '@/components/views/NetworkView'
import { TaskUsageView } from '@/components/views/TaskUsageView'
import { ResourceUsageView } from '@/components/views/ResourceUsageView'
import { ProjectProvider } from '@/providers/ProjectProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { AppStoreProvider } from '@/providers/AppStoreProvider'
import { Toaster } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { logger } from '@/utils/logger'
import SimpleStoreDemo from '@/components/store/SimpleStoreDemo'
import { ErrorBoundary, RetryErrorBoundary, GeneralErrorFallback, StoreErrorFallback, NetworkErrorFallback } from '@/components/error-handling'
import { hotkeyStatusBarBridge } from '@/services/HotkeyStatusBarBridge'
import { SentryProvider, useSentry } from '@/providers/SentryProvider'
import { ReactProfilerProvider, PerformanceMetricsCollector } from '@/providers/ReactProfilerProvider'
import { NavigationProvider } from '@/providers/NavigationProvider'
import { EventFlowProvider } from '@/providers/EventFlowProvider'
import { ActionProvider } from '@/providers/ActionProvider'
import { AnimationProvider } from '@/providers/AnimationProvider'
import { TooltipProvider } from '@/providers/TooltipProvider'
import { I18nProvider } from '@/providers/I18nProvider'
import { useAppInitialization } from '@/hooks/useAppInitialization'
import { DevToolsProfiler } from '@/components/profiling'
import { NavigationRouter } from '@/components/navigation'
import { ContextMenuProvider } from '@/presentation/contextmenu/providers/ContextMenuProvider'
import { DialogProvider, DialogManager, StartupDialogLauncher } from '@/components/dialogs'
import { HotkeyProvider } from '@/components/hotkey'
import { LastProjectLoader } from '@/components/startup/LastProjectLoader'
import { UnsavedChangesGuard } from '@/components/guards/UnsavedChangesGuard'
import { useIpcService } from '@/hooks/useIpcService'
import { ViewType, EventType } from '@/types/Master_Functionality_Catalog'

/**
 * Главный компонент приложения
 */
const App: React.FC = () => {
  const { handleGlobalError } = useAppInitialization();
  const ipcService = useIpcService();

  /**
   * Обработчик изменения представления
   */
  const handleViewChange = useCallback(async (viewType: ViewType) => {
    logger.info('View changed', { type: EventType.VIEW_CHANGED, data: { viewType } })
    // Уведомление в консоль/лог достаточно для смены вью, 
    // убираем раздражающий showMessageBox при каждом клике
  }, [])

  // Инициализация Hotkey-StatusBar моста
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    import('@/services/HotkeyStatusBarBridge').then(({ hotkeyStatusBarBridge }) => {
      setTimeout(() => {
        if (!initializedRef.current) {
          try {
            hotkeyStatusBarBridge.initialize();
            initializedRef.current = true;
          } catch (e) { /* ignore */ }
        }
      }, 1000);
    });
  }, [])

  return (
    <ThemeProvider defaultTheme="light" storageKey="projectlibre-ui-theme">
      <I18nProvider>
        <AnimationProvider>
        <SentryProvider user={{ username: 'user' }} tags={{ component: 'App' }}>
          <ReactProfilerProvider config={{ enabled: process.env.NODE_ENV === 'development' }}>
            <ErrorBoundary
              onError={handleGlobalError}
              fallback={<GeneralErrorFallback error={new Error()} resetError={() => window.location.reload()} />}
            >
              <AppStoreProvider>
                <ErrorBoundary fallback={(error: Error, reset: any) => <StoreErrorFallback error={error} resetError={reset} />}>
                  <EventFlowProvider>
                    <NavigationProvider>
                      <ActionProvider>
                        <ContextMenuProvider>
                          <DialogProvider>
                            <StartupDialogLauncher />
                            <HotkeyProvider enabled={true}>
                              <TooltipProvider>
                                <ProjectProvider>
                                  <LastProjectLoader />
                                  <UnsavedChangesGuard />
                                  <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                    <NavigationRouter onViewChange={handleViewChange} />
                                  </div>
                                  <DialogManager>
                                    <Toaster />
                                    <DevToolsProfiler />
                                  </DialogManager>
                                </ProjectProvider>
                              </TooltipProvider>
                            </HotkeyProvider>
                          </DialogProvider>
                        </ContextMenuProvider>
                      </ActionProvider>
                    </NavigationProvider>
                  </EventFlowProvider>
                </ErrorBoundary>
              </AppStoreProvider>
            </ErrorBoundary>
          </ReactProfilerProvider>
        </SentryProvider>
      </AnimationProvider>
    </I18nProvider>
  </ThemeProvider>
)
}

export default App

