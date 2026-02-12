/**
 * Представление данных использования ресурса
 */
export interface IResourceUsage {
  id: string;
  resourceName: string;
  assignedPercent: number;
  availablePercent: number;
  status: string;
  workload: string;
  /** Фактические часы (заполняется при внедрении Timesheet). В CSV при экспорте. */
  actualHours?: number;
  /** Плановые часы по назначениям. В CSV при экспорте. */
  plannedHours?: number;
  /** Отклонение: факт − план (ч). В CSV при экспорте. */
  variance?: number;
}


