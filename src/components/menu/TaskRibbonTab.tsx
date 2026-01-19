import React from 'react';
import { useTranslation } from 'react-i18next';
import { RibbonGroup } from './RibbonGroup';
import { RibbonButton } from './RibbonButton';
import { 
  Plus, 
  Trash2, 
  IndentIncrease, 
  IndentDecrease, 
  Link, 
  Unlink, 
  Info, 
  Clock, 
  StickyNote, 
  UserPlus, 
  Save, 
  Search, 
  MapPin, 
  RefreshCw 
} from 'lucide-react';

/**
 * Конфигурация Task Ribbon Tab
 */
interface TaskRibbonTabProps {
  className?: string;
}

/**
 * Task Ribbon Tab компонент
 * Реализует 15 задачевых операций из UI_Functionality_Catalog.md
 */
export const TaskRibbonTab: React.FC<TaskRibbonTabProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const iconSize = "h-5 w-5";

  return (
    <div className={`task-ribbon-tab flex items-center space-x-3 ${className}`}>
      <RibbonGroup title={t('ribbon.groups.editing')}>
        <RibbonButton title={t('ribbon.buttons.insert_task')}>
          <Plus className={iconSize} />
        </RibbonButton>
        <RibbonButton title={t('ribbon.buttons.delete_task')}>
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

      <RibbonGroup title={t('ribbon.groups.links')}>
        <RibbonButton title={t('ribbon.buttons.link_tasks')}>
          <Link className={iconSize} />
        </RibbonButton>
        <RibbonButton title={t('ribbon.buttons.unlink_tasks')}>
          <Unlink className={iconSize} />
        </RibbonButton>
      </RibbonGroup>

      <RibbonGroup title={t('ribbon.groups.information')}>
        <RibbonButton title={t('ribbon.buttons.task_info')}>
          <Info className={iconSize} />
        </RibbonButton>
        <RibbonButton title={t('ribbon.buttons.working_time')}>
          <Clock className={iconSize} />
        </RibbonButton>
        <RibbonButton title={t('ribbon.buttons.task_notes')}>
          <StickyNote className={iconSize} />
        </RibbonButton>
      </RibbonGroup>

      <RibbonGroup title={t('ribbon.groups.assignment')}>
        <RibbonButton title={t('ribbon.buttons.assign_resources')}>
          <UserPlus className={iconSize} />
        </RibbonButton>
      </RibbonGroup>

      <RibbonGroup title={t('ribbon.groups.planning')}>
        <RibbonButton title={t('ribbon.buttons.save_baseline')}>
          <Save className={iconSize} />
        </RibbonButton>
        <RibbonButton title={t('ribbon.buttons.clear_baseline')}>
          <Trash2 className={iconSize} />
        </RibbonButton>
      </RibbonGroup>

      <RibbonGroup title={t('ribbon.groups.search')}>
        <RibbonButton title={t('ribbon.buttons.find_task')}>
          <Search className={iconSize} />
        </RibbonButton>
        <RibbonButton title={t('ribbon.buttons.go_to_task')}>
          <MapPin className={iconSize} />
        </RibbonButton>
      </RibbonGroup>

      <RibbonGroup title={t('ribbon.groups.update')}>
        <RibbonButton title={t('ribbon.buttons.update_tasks')}>
          <RefreshCw className={iconSize} />
        </RibbonButton>
      </RibbonGroup>
    </div>
  );
};

export default TaskRibbonTab;

