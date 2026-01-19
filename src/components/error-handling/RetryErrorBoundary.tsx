import React, { Component, ReactNode, ErrorInfo } from 'react';
import { NetworkErrorFallback } from './NetworkErrorFallback';
import { GeneralErrorFallback } from './GeneralErrorFallback';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
  maxRetries?: number;
}

interface State {
  hasError: boolean;
  error?: Error;
  retries: number;
}

/**
 * Error Boundary с retry логикой для сетевых операций
 * Следует SOLID принципу Open/Closed
 */
export class RetryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retries: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { handleError } = useErrorHandler();
    
    this.setState(prev => ({
      error,
      retries: prev.retries + 1
    }));

    handleError(error, 'RetryErrorBoundary');

    // Auto retry если позволяет и не превышен лимит
    if (this.props.onRetry && 
        this.state.retries < (this.props.maxRetries || 3)) {
      setTimeout(() => {
        this.props.onRetry();
      }, 1000 * this.state.retries);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const isNetworkError = this.state.error?.message.includes('fetch') ||
                             this.state.error?.message.includes('network');

      if (this.props.fallback) {
        return this.props.fallback;
      }

      if (isNetworkError) {
        return (
          <NetworkErrorFallback
            error={this.state.error!}
            resetError={() => this.setState({ hasError: false, retries: 0 })}
            retry={this.props.onRetry}
          />
        );
      }

      return (
        <GeneralErrorFallback
          error={this.state.error!}
          resetError={() => this.setState({ hasError: false, retries: 0 })}
          title={`Ошибка загрузки данных (попытка ${this.state.retries})`}
          description="Не удалось загрузить данные. Проверьте подключение и попробуйте еще раз."
        />
      );
    }

    return this.props.children;
  }
}

