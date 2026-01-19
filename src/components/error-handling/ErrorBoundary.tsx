import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary для обработки ошибок рендеринга
 * Следует SOLID принципу Single Responsibility
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Error Boundary caught an error:', { error, errorInfo });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Здесь можно добавить интеграцию с Sentry или другим error tracking
    if (window.sentry) {
      window.sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
            <div className="text-center">
              <div className="text-6xl text-red-500 mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Что-то пошло не так
              </h1>
              <p className="text-gray-600 mb-4">
                Произошла непредвиденная ошибка. Попробуйте обновить страницу.
              </p>
              <details className="text-left text-sm text-gray-500">
                <summary className="cursor-pointer">Техническая информация</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {this.state.error?.stack}
                </pre>
              </details>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Обновить страницу
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
