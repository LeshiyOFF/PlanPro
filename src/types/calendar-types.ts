/**
 * Типы для календарей ProjectLibre
 */

export interface Calendar {
  id: string
  name: string
  workingDays: boolean[]
  workingHours: {
    from: number
    to: number
  }[]
  exceptions: CalendarException[]
}

/**
 * Унифицированный интерфейс для исключений в календаре
 * Объединяет все необходимые поля для праздников, отпусков и особых дат
 */
export interface CalendarException {
  /** Уникальный идентификатор исключения */
  id: string;
  /** Название исключения (например, "Новый год") */
  name: string;
  /** Дата исключения в ISO формате (YYYY-MM-DD) */
  date: string;
  /** Тип исключения: holiday - выходной, working - рабочий */
  type: 'holiday' | 'working';
  /** Время начала работы (если рабочий день) */
  startTime?: string;
  /** Время окончания работы (если рабочий день) */
  endTime?: string;
}

import { IDialogData } from './dialog/LegacyDialogTypes';

export interface CalendarDialogData extends Partial<IDialogData> {
  workingTime: Record<string, { startTime: string; endTime: string; isWorkingDay: boolean }>;
}

export interface TaskInformationData extends IDialogData {
  taskId: string;
}

export interface ProjectDialogData extends IDialogData {
  projectId: string;
  name: string;
  manager: string;
  notes: string;
  startDate: Date;
  resourcePool?: string;
  forward: boolean;
  projectType: number;
  projectStatus: number;
}

export interface WorkingTimeDialogData extends IDialogData {
  workingTime: Record<string, { startTime: string; endTime: string; isWorkingDay: boolean }>;
}

export interface HolidayDialogData extends IDialogData {
  holidayId?: string;
}

/** Элемент списка назначенных задач в диалоге ресурса */
export interface ResourceAssignedTaskItem {
  id: string;
  name: string;
  duration: number;
  progress?: number;
  rate: number;
}

export interface ResourceInformationData extends IDialogData {
  resourceId: string;
  name: string;
  type: string;
  rate: number;
  cost: number;
  availability?: Record<string, boolean>;
  assignedTasks: ResourceAssignedTaskItem[];
  notes: string;
}

export interface FindDialogData extends Partial<IDialogData> {
  query?: string;
}

export interface SettingsDialogData extends Partial<IDialogData> {
  section?: string;
}

export interface LoginDialogData extends IDialogData {
  username?: string;
  password?: string;
  rememberCredentials?: boolean;
  useMenus?: boolean;
}

export interface SplitTaskData extends IDialogData {
  taskId: string;
  taskName?: string;
  startDate?: Date;
  endDate?: Date;
  splitDate?: Date;
  gapDays?: number;
}

export interface NewBaseCalendarDialogData extends IDialogData {
  baseCalendarId?: string;
}
