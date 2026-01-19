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
}


