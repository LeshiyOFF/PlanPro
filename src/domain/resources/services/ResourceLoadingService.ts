import { Task } from '@/store/projectStore';
import { Resource } from '@/types/resource-types';
import { IResourceHistogramData, IResourceWorkloadDay } from '../interfaces/IResourceHistogram';

/**
 * Сервис для расчета загрузки ресурсов.
 * Использует реальные units из resourceAssignments.
 */
export class ResourceLoadingService {
  
  /** Базовая мощность ресурса = 100% */
  private static readonly BASE_CAPACITY = 1.0;

  /**
   * Рассчитывает данные гистограммы для конкретного ресурса на заданный период
   */
  public calculateHistogram(
    resource: Resource, 
    tasks: Task[], 
    startDate: Date, 
    endDate: Date
  ): IResourceHistogramData {
    const days = this.buildDaysArray(resource, tasks, startDate, endDate);
    const totalWorkload = days.reduce((sum, d) => sum + d.workloadPercent, 0);
    const avgWorkload = days.length > 0 ? totalWorkload / days.length : 0;
    
    return {
      resourceId: resource.id,
      resourceName: resource.name,
      days,
      totalWorkload,
      averageWorkload: avgWorkload
    };
  }

  /**
   * Строит массив данных по дням
   */
  private buildDaysArray(
    resource: Resource, tasks: Task[], startDate: Date, endDate: Date
  ): IResourceWorkloadDay[] {
    const days: IResourceWorkloadDay[] = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
    
    while (current <= endDate) {
      const day = this.calculateDayWorkload(resource, tasks, new Date(current));
      days.push(day);
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }

  /**
   * Рассчитывает нагрузку для конкретного дня.
   * Суммирует units из всех назначений, активных в этот день.
   */
  private calculateDayWorkload(
    resource: Resource, tasks: Task[], date: Date
  ): IResourceWorkloadDay {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    const workloadPercent = this.sumUnitsForDay(resource.id, tasks, dayStart, dayEnd);
    
    return {
      date: new Date(date),
      workloadPercent,
      maxCapacityPercent: ResourceLoadingService.BASE_CAPACITY,
      isOverloaded: workloadPercent > ResourceLoadingService.BASE_CAPACITY
    };
  }

  /**
   * Суммирует units всех назначений ресурса, активных в указанный день.
   * Поддерживает обратную совместимость: если resourceAssignments пуст,
   * проверяет устаревшее поле resourceIds (с units=1.0 по умолчанию).
   */
  private sumUnitsForDay(
    resourceId: string, tasks: Task[], dayStart: Date, dayEnd: Date
  ): number {
    let totalUnits = 0;
    
    for (const task of tasks) {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      
      if (taskStart <= dayEnd && taskEnd >= dayStart) {
        // Приоритет: новый формат resourceAssignments
        const assignment = task.resourceAssignments?.find(a => a.resourceId === resourceId);
        if (assignment) {
          totalUnits += assignment.units;
        } else if (task.resourceIds?.includes(resourceId)) {
          // Fallback: старый формат resourceIds (100% по умолчанию)
          totalUnits += ResourceLoadingService.BASE_CAPACITY;
        }
      }
    }
    
    return totalUnits;
  }
}


