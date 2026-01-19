/**
 * Данные для одной точки (дня) на гистограмме ресурсов
 */
export interface IResourceWorkloadDay {
  date: Date;
  workloadPercent: number; // 0.0 - 1.0 (1.0 = 100%)
  maxCapacityPercent: number; // Обычно 1.0, но может быть меньше/больше
  isOverloaded: boolean;
}

/**
 * Данные гистограммы для конкретного ресурса
 */
export interface IResourceHistogramData {
  resourceId: string;
  resourceName: string;
  days: IResourceWorkloadDay[];
  totalWorkload: number;
  averageWorkload: number;
}

