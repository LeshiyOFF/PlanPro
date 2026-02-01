import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode;
  /** Элемент или функция (error, reset) => ReactNode для отображения при ошибке */
  fallback?: ReactNode | ((error: Error | undefined, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary компонент для отлова ошибок рендеринга
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.handleReset)
        }
        return this.props.fallback
      }

      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#fff5f5',
          border: '1px solid #fed7d7',
          borderRadius: '8px',
          margin: '20px',
        }}>
          <h2 style={{ color: '#e53e3e', marginBottom: '15px' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#742a2a', marginBottom: '20px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '10px 20px',
              backgroundColor: '#e53e3e',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

