import React, { useCallback } from 'react';
import { logger } from '@/utils/logger';
import { useDialogContext } from './DialogContext';

// Import all dialogs
import {
  WelcomeDialog,
  ProjectsDialog,
  UpdateProjectDialog,
  RenameProjectDialog,
  OpenProjectDialog,
  BaselineDialog,
  DependencyDialog,
  XbsDependencyDialog,
  DelegateTaskDialog,
  UpdateTaskDialog,
  AssignmentDialog,
  ResourceMappingDialog,
  ResourceAdditionDialog,
  ReplaceAssignmentDialog,
  NewBaseCalendarDialog,
  HolidayDialog,
  TaskDetailsDialog,
  EarnedValueDialog,
  ProjectStatisticsDialog,
  TaskLinksDialog,
  TaskNotesDialog,
  AdvancedSearchDialog,
  FilterDialog,
  ProjectOptionsDialog,
  GanttChartOptionsDialog,
  CalculationOptionsDialog,
  NotificationSettingsDialog,
  SecuritySettingsDialog,
  FindAndReplaceDialog,
  GoToDialog
} from './index';

export type DialogType = 
  | 'welcome'
  | 'projects'
  | 'update-project'
  | 'rename-project'
  | 'open-project'
  | 'baseline'
  | 'dependency'
  | 'xbs-dependency'
  | 'delegate-task'
  | 'update-task'
  | 'assignment'
  | 'resource-mapping'
  | 'resource-addition'
  | 'replace-assignment'
  | 'new-base-calendar'
  | 'holiday'
  | 'task-details'
  | 'earned-value'
  | 'project-statistics'
  | 'task-links'
  | 'task-notes'
  | 'advanced-search'
  | 'filter'
  | 'project-options'
  | 'gantt-chart-options'
  | 'calculation-options'
  | 'notification-settings'
  | 'security-settings'
  | 'find-and-replace'
  | 'go-to';

interface DialogData {
  type: DialogType;
  data?: any;
  projectId?: string;
  taskId?: string;
  resourceId?: string;
}

interface DialogManagerProps {
  children?: React.ReactNode;
}

export const DialogManager: React.FC<DialogManagerProps> = ({ children }) => {
  const { currentDialog, closeDialog } = useDialogContext();

  const openDialog = useCallback((type: DialogType, data?: any) => {
    // This is handled by the context now
    logger.dialog(`Opening dialog: ${type}`, data, type);
  }, []);

  const renderDialog = () => {
    if (!currentDialog) return null;

    const { type, data } = currentDialog;
    const commonProps = {
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) closeDialog();
      }
    };

    switch (type) {
      case 'welcome':
        return (
          <WelcomeDialog
            {...commonProps}
            {...data}
          />
        );

      // Project Dialogs
      case 'projects':
        return (
          <ProjectsDialog
            {...commonProps}
            {...data}
          />
        );

      case 'update-project':
        return (
          <UpdateProjectDialog
            {...commonProps}
            {...data}
          />
        );

      case 'rename-project':
        return (
          <RenameProjectDialog
            {...commonProps}
            {...data}
          />
        );

      case 'open-project':
        return (
          <OpenProjectDialog
            {...commonProps}
            {...data}
          />
        );

      case 'baseline':
        return (
          <BaselineDialog
            {...commonProps}
            {...data}
          />
        );

      // Task Dialogs
      case 'dependency':
        return (
          <DependencyDialog
            {...commonProps}
            {...data}
          />
        );

      case 'xbs-dependency':
        return (
          <XbsDependencyDialog
            {...commonProps}
            {...data}
          />
        );

      case 'delegate-task':
        return (
          <DelegateTaskDialog
            {...commonProps}
            {...data}
          />
        );

      case 'update-task':
        return (
          <UpdateTaskDialog
            {...commonProps}
            {...data}
          />
        );

      // Resource Dialogs
      case 'assignment':
        return (
          <AssignmentDialog
            {...commonProps}
            {...data}
          />
        );

      case 'resource-mapping':
        return (
          <ResourceMappingDialog
            {...commonProps}
            {...data}
          />
        );

      case 'resource-addition':
        return (
          <ResourceAdditionDialog
            {...commonProps}
            {...data}
          />
        );

      case 'replace-assignment':
        return (
          <ReplaceAssignmentDialog
            {...commonProps}
            {...data}
          />
        );

      // Calendar Dialogs
      case 'new-base-calendar':
        return (
          <NewBaseCalendarDialog
            {...commonProps}
            {...data}
          />
        );

      case 'holiday':
        return (
          <HolidayDialog
            {...commonProps}
            {...data}
          />
        );

      // Information Dialogs
      case 'task-details':
        return (
          <TaskDetailsDialog
            {...commonProps}
            {...data}
          />
        );

      case 'earned-value':
        return (
          <EarnedValueDialog
            {...commonProps}
            {...data}
          />
        );

      case 'project-statistics':
        return (
          <ProjectStatisticsDialog
            {...commonProps}
            {...data}
          />
        );

      case 'task-links':
        return (
          <TaskLinksDialog
            {...commonProps}
            {...data}
          />
        );

      case 'task-notes':
        return (
          <TaskNotesDialog
            {...commonProps}
            {...data}
          />
        );

      // Search Dialogs
      case 'advanced-search':
        return (
          <AdvancedSearchDialog
            {...commonProps}
            {...data}
          />
        );

      case 'filter':
        return (
          <FilterDialog
            {...commonProps}
            {...data}
          />
        );

      // Settings Dialogs
      case 'project-options':
        return (
          <ProjectOptionsDialog
            {...commonProps}
            {...data}
          />
        );

      case 'gantt-chart-options':
        return (
          <GanttChartOptionsDialog
            {...commonProps}
            {...data}
          />
        );

      case 'calculation-options':
        return (
          <CalculationOptionsDialog
            {...commonProps}
            {...data}
          />
        );

      case 'notification-settings':
        return (
          <NotificationSettingsDialog
            {...commonProps}
            {...data}
          />
        );

      case 'security-settings':
        return (
          <SecuritySettingsDialog
            {...commonProps}
            {...data}
          />
        );

      // Editing Dialogs
      case 'find-and-replace':
        return (
          <FindAndReplaceDialog
            {...commonProps}
            {...data}
          />
        );

      case 'go-to':
        return (
          <GoToDialog
            {...commonProps}
            {...data}
          />
        );

      default:
        return null;
    }
  };

  // Provide dialog API to children via context or render prop
  return (
    <>
      {children}
      {renderDialog()}
    </>
  );
};

// Hook for using dialog manager - now just exports the context hook
export const useDialogManager = useDialogContext;
