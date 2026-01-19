import { Task } from '@/store/projectStore';

/**
 * Интерфейс события календаря (адаптированная задача)
 * Соответствует принципу Interface Segregation
 */
export interface ICalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  color: string;
  progress: number;
  isMilestone: boolean;
  isCritical: boolean;
  originalTask: Task;
}


