// Authentication Dialogs
export { LoginDialog } from './authentication/LoginDialog';

// Project Dialogs
export { WelcomeDialog } from './WelcomeDialog';
export { ProjectsDialog } from './project/ProjectsDialog';
export { UpdateProjectDialog } from './project/UpdateProjectDialog';
export { RenameProjectDialog } from './project/RenameProjectDialog';
export { OpenProjectDialog } from './project/OpenProjectDialog';
export { BaselineDialog } from './project/BaselineDialog';
export { ProjectDialog } from './project/ProjectDialog';

// Task Dialogs
export { DependencyDialog } from './task/DependencyDialog';
export { XbsDependencyDialog } from './task/XbsDependencyDialog';
export { DelegateTaskDialog } from './task/DelegateTaskDialog';
export { UpdateTaskDialog } from './task/UpdateTaskDialog';
export { TaskInformationDialog } from './task/TaskInformationDialog';

// Resource Dialogs
export { AssignmentDialog } from './resource/AssignmentDialog';
export { ResourceMappingDialog } from './resource/ResourceMappingDialog';
export { ResourceAdditionDialog } from './resource/ResourceAdditionDialog';
export { ReplaceAssignmentDialog } from './resource/ReplaceAssignmentDialog';
export { ResourceInformationDialog } from './resource/ResourceInformationDialog';

// Calendar Dialogs
export { NewBaseCalendarDialog } from './calendar/NewBaseCalendarDialog';
export { HolidayDialog } from './calendar/HolidayDialog';
export { ChangeWorkingTimeDialog } from './calendar/ChangeWorkingTimeDialog';

// Information Dialogs
export { TaskDetailsDialog } from './information/TaskDetailsDialog';
export { EarnedValueDialog } from './information/EarnedValueDialog';
export { ProjectStatisticsDialog } from './information/ProjectStatisticsDialog';
export { TaskLinksDialog } from './information/TaskLinksDialog';
export { TaskNotesDialog } from './information/TaskNotesDialog';
export { ProjectInformationDialog } from './information/ProjectInformationDialog';

// Search Dialogs
export { AdvancedSearchDialog } from './search/AdvancedSearchDialog';
export { FilterDialog } from './search/FilterDialog';
export { FindDialog } from './search/FindDialog';

// Settings Dialogs
export { ProjectOptionsDialog } from './settings/ProjectOptionsDialog';
export { GanttChartOptionsDialog } from './settings/GanttChartOptionsDialog';
export { CalculationOptionsDialog } from './settings/CalculationOptionsDialog';
export { NotificationSettingsDialog } from './settings/NotificationSettingsDialog';
export { SecuritySettingsDialog } from './settings/SecuritySettingsDialog';
export { OptionsDialog } from './settings/OptionsDialog';

// Editing Dialogs
export { FindAndReplaceDialog } from './editing/FindAndReplaceDialog';
export { GoToDialog } from './editing/GoToDialog';

// Dialog Management
export { DialogManager } from './DialogManager';
export { StartupDialogLauncher } from './StartupDialogLauncher';
export { DialogProvider, useDialogContext } from './DialogContext';
export { useDialogManager } from './DialogManager';
export { DialogDemo } from './DialogDemo';

// Base Components and Hooks
export { BaseDialog, SimpleBaseDialog } from './base/SimpleBaseDialog';
export type { BaseDialogProps, SimpleBaseDialogProps } from './base/SimpleBaseDialog';
export { useDialogValidation } from './hooks/useDialogValidation';
export { useDialogForm } from './hooks/useDialogForm';
export { FormField } from './components/FormField';
export { PasswordPolicySection } from './settings/PasswordPolicySection';
export { SessionPolicySection } from './settings/SessionPolicySection';
export { AccessPolicySection } from './settings/AccessPolicySection';
export { AuditPolicySection } from './settings/AuditPolicySection';
