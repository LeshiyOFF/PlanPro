import React from 'react';
import { useTranslation } from 'react-i18next';
import { RibbonGroup } from './RibbonGroup';
import { RibbonButton } from './RibbonButton';
import { 
  Plus, 
  Trash2, 
  IndentIncrease, 
  IndentDecrease, 
  Info, 
  Clock, 
  StickyNote, 
  Search 
} from 'lucide-react';

/**
 * Конфигурация Resource Ribbon Tab
 */
interface ResourceRibbonTabProps {
  className?: string;
}

/**
 * Resource Ribbon Tab компонент
 * Реализует 9 ресурсовых операций из UI_Functionality_Catalog.md
 */
export const ResourceRibbonTab: React.FC<ResourceRibbonTabProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const iconSize = "h-5 w-5";

  return (
    <div className={`resource-ribbon-tab flex items-center space-x-2 ${className}`}>
      <RibbonGroup title={t('ribbon.groups.resource_operations')}>
        <RibbonButton title={t('ribbon.buttons.insert_resource')}>
          <Plus className={iconSize} />
        </RibbonButton>
        <RibbonButton title={t('ribbon.buttons.delete_resource')}>
          <Trash2 className={iconSize} />
        </RibbonButton>
      </RibbonGroup>

      <RibbonGroup title={t('ribbon.groups.formatting')}>
        <RibbonButton title={t('ribbon.buttons.indent')}>
          <IndentIncrease className={iconSize} />
        </RibbonButton>
        <RibbonButton title={t('ribbon.buttons.outdent')}>
          <IndentDecrease className={iconSize} />
        </RibbonButton>
      </RibbonGroup>

      <RibbonGroup title={t('ribbon.groups.information')}>
        <RibbonButton title={t('ribbon.buttons.resource_info')}>
          <Info className={iconSize} />
        </RibbonButton>
        <RibbonButton title={t('ribbon.buttons.working_time')}>
          <Clock className={iconSize} />
        </RibbonButton>
        <RibbonButton title={t('ribbon.buttons.resource_notes')}>
          <StickyNote className={iconSize} />
        </RibbonButton>
      </RibbonGroup>

      <RibbonGroup title={t('ribbon.groups.search')}>
        <RibbonButton title={t('ribbon.buttons.find_resource')}>
          <Search className={iconSize} />
        </RibbonButton>
      </RibbonGroup>
    </div>
  );
};

export default ResourceRibbonTab;

