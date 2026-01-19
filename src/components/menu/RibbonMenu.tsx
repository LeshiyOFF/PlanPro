import React from 'react';
import { useTranslation } from 'react-i18next';
import { RibbonTab } from './RibbonTab';
import { FileRibbonTab } from './FileRibbonTab';
import { TaskRibbonTab } from './TaskRibbonTab';
import { ResourceRibbonTab } from './ResourceRibbonTab';
import { ViewRibbonTab } from './ViewRibbonTab';
import { SettingsRibbonTab } from './SettingsRibbonTab';

/**
 * Конфигурация Ribbon Menu
 */
interface RibbonMenuProps {
  className?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

/**
 * Основной Ribbon Menu компонент
 * Реализует паттерн Ribbon Interface из UI_Reverse_Engineering.md
 */
export const RibbonMenu: React.FC<RibbonMenuProps> = ({ 
  className = '',
  activeTab = 'file',
  onTabChange 
}) => {
  const { t } = useTranslation();

  const handleTabClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <div className={`ribbon-menu border-b border-border bg-card ${className}`}>
      <div className="flex items-center h-12 px-2">
        {/* Ribbon Tabs */}
        <div className="flex items-center space-x-1">
          <RibbonTab
            id="file"
            title={t('ribbon.tabs.file')}
            isActive={activeTab === 'file'}
            onClick={() => handleTabClick('file')}
          />
          <RibbonTab
            id="task"
            title={t('ribbon.tabs.task')}
            isActive={activeTab === 'task'}
            onClick={() => handleTabClick('task')}
          />
          <RibbonTab
            id="resource"
            title={t('ribbon.tabs.resource')}
            isActive={activeTab === 'resource'}
            onClick={() => handleTabClick('resource')}
          />
          <RibbonTab
            id="view"
            title={t('ribbon.tabs.view')}
            isActive={activeTab === 'view'}
            onClick={() => handleTabClick('view')}
          />
          <RibbonTab
            id="settings"
            title={t('ribbon.tabs.settings')}
            isActive={activeTab === 'settings'}
            onClick={() => handleTabClick('settings')}
          />
        </div>

        {/* Ribbon Content */}
        <div className="flex-1 ml-4">
          {activeTab === 'file' && <FileRibbonTab />}
          {activeTab === 'task' && <TaskRibbonTab />}
          {activeTab === 'resource' && <ResourceRibbonTab />}
          {activeTab === 'view' && <ViewRibbonTab />}
          {activeTab === 'settings' && <SettingsRibbonTab />}
        </div>
      </div>
    </div>
  );
};

export default RibbonMenu;
