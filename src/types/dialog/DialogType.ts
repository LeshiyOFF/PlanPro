/**
 * Канонический тип идентификаторов диалогов.
 * Единственный источник истины для DialogType (используется в DialogContext, DialogManager, DialogStateTypes).
 */

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
  | 'filter'
  | 'advanced-search'
  | 'notification-settings'
  | 'security-settings'
  | 'audit-policy-section'
  | 'access-policy-section'
  | 'gantt-chart-options'
  | 'calculation-options'
  | 'find-and-replace'
  | 'go-to';
