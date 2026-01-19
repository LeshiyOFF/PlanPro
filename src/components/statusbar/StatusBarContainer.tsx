import React, { useEffect, useCallback, useState } from 'react';
import { StatusBarService } from './services/StatusBarService';
import { IStatusBarProps, IStatusBarState } from './interfaces/StatusBarInterfaces';
import {
  ViewInfoSection,
  ProjectInfoSection,
  MessageSection,
  TimeSection,
  ZoomSection
} from './sections';
import { Separator } from '@/components/ui/separator';
import './StatusBarStyles.css';

/**
 * Контейнер статусбара с полной функциональностью
 * Реализует паттерны из UI_Reverse_Engineering.md
 * Следует SOLID принципам и Clean Architecture
 */
export const StatusBarContainer: React.FC<IStatusBarProps> = ({
  className = '',
  config,
  onSectionClick
}) => {
  const statusBarService = React.useMemo(() => StatusBarService.getInstance(), []);
  const [state, setState] = useState<IStatusBarState>(statusBarService.getState());

  /**
   * Подписка на изменения состояния сервис
   */
  useEffect(() => {
    const unsubscribe = statusBarService.subscribe(setState);
    
    return () => {
      unsubscribe();
    };
  }, [statusBarService]);

  /**
   * Обработчик изменения масштаба
   */
  const handleZoomChange = useCallback((zoom: number) => {
    statusBarService.updateZoom(zoom);
  }, [statusBarService]);

  /**
   * Обработчик клика по секции
   */
  const handleSectionClick = useCallback((sectionId: string) => {
    onSectionClick?.(sectionId);
  }, [onSectionClick]);

  /**
   * Обработчик переключения видимости
   */
  const handleToggleVisibility = useCallback(() => {
    statusBarService.toggleVisibility();
  }, [statusBarService]);

  if (!state.isVisible && config?.visible !== true) {
    return null;
  }

  return (
    <footer className={`statusbar-container ${className}`}>
      <div className="statusbar-content">
        {/* Левая секция */}
        <div className="statusbar-left">
          <div 
            className="statusbar-section"
            onClick={() => handleSectionClick('view-info')}
          >
            <ViewInfoSection />
          </div>
          
          <Separator orientation="vertical" className="statusbar-separator" />
          
          <div 
            className="statusbar-section"
            onClick={() => handleSectionClick('project-info')}
          >
            <ProjectInfoSection />
          </div>
        </div>

        {/* Центральная секция */}
        <div className="statusbar-center">
          <div 
            className="statusbar-section statusbar-message"
            onClick={() => handleSectionClick('message')}
          >
            <MessageSection message={state.message} />
          </div>
        </div>

        {/* Правая секция */}
        <div className="statusbar-right">
          <div 
            className="statusbar-section"
            onClick={() => handleSectionClick('zoom')}
          >
            <ZoomSection zoom={state.zoom} onZoomChange={handleZoomChange} />
          </div>
          
          <Separator orientation="vertical" className="statusbar-separator" />
          
          <div 
            className="statusbar-section"
            onClick={() => handleSectionClick('time')}
          >
            <TimeSection />
          </div>
          
          <Separator orientation="vertical" className="statusbar-separator" />
          
          <div 
            className="statusbar-section statusbar-toggle"
            onClick={handleToggleVisibility}
            title="Скрыть/показать статусбар"
          >
            <span className="text-xs">▼</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
