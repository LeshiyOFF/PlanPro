import React, { useState, useEffect } from 'react';
import { ViewRouteManager } from '@/services/ViewRouteManager';
import { ViewType, ViewConfig } from '@/types/ViewTypes';
import { 
  BarChart, 
  Network, 
  Table, 
  Users, 
  BarChart2, 
  PieChart, 
  Calendar, 
  FileText, 
  TrendingUp, 
  GitBranch 
} from 'lucide-react';

/**
 * Navigation компонент для переключения View
 * Следует SOLID принципу Single Responsibility
 */
export const NavigationMenu: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType | null>(null);
  const [availableViews, setAvailableViews] = useState<ViewConfig[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const routeManager = ViewRouteManager.getInstance();

  useEffect(() => {
    const views = routeManager.getAvailableViews();
    setAvailableViews(views);
    setCurrentView(routeManager.getCurrentView());
  }, []);

  const handleViewChange = (viewType: ViewType) => {
    try {
      routeManager.navigateToView(viewType);
      setCurrentView(viewType);
      setIsExpanded(false);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const getIcon = (viewType: ViewType) => {
    const icons = {
      [ViewType.GANTT]: BarChart,
      [ViewType.NETWORK]: Network,
      [ViewType.TASK_SHEET]: Table,
      [ViewType.RESOURCE_SHEET]: Users,
      [ViewType.TASK_USAGE]: BarChart2,
      [ViewType.RESOURCE_USAGE]: PieChart,
      [ViewType.CALENDAR]: Calendar,
      [ViewType.REPORTS]: FileText,
      [ViewType.TRACKING_GANTT]: TrendingUp,
      [ViewType.WBS]: GitBranch
    };
    return icons[viewType] || BarChart;
  };

  return (
    <nav className="navigation-menu">
      <button 
        className="navigation-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        ☰ Виды
      </button>
      
      <div className={`navigation-dropdown ${isExpanded ? 'expanded' : ''}`}>
        <div className="navigation-header">
          <h3>Режимы просмотра</h3>
          <button 
            className="close-btn"
            onClick={() => setIsExpanded(false)}
          >
            ✕
          </button>
        </div>
        
        <div className="navigation-list">
          {availableViews.map(view => {
            const Icon = getIcon(view.type);
            const isActive = currentView === view.type;
            
            return (
              <button
                key={view.id}
                className={`navigation-item ${isActive ? 'active' : ''}`}
                onClick={() => handleViewChange(view.type)}
                title={view.description}
              >
                <Icon className="nav-icon" size={16} />
                <span className="nav-text">{view.title}</span>
                {isActive && <div className="active-indicator" />}
              </button>
            );
          })}
        </div>
        
        <div className="navigation-footer">
          <div className="current-view-info">
            Текущий: <strong>{currentView ? 
              availableViews.find(v => v.type === currentView)?.title : 'Нет'
            }</strong>
          </div>
        </div>
      </div>
    </nav>
  );
};
