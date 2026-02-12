import { Component, ErrorInfo, ReactNode } from 'react'
import { logger } from '@/utils/logger'
import { SentryService } from '@/services/SentryService'

interface Props {
  children: ReactNode
  viewName: string
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error Boundary для отдельных View с graceful degradation.
 * Изолирует ошибки конкретного представления, не ломая остальное приложение.
 * 
 * Следует принципам SOLID:
 * - Single Responsibility: только обработка ошибок View
 * - Open/Closed: расширяется через props.fallback
 * 
 * @example
 * <ViewErrorBoundary viewName="Диаграмма Ганта">
 *   <GanttView />
 * </ViewErrorBoundary>
 */
export class ViewErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const viewName = this.props.viewName

    this.logError(viewName, error, errorInfo)
    this.captureToSentry(viewName, error, errorInfo)
    this.trackAnalytics(viewName, error)
    
    this.props.onError?.(error, errorInfo)
  }

  private logError(viewName: string, error: Error, errorInfo: ErrorInfo): void {
    logger.error(`[ViewError] ${viewName} crashed:`, {
      view: viewName,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })
  }

  private captureToSentry(viewName: string, error: Error, errorInfo: ErrorInfo): void {
    try {
      const sentryService = SentryService.getInstance()
      if (sentryService.isInitialized()) {
        sentryService.captureException(error, {
          tags: {
            view: viewName,
            errorType: 'view_crash',
          },
          context: 'ViewErrorBoundary',
          extra: {
            componentStack: errorInfo.componentStack || 'N/A',
          },
        })
      }
    } catch (e) {
      logger.warn('Sentry capture failed in ViewErrorBoundary')
    }
  }

  private trackAnalytics(viewName: string, error: Error): void {
    const win = window as Window & { analytics?: { track: (event: string, props: object) => void } }
    if (win.analytics) {
      win.analytics.track('view_error', {
        view: viewName,
        error: error.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      })
    }
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined })
    logger.info(`[ViewError] ${this.props.viewName} retry initiated`)
  }

  private renderFallback(): ReactNode {
    if (this.props.fallback) {
      return this.props.fallback
    }

    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-600">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-slate-200 mb-2">
          Ошибка: {this.props.viewName}
        </h2>
        <p className="text-slate-400 mb-2 text-center max-w-md">
          Произошла ошибка при отображении этого представления.
        </p>
        <p className="text-emerald-400 mb-6 text-center max-w-md font-semibold">
          ✓ Другие части приложения продолжают работать
        </p>
        <button
          onClick={this.handleRetry}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-400 hover:to-emerald-500 transition-all duration-200 shadow-lg hover:shadow-emerald-500/20"
        >
          Попробовать снова
        </button>
        <details className="mt-6 text-left text-xs text-slate-500 max-w-md">
          <summary className="cursor-pointer hover:text-slate-400">
            Техническая информация
          </summary>
          <pre className="mt-2 p-3 bg-slate-800/50 rounded-lg overflow-auto max-h-40 border border-slate-700">
            {this.state.error?.stack}
          </pre>
        </details>
      </div>
    )
  }

  public override render(): ReactNode {
    if (this.state.hasError) {
      return this.renderFallback()
    }

    return this.props.children
  }
}
