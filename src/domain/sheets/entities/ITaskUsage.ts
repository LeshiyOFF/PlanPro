/**
 * Представление данных использования задачи
 */
export interface ITaskUsage {
  id: string;
  taskName: string;
  startDate: Date | string;
  endDate: Date | string;
  duration: string;
  percentComplete: number;
  resources: string;
}


