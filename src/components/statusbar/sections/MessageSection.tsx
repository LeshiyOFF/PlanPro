import React from 'react';
import { IStatusBarMessage, StatusBarMessageType } from '../interfaces/StatusBarInterfaces';

/**
 * Секция сообщений статусбара
 * Отображает временные сообщения
 */
interface MessageSectionProps {
  message: IStatusBarMessage | null;
}

export const MessageSection: React.FC<MessageSectionProps> = ({ message }) => {
  if (!message) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Готов</span>
      </div>
    );
  }

  const getMessageIcon = (type: StatusBarMessageType): string => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'progress':
        return '⏳';
      default:
        return 'ℹ️';
    }
  };

  const getMessageClass = (type: StatusBarMessageType): string => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      case 'progress':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${getMessageClass(message.type)}`}>
      <span>{getMessageIcon(message.type)}</span>
      <span className="font-medium">{message.text}</span>
    </div>
  );
};

