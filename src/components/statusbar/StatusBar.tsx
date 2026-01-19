import React from 'react';
import { StatusBarContainer } from './StatusBarContainer';
import { useStatusBar } from './hooks/useStatusBar';
import { IStatusBarProps } from './interfaces/StatusBarInterfaces';

/**
 * Основной компонент StatusBar
 * Экспонирует StatusBarContainer с дополнительным функционалом
 * Следует SOLID принципам
 */
export const StatusBar: React.FC<IStatusBarProps> = (props) => {
  const statusBar = useStatusBar();

  // Инициализация сервисов при монтировании
  React.useEffect(() => {
    // Показываем начальное сообщение
    statusBar.showSuccess('Статусбар готов к работе');
  }, [statusBar]);

  return <StatusBarContainer {...props} />;
};

export default StatusBar;
