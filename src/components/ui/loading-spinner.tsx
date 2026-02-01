import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  overlay?: boolean;
  color?: string;
}

/**
 * Универсальный компонент для отображения загрузки
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  overlay = false,
  color = '#007acc'
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          width: '20px',
          height: '20px',
          borderWidth: '2px'
        };
      case 'large':
        return {
          width: '40px',
          height: '40px',
          borderWidth: '4px'
        };
      default:
        return {
          width: '24px',
          height: '24px',
          borderWidth: '3px'
        };
    }
  };

  const spinnerStyles = {
    border: `${getSizeStyles().borderWidth} solid rgba(0, 0, 0, 0.1)`,
    borderTop: `${getSizeStyles().borderWidth} solid ${color}`,
    borderRadius: '50%',
    width: getSizeStyles().width,
    height: getSizeStyles().height,
    animation: 'spin 1s linear infinite'
  };

  const containerStyles = overlay ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  } : {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '10px'
  };

  return (
    <div style={containerStyles}>
      <div style={spinnerStyles} />
      {message && (
        <div style={{
          color: overlay ? 'white' : color,
          fontSize: '14px',
          fontWeight: '500',
          marginTop: '10px'
        }}>
          {message}
        </div>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

