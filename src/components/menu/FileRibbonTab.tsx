import React from 'react';
import { useTranslation } from 'react-i18next';
import { RibbonGroup } from './RibbonGroup';
import { RibbonButton } from './RibbonButton';
import { useFileOperations } from '@/hooks/useFileOperations';
import { 
  FilePlus, 
  FolderOpen, 
  Save, 
  X, 
  Printer, 
  Eye, 
  FileText, 
  Download, 
  Upload, 
  LogOut 
} from 'lucide-react';

/**
 * Конфигурация File Ribbon Tab
 */
interface FileRibbonTabProps {
  className?: string;
}

/**
 * File Ribbon Tab компонент
 * Реализует 10 основных файловых операций из UI_Functionality_Catalog.md
 */
export const FileRibbonTab: React.FC<FileRibbonTabProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const { createNewProject, openProject, saveProject, saveProjectAs } = useFileOperations();
  const iconSize = "h-5 w-5";

  return (
    <div className={`file-ribbon-tab flex items-center space-x-2 ${className}`}>
      <RibbonGroup title={t('ribbon.groups.file_operations')}>
        <RibbonButton 
          title={t('ribbon.buttons.new_project')}
          onClick={createNewProject}
        >
          <FilePlus className={iconSize} />
        </RibbonButton>
        <RibbonButton 
          title={t('ribbon.buttons.open_project')}
          onClick={openProject}
        >
          <FolderOpen className={iconSize} />
        </RibbonButton>
        <RibbonButton 
          title={t('ribbon.buttons.save_project')}
          onClick={saveProject}
        >
          <Save className={iconSize} />
        </RibbonButton>
        <RibbonButton 
          title={t('ribbon.buttons.save_as')}
          onClick={saveProjectAs}
        >
          <div className="flex">
            <Save className="h-4 w-4" />
            <span className="text-[8px] mt-2 ml-[-4px]">...</span>
          </div>
        </RibbonButton>
      </RibbonGroup>

      <RibbonGroup title={t('ribbon.groups.project_management')}>
        <RibbonButton title={t('ribbon.buttons.close_project')}>
          <X className={iconSize} />
        </RibbonButton>
        <RibbonButton title={t('ribbon.buttons.print')}>
          <Printer className={iconSize} />
        </RibbonButton>
        <RibbonButton title={t('ribbon.buttons.preview')}>
          <Eye className={iconSize} />
        </RibbonButton>
      </RibbonGroup>

      <RibbonGroup title={t('ribbon.groups.import_export')}>
        <RibbonButton title={t('ribbon.buttons.export_pdf')}>
          <FileText className={iconSize} />
        </RibbonButton>
        <RibbonButton title={t('ribbon.buttons.import_ms_project')}>
          <Download className={iconSize} />
        </RibbonButton>
        <RibbonButton title={t('ribbon.buttons.export_ms_project')}>
          <Upload className={iconSize} />
        </RibbonButton>
      </RibbonGroup>

      <RibbonGroup title={t('ribbon.groups.application')}>
        <RibbonButton title={t('ribbon.buttons.exit')}>
          <LogOut className={iconSize} />
        </RibbonButton>
      </RibbonGroup>
    </div>
  );
};

export default FileRibbonTab;

