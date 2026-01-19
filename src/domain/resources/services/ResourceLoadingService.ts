import { Task } from '@/store/projectStore';
import { Resource } from '@/types/resource-types';
import { IResourceHistogramData, IResourceWorkloadDay } from '../interfaces/IResourceHistogram';

/**
 * Сервис для расчета загрузки ресурсов
 */
export class ResourceLoadingService {
  /**
   * Рассчитывает данные гистограммы для конкретного ресурса на заданный период
   */
  public calculateHistogram(
    resource: Resource, 
    tasks: Task[], 
    startDate: Date, 
    endDate: Date
  ): IResourceHistogramData {
    const days: IResourceWorkloadDay[] = [];
    const current = new Date(startDate);
    
    // Проходим по каждому дню периода
    while (current <= endDate) {
      const dayStart = new Date(current.setHours(0, 0, 0, 0));
      const dayEnd = new Date(current.setHours(23, 59, 59, 999));
      
      // Находим все задачи ресурса в этот день
      const dayTasks = tasks.filter(t => 
        t.resourceIds?.includes(resource.id) && 
        new Date(t.startDate) <= dayEnd && 
        new Date(t.endDate) >= dayStart
      );
      
      // Расчет загрузки (упрощенно: каждая задача дает нагрузку 1/N от доступности ресурса)
      // В реальности здесь должна быть работа с Assignment.units
      let dailyWorkload = 0;
      dayTasks.forEach(() => {
        dailyWorkload += 0.5; // Предположим, каждая задача занимает 50% времени ресурса
      });

      days.push({
        date: new Date(current),
        workloadPercent: dailyWorkload,
        maxCapacityPercent: resource.maxUnits || 1.0,
        isOverloaded: dailyWorkload > (resource.maxUnits || 1.0)
      });
      
      current.setDate(current.getDate() + 1);
    }

    const totalWorkload = days.reduce((sum, d) => sum + d.workloadPercent, 0);
    
    return {
      resourceId: resource.id,
      resourceName: resource.name,
      days,
      totalWorkload,
      averageWorkload: totalWorkload / days.length
    };
  }
}


