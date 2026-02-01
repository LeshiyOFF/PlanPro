import React from 'react'

interface ErrorAlertProps {
  error: string | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  type?: 'error' | 'warning' | 'info';
  title?: string;
}

/**
 * Компонент для отображения ошибок и предупреждений
 */
export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  onDismiss,
  onRetry,
  type = 'error',
  title,
}) => {
  if (!error) return null

  const getStyles = () => {
    switch (type) {
      case 'warning':
        return {
          backgroundColor: '#fffbeb',
          border: '1px solid #fbbf24',
          color: '#92400e',
          icon: '⚠️',
        }
      case 'info':
        return {
          backgroundColor: '#eff6ff',
          border: '1px solid hsl(var(--primary))',
          color: '#1e40af',
          icon: 'ℹ️',
        }
      default:
        return {
          backgroundColor: '#fef2f2',
          border: '1px solid #ef4444',
          color: '#991b1b',
          icon: '❌',
        }
    }
  }

  const styles = getStyles()

  return (
    <div style={{
      backgroundColor: styles.backgroundColor,
      border: styles.border,
      borderRadius: '8px',
      padding: '16px',
      margin: '10px 0',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontSize: '20px', flexShrink: 0 }}>
        {styles.icon}
      </div>

      <div style={{ flex: 1 }}>
        {title && (
          <h4 style={{
            margin: '0 0 8px 0',
            color: styles.color,
            fontSize: '16px',
            fontWeight: '600',
          }}>
            {title}
          </h4>
        )}

        <p style={{
          margin: '0 0 12px 0',
          color: styles.color,
          fontSize: '14px',
          lineHeight: '1.5',
        }}>
          {error}
        </p>

        <div style={{ display: 'flex', gap: '8px' }}>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                padding: '6px 12px',
                backgroundColor: styles.color,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              style={{
                padding: '6px 12px',
                backgroundColor: 'transparent',
                color: styles.color,
                border: `1px solid ${styles.color}`,
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

