import React from 'react';
import { useNavigation } from '@/providers/NavigationProvider';
import { Separator } from '@/components/ui/separator';

/**
 * Секция информация о представлении
 * Отображает текущий вид и навигационную информацию
 */
export const ViewInfoSection: React.FC = () => {
  const { currentView, availableViews } = useNavigation();

  const currentViewTitle = React.useMemo(() => {
    return availableViews.find(v => v.type === currentView)?.title || 'Неизвестный вид';
  }, [currentView, availableViews]);

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Вид:</span>
      <span className="font-medium">{currentViewTitle}</span>
    </div>
  );
};

