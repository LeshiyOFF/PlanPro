import React from 'react';

/**
 * Секция времени
 * Отображает текущее время
 */
export const TimeSection: React.FC = () => {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeString = React.useMemo(() => {
    return time.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, [time]);

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Время:</span>
      <span className="font-mono">{timeString}</span>
    </div>
  );
};
