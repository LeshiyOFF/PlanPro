/**
 * Тип контекстного меню
 */
export enum ContextMenuType {
  TASK = 'task',
  RESOURCE = 'resource',
  PROJECT = 'project',
  GANTT = 'gantt',
  TIMESHEET = 'timesheet',
  CALENDAR = 'calendar',
  REPORT = 'report',
  OPTIONS = 'options',
  SHEET = 'sheet'
}

/**
 * Статус контекстного меню
 */
export enum ContextMenuStatus {
  HIDDEN = 'hidden',
  VISIBLE = 'visible',
  LOADING = 'loading',
  ERROR = 'error'
}
