import React, { Component, ErrorInfo, ReactNode } from 'react';
import { SentryService } from '@/services/SentryService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  tags?: Record<string, string>;
  userContext?: Record<string, any>;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Sentry Error Boundary для интеграции с Sentry
 * Следует SOLID принципу Dependency Inversion
 */
export class SentryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const sentryService = SentryService.getInstance();

    // Установка тегов и контекста
    if (this.props.tags) {
      sentryService.setTags(this.props.tags);
    }

    if (this.props.userContext) {
      Object.entries(this.props.userContext).forEach(([key, value]) => {
        sentryService.setTags({ [`user.${key}`]: value });
      });
    }

    // Отправка ошибки в Sentry с детальной информацией
    sentryService.captureException(error, {
      react: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        errorBoundaryName: this.constructor.name,
      },
      props: {
        hasTags: !!this.props.tags,
        hasUserContext: !!this.props.userContext,
        hasCustomHandler: !!this.props.onError,
      },
    });

    // Вызов кастомного обработчика если предоставлен
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Логирование для разработки
    if (process.env.NODE_ENV === 'development') {
      console.error('SentryErrorBoundary caught an error:', {
        error,
        errorInfo,
        tags: this.props.tags,
        userContext: this.props.userContext,
      });
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Сброс ошибки при смене children
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback по умолчанию с информацией об ошибке
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
            <div className="text-center">
              <div className="text-6xl text-red-500 mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Ошибка приложения
              </h1>
              <p className="text-gray-600 mb-4">
                Произошла непредвиденная ошибка. 
                Информация об ошибке отправлена в систему мониторинга.
              </p>
              
              <details className="text-left text-sm text-gray-500">
                <summary className="cursor-pointer mb-2">Техническая информация</summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <strong>Ошибка:</strong>
                    <p className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono">
                      {this.state.error?.message}
                    </p>
                  </div>
                  
                  {this.props.tags && (
                    <div>
                      <strong>Теги:</strong>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs">
                        {JSON.stringify(this.props.tags, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
              
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

