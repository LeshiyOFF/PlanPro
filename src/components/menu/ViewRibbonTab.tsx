import React from 'react';
import { useTranslation } from 'react-i18next';
import { RibbonGroup } from './RibbonGroup';
import { RibbonButton } from './RibbonButton';
import { 
  List, 
  BarChart, 
  PieChart, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Monitor, 
  Filter 
} from 'lucide-react';

/**
 * Конфигурация View Ribbon Tab
 */
interface ViewRibbonTabProps {
  className?: string;
}

/**
 * View Ribbon Tab компонент
 * Реализует 4 операции отображения из UI_Functionality_Catalog.md
 */
export const ViewRibbonTab: React.FC<ViewRibbonTabProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const iconSize = "h-5 w-5";

  return (
    <div className={`view-ribbon-tab flex items-center space-x-2 ${className}`}>
      <RibbonGroup title={t('ribbon.groups.display')}>
        <RibbonButton title={t('ribbon.buttons.task_list')}>
          <List className={iconSize} />
        </RibbonButton>
        <RibbonButton title={t('ribbon.buttons.gantt_chart')}>
          <BarChart className={iconSize} />
        </RibbonButton>
        <RibbonButton title={t('ribbon.buttons.resource_usage')}>
          <PieChart className={iconSize} />
        </RibbonButton>
      </RibbonGroup>

      <RibbonGroup title={t('ribbon.groups.zoom')}>
        <RibbonButton title={t('ribbon.buttons.zoom_in')}>
          <ZoomIn className={iconSize} />
        </RibbonButton>
        <RibbonButton title={t('ribbon.buttons.zoom_out')}>
          <ZoomOut className={iconSize} />
        </RibbonButton>
        <RibbonButton title={t('ribbon.buttons.zoom_to_fit')}>
          <Maximize className={iconSize} />
        </RibbonButton>
        <RibbonButton title={t('ribbon.buttons.zoom_100')}>
          <Monitor className={iconSize} />
        </RibbonButton>
      </RibbonGroup>

      <RibbonGroup title={t('ribbon.groups.filters')}>
        <RibbonButton title={t('ribbon.buttons.task_filter')}>
          <Filter className={iconSize} />
        </RibbonButton>
      </RibbonGroup>
    </div>
  );
};

export default ViewRibbonTab;

