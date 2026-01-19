import React from 'react';
import { useNavigation } from '@/providers/NavigationProvider';
import { useProject } from '@/providers/ProjectProvider';
import { Separator } from '@/components/ui/separator';

/**
 * Статус бар главного окна
 */
export const StatusBar: React.FC = () => {
  const { currentView, availableViews } = useNavigation();
  const { currentProject } = useProject();

  return (
    <footer className="status-bar border-t border-border bg-muted fixed bottom-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between h-6 px-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>
            Вид: <strong>{availableViews.find(v => v.type === currentView)?.title || 'Нет'}</strong>
          </span>
          <Separator orientation="vertical" className="h-4" />
          <span>
            Проект: <strong>{currentProject?.name || 'Нет проекта'}</strong>
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <span>Готов</span>
          <Separator orientation="vertical" className="h-4" />
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </footer>
  );
};

export default StatusBar;
