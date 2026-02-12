import React, { useCallback } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { logger } from '@/utils/logger'
import { ErrorBoundary, GeneralErrorFallback, StoreErrorFallback } from '@/components/error-handling'
import { SentryProvider } from '@/providers/SentryProvider'
import { ReactProfilerProvider } from '@/providers/ReactProfilerProvider'
import { NavigationProvider } from '@/providers/NavigationProvider'
import { EventFlowProvider } from '@/providers/EventFlowProvider'
import { ActionProvider } from '@/providers/ActionProvider'
import { AnimationProvider } from '@/providers/AnimationProvider'
import { TooltipProvider } from '@/providers/TooltipProvider'
import { I18nProvider } from '@/providers/I18nProvider'
import { useAppInitialization } from '@/hooks/useAppInitialization'
import { NavigationRouter } from '@/components/navigation'
import { ContextMenuProvider } from '@/presentation/contextmenu/providers/ContextMenuProvider'
import { DialogProvider, DialogManager } from '@/components/dialogs'
import { StartupGate } from '@/components/startup/StartupGate'
import { TypedDialogProvider, initializeTypedDialogs } from '@/components/dialogs/typed'
import { HotkeyProvider } from '@/components/hotkey'
import { PromptProvider } from '@/providers/PromptProvider'

// Инициализация типизированных диалогов
initializeTypedDialogs()

import { UnsavedChangesGuard } from '@/components/guards/UnsavedChangesGuard'
import { ViewType, EventType } from '@/types/Master_Functionality_Catalog'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { AppStoreProvider } from '@/providers/AppStoreProvider'
import { ProjectProvider } from '@/providers/ProjectProvider'

/**
 * Главный компонент приложения
 */
const App: React.FC = () => {
  const { handleGlobalError } = useAppInitialization()

  /**
   * Обработчик изменения представления
   */
  const handleViewChange = useCallback(async (viewType: ViewType) => {
    logger.info('View changed', { type: EventType.VIEW_CHANGED, data: { viewType } })
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
                  <ErrorBoundary fallback={(error: Error, reset: () => void) => <StoreErrorFallback error={error} resetError={reset} />}>
                    <EventFlowProvider>
                      <NavigationProvider>
                        <ActionProvider>
                          <ContextMenuProvider>
                            <TypedDialogProvider>
                              <DialogProvider>
                                <PromptProvider>
                                  <HotkeyProvider enabled={true}>
                                    <TooltipProvider>
                                      <StartupGate>
                                        <ProjectProvider>
                                          <UnsavedChangesGuard />
                                          <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                            <NavigationRouter onViewChange={handleViewChange} />
                                          </div>
                                          <DialogManager>
                                            <Toaster />
                                          </DialogManager>
                                        </ProjectProvider>
                                      </StartupGate>
                                    </TooltipProvider>
                                  </HotkeyProvider>
                                </PromptProvider>
                              </DialogProvider>
                            </TypedDialogProvider>
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

