import React from 'react';
import { useTranslation } from 'react-i18next';
import { ViewType } from '@/types/ViewTypes';
import { ContextHelp } from '@/components/ui/ContextHelp';
import { useHelpContent } from '@/hooks/useHelpContent';

/**
 * Получение заголовка представления
 * Следует SOLID принципу Single Responsibility
 */
export const getViewTitle = (viewType: ViewType, t: any): string => {
  const titles: Record<ViewType, string> = {
    [ViewType.GANTT]: t('navigation.gantt'),
    [ViewType.NETWORK]: t('navigation.network'),
    [ViewType.TASK_SHEET]: t('navigation.task_sheet'),
    [ViewType.RESOURCE_SHEET]: t('navigation.resource_sheet'),
    [ViewType.TASK_USAGE]: t('navigation.task_usage'),
    [ViewType.RESOURCE_USAGE]: t('navigation.resource_usage'),
    [ViewType.CALENDAR]: t('navigation.calendar'),
    [ViewType.REPORTS]: t('navigation.reports'),
    [ViewType.TRACKING_GANTT]: t('navigation.tracking'),
    [ViewType.WBS]: t('navigation.wbs'),
    [ViewType.SETTINGS]: t('navigation.settings')
  };
  
  return titles[viewType] || t('view_controls.unknown_view');
};

/**
 * Получение контролов представления
 * Следует SOLID принципу Open/Closed
 */
export const getViewControls = (viewType: ViewType, t: any): React.ReactNode => {
  const controls: Record<ViewType, React.ReactNode> = {
    [ViewType.GANTT]: (
      <>
        <button key="zoom-in" className="px-3 py-1 bg-primary text-white rounded hover:opacity-90 transition-all">{t('view_controls.zoom_in')}</button>
        <button key="zoom-out" className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">{t('view_controls.zoom_out')}</button>
        <button key="fit" className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">{t('view_controls.fit_to_screen')}</button>
      </>
    ),
    [ViewType.NETWORK]: (
      <>
        <button key="layout" className="px-3 py-1 bg-primary text-white rounded hover:opacity-90 transition-all">{t('view_controls.layout')}</button>
        <button key="filter" className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">{t('view_controls.filter')}</button>
      </>
    ),
    [ViewType.TASK_SHEET]: (
      <>
        <button key="add" className="px-3 py-1 bg-primary text-white rounded hover:opacity-90 transition-all">{t('view_controls.add_task')}</button>
        <button key="delete" className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">{t('view_controls.delete')}</button>
      </>
    ),
    [ViewType.RESOURCE_SHEET]: (
      <>
        <button key="add" className="px-3 py-1 bg-primary text-white rounded hover:opacity-90 transition-all">{t('view_controls.add_resource')}</button>
        <button key="edit" className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">{t('view_controls.edit')}</button>
      </>
    ),
    [ViewType.TASK_USAGE]: (
      <>
        <button key="refresh" className="px-3 py-1 bg-primary text-white rounded hover:opacity-90 transition-all">{t('view_controls.refresh')}</button>
        <button key="export" className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">{t('view_controls.export')}</button>
      </>
    ),
    [ViewType.RESOURCE_USAGE]: (
      <>
        <button key="refresh" className="px-3 py-1 bg-primary text-white rounded hover:opacity-90 transition-all">{t('view_controls.refresh')}</button>
        <button key="details" className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">{t('view_controls.details')}</button>
      </>
    ),
    [ViewType.CALENDAR]: (
      <>
        <button key="today" className="px-3 py-1 bg-primary text-white rounded hover:opacity-90 transition-all">{t('view_controls.today')}</button>
        <button key="month" className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">{t('view_controls.month')}</button>
      </>
    ),
    [ViewType.REPORTS]: (
      <>
        <button key="generate" className="px-3 py-1 bg-primary text-white rounded hover:opacity-90 transition-all">{t('view_controls.generate')}</button>
        <button key="save" className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">{t('view_controls.save')}</button>
      </>
    ),
    [ViewType.TRACKING_GANTT]: (
      <>
        <button key="progress" className="px-3 py-1 bg-primary text-white rounded hover:opacity-90 transition-all">{t('view_controls.update_progress')}</button>
        <button key="sync" className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">{t('view_controls.sync')}</button>
      </>
    ),
    [ViewType.WBS]: (
      <>
        <button key="expand" className="px-3 py-1 bg-primary text-white rounded hover:opacity-90 transition-all">{t('view_controls.expand_all')}</button>
        <button key="collapse" className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">{t('view_controls.collapse_all')}</button>
      </>
    ),
    [ViewType.SETTINGS]: (
      <>
        <button key="save" className="px-3 py-1 bg-primary text-white rounded hover:opacity-90 transition-all">{t('view_controls.save')}</button>
        <button key="reset" className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">{t('view_controls.reset')}</button>
      </>
    )
  };
  
  return controls[viewType] || null;
};

/**
 * Получение стандартного layout для View компонентов
 * Следует SOLID принципу Dependency Inversion
 */
interface StandardViewLayoutProps {
  viewType: ViewType;
  children: React.ReactNode;
  className?: string;
  showControls?: boolean; // Опциональный параметр для показа контролей
}

export const StandardViewLayout: React.FC<StandardViewLayoutProps> = ({ 
  viewType, 
  children, 
  className = '',
  showControls = true // По умолчанию показываем контролы
}) => {
  const { t } = useTranslation();
  const helpContent = useHelpContent();
  const controls = getViewControls(viewType, t);
  const help = helpContent[viewType === ViewType.TRACKING_GANTT ? 'TRACKING' : viewType as keyof typeof helpContent];
  
  return (
    <div className={`h-full p-6 flex flex-col transition-all duration-300 ease-in-out ${className}`}>
      <header className="mb-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4 pr-4">
          <h1 className="text-2xl font-semibold">{getViewTitle(viewType, t)}</h1>
          {help && (
            <ContextHelp 
              title={help.title} 
              content={help.content} 
              side="left"
            />
          )}
        </div>
        {showControls && controls && (
          <div className="flex gap-2">
            {controls}
          </div>
        )}
      </header>
      
      <main className="flex-1 overflow-auto min-h-0">
        <div className="view-content-wrapper w-full h-full p-4 bg-white rounded-lg border overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
