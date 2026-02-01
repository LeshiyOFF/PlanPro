import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ViewRouteManager } from '@/services/ViewRouteManager';
import { AppBootstrapper } from '@/application/bootstrapping/AppBootstrapper';
import { ViewType, type ViewComponentProps } from '@/types/ViewTypes';
import { ViewLayout } from '@/components/layout/ViewLayout';
import { MainWindowInitializer } from '@/components/layout/MainWindowInitializer';
import { 
  GanttView, 
  NetworkViewComponent, 
  TaskSheetComponent, 
  ResourceSheetComponent,
  TaskUsageView,
  ResourceUsageView,
  SettingsViewComponent,
  WBSViewComponent,
  TrackingGanttViewComponent,
  CalendarView,
  ReportsView
} from '@/components/views';
import { DialogTestPage } from '@/pages/DialogTestPage'
import { ContextMenuDemoPage } from '@/pages/ContextMenuDemoPage'
import HotkeyDemoPage from '@/pages/HotkeyDemoPage';

/**
 * Navigation Router компонент
 * Следует SOLID принципу Single Responsibility
 */
interface NavigationRouterProps {
  onViewChange?: (viewType: ViewType) => void;
}

export const NavigationRouter: React.FC<NavigationRouterProps> = ({ onViewChange }) => {
  const routeManager = ViewRouteManager.getInstance();
  const bootstrapper = React.useMemo(() => new AppBootstrapper(), []);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [initialRoute, setInitialRoute] = React.useState('/gantt');

  // Регистрация компонентов представлений и инициализация настроек
  React.useEffect(() => {
    const initialize = async () => {
      // Регистрация представлений (синхронно)
      const views = [
        { type: ViewType.GANTT, comp: GanttView },
        { type: ViewType.NETWORK, comp: NetworkViewComponent },
        { type: ViewType.TASK_SHEET, comp: TaskSheetComponent },
        { type: ViewType.RESOURCE_SHEET, comp: ResourceSheetComponent },
        { type: ViewType.TASK_USAGE, comp: TaskUsageView },
        { type: ViewType.RESOURCE_USAGE, comp: ResourceUsageView },
        { type: ViewType.SETTINGS, comp: SettingsViewComponent },
        { type: ViewType.WBS, comp: WBSViewComponent },
        { type: ViewType.TRACKING_GANTT, comp: TrackingGanttViewComponent },
        { type: ViewType.CALENDAR, comp: CalendarView },
        { type: ViewType.REPORTS, comp: ReportsView },
      ];

      views.forEach(v => {
        const config = routeManager.getViewConfig(v.type);
        if (config) {
          config.component = v.comp as React.ComponentType<ViewComponentProps>;
          routeManager.registerView(config);
        }
      });

      // Ждем инициализации настроек и определяем начальный маршрут
      const route = await bootstrapper.getInitialRoute();
      setInitialRoute(route);
      setIsInitialized(true);
    };

    initialize();
  }, [bootstrapper, routeManager]);

  const allRoutes = routeManager.getAllRoutes();

  if (!isInitialized) {
    return (
      <MainWindowInitializer>
        <ViewLayout onViewChange={onViewChange}>
          <div className="flex items-center justify-center h-full text-slate-400 font-medium">
            Загрузка конфигурации...
          </div>
        </ViewLayout>
      </MainWindowInitializer>
    );
  }

  return (
    <MainWindowInitializer>
      <ViewLayout onViewChange={onViewChange}>
        <Routes>
          {/* Динамический редирект на основе настроек пользователя */}
          <Route path="/" element={<Navigate to={initialRoute} replace />} />

          {allRoutes.map((route, _index) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.component ? 
                  <route.component viewType={getViewTypeFromPath(route.path)} settings={route.settings} /> :
                  <div className="view-not-implemented">
                    <h2>Представление не реализовано</h2>
                    <p>Представление для пути {route.path} еще не реализовано.</p>
                  </div>
              }
            />
          ))}
          
          {/* Dialog Test Route */}
          <Route 
            path="/test-dialogs" 
            element={<DialogTestPage />} 
          />
          
          {/* Context Menu Demo Route */}
          <Route 
            path="/test-context-menu" 
            element={<ContextMenuDemoPage />} 
          />
          
          {/* Hotkey Demo Route */}
          <Route 
            path="/test-hotkeys" 
            element={<HotkeyDemoPage />} 
          />
          
          {/* Fallback route */}
          <Route
            path="*"
            element={
              <div className="not-found">
                <h1>404 - Страница не найдена</h1>
                <p>Запрошенный вид не существует.</p>
              </div>
            }
          />
        </Routes>
      </ViewLayout>
    </MainWindowInitializer>
  );
};

/**
 * Получение ViewType из пути
 */
const getViewTypeFromPath = (path: string): ViewType => {
  const pathToViewMap: Record<string, ViewType> = {
    '/gantt': ViewType.GANTT,
    '/network': ViewType.NETWORK,
    '/task-sheet': ViewType.TASK_SHEET,
    '/resource-sheet': ViewType.RESOURCE_SHEET,
    '/task-usage': ViewType.TASK_USAGE,
    '/resource-usage': ViewType.RESOURCE_USAGE,
    '/calendar': ViewType.CALENDAR,
    '/reports': ViewType.REPORTS,
    '/tracking-gantt': ViewType.TRACKING_GANTT,
    '/wbs': ViewType.WBS,
    '/settings': ViewType.SETTINGS
  };

  return pathToViewMap[path] || ViewType.GANTT;
};

