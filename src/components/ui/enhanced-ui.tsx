/**
 * Enhanced UI components for modern interface
 * Part of Canvas Gantt Chart System
 */

import React from 'react';

export interface EnhancedToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onClose?: () => void;
}

export const EnhancedToast: React.FC<EnhancedToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose
}) => {
  React.useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return '#4A4A4A';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return 'hsl(var(--primary))';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: getBackgroundColor(),
        color: 'white',
        padding: '12px 16px',
        borderRadius: '6px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        maxWidth: '300px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
              marginLeft: '12px'
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'hsl(var(--primary))'
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 32;
      default: return 24;
    }
  };

  return (
    <div
      style={{
        width: getSize(),
        height: getSize(),
        border: `2px solid ${color}20`,
        borderTop: `2px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}
    />
  );
};

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  size = 'medium'
}) => {
  const getStyles = () => {
    const baseStyles = {
      border: 'none',
      borderRadius: '6px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
      padding: size === 'small' ? '6px 12px' : size === 'large' ? '12px 24px' : '8px 16px',
      opacity: disabled ? 0.6 : 1
    };

    switch (variant) {
      case 'secondary':
        return { ...baseStyles, backgroundColor: '#6b7280', color: 'white' };
      case 'danger':
        return { ...baseStyles, backgroundColor: '#ef4444', color: 'white' };
      default:
        return { ...baseStyles, backgroundColor: 'hsl(var(--primary))', color: 'white' };
    }
  };

  return (
    <button onClick={onClick} disabled={disabled} style={getStyles()}>
      {children}
    </button>
  );
};

