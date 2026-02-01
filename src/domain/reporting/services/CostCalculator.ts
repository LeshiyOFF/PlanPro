import { Task, getTaskResourceIds } from '@/store/project/interfaces';
import { Resource } from '@/types/resource-types';

/**
 * Калькулятор затрат проекта для отчётов.
 * 
 * Расчёт затрат:
 * - Трудозатраты (Work): ставка × часы × загрузка для каждого назначения
 * - Материалы (Material): (ставка × количество) + разовая стоимость для каждого назначения
 * - Фиксированные (Cost): сумма ставок ресурсов типа Cost
 * 
 * Clean Architecture: Domain Service.
 * SOLID: Single Responsibility - расчёт стоимости проекта.
 * 
 * @version 2.0 - Исправлен расчёт материалов
 */
export class CostCalculator {
  
  private static readonly HOURS_PER_DAY = 8;

  /**
   * Вычисляет полный анализ затрат по проекту.
   */
  public calculate(tasks: Task[], resources: Resource[]): CostAnalysis {
    const workResources = resources.filter(r => r.type === 'Work');
    const materialResources = resources.filter(r => r.type === 'Material');
    const costResources = resources.filter(r => r.type === 'Cost');

    const laborCost = this.calculateLaborCost(workResources, tasks);
    const materialCost = this.calculateMaterialCost(materialResources, tasks);
    const fixedCost = this.calculateFixedCost(costResources);

    return {
      laborCost: Math.round(laborCost),
      materialCost: Math.round(materialCost),
      fixedCost: Math.round(fixedCost),
      totalCost: Math.round(laborCost + materialCost + fixedCost)
    };
  }

  /**
   * Рассчитывает трудозатраты на основе назначений ресурсов.
   * Формула: Σ (часы работы × ставка × % загрузки)
   */
  private calculateLaborCost(workResources: Resource[], tasks: Task[]): number {
    let totalCost = 0;
    
    for (const resource of workResources) {
      // Пропускаем ресурсы без ставки
      if (!resource.standardRate || resource.standardRate <= 0) {
        continue;
      }
      
      const assignedTasks = this.getAssignedTasks(resource.id, tasks);
      
      for (const task of assignedTasks) {
        // Пропускаем summary задачи (они агрегируют дочерние)
        if (task.isSummary) continue;
        
        const durationHours = this.calculateTaskDurationHours(task);
        const units = this.getAssignmentUnits(resource.id, task);
        totalCost += durationHours * resource.standardRate * units;
      }
    }
    
    return totalCost;
  }

  /**
   * Рассчитывает стоимость материалов.
   * Формула: Σ ((ставка × количество) + разовая стоимость за использование)
   * 
   * @version 2.0 - Теперь учитывает standardRate × units, а не только costPerUse
   */
  private calculateMaterialCost(materialResources: Resource[], tasks: Task[]): number {
    let totalCost = 0;
    
    for (const resource of materialResources) {
      const assignedTasks = this.getAssignedTasks(resource.id, tasks);
      
      if (assignedTasks.length > 0) {
        for (const task of assignedTasks) {
          // Пропускаем summary задачи
          if (task.isSummary) continue;
          
          const units = this.getAssignmentUnits(resource.id, task);
          
          // Стоимость материала = (ставка за единицу × количество) + разовая стоимость
          const rateCost = (resource.standardRate || 0) * units;
          const useCost = resource.costPerUse || 0;
          
          totalCost += rateCost + useCost;
        }
      } else {
        // Материал не назначен на задачи, но может иметь фиксированную стоимость
        // Например, общие материалы проекта
        if (resource.costPerUse && resource.costPerUse > 0) {
          totalCost += resource.costPerUse;
        }
      }
    }
    
    return totalCost;
  }

  /**
   * Рассчитывает фиксированные затраты (ресурсы типа Cost).
   * Это могут быть: аренда, лицензии, услуги и т.д.
   */
  private calculateFixedCost(costResources: Resource[]): number {
    return costResources.reduce((sum, r) => {
      // Для ресурсов типа Cost используем standardRate как фиксированную сумму
      return sum + (r.standardRate || 0) + (r.costPerUse || 0);
    }, 0);
  }

  /**
   * Возвращает задачи, назначенные на ресурс.
   * Поддерживает оба формата: resourceAssignments (новый) и resourceIds (legacy).
   */
  private getAssignedTasks(resourceId: string, tasks: Task[]): Task[] {
    return tasks.filter(t => {
      // Новый формат: resourceAssignments с units
      if (t.resourceAssignments?.some(a => a.resourceId === resourceId)) {
        return true;
      }
      // Legacy формат: resourceIds (массив ID)
      if (t.resourceIds?.includes(resourceId)) {
        return true;
      }
      return false;
    });
  }

  /**
   * Получает процент назначения ресурса на задачу.
   * @returns число от 0 до N (1.0 = 100%)
   */
  private getAssignmentUnits(resourceId: string, task: Task): number {
    // Приоритет: новый формат resourceAssignments
    const assignment = task.resourceAssignments?.find(a => a.resourceId === resourceId);
    if (assignment) {
      return assignment.units;
    }
    // Legacy: getTaskResourceIds подразумевает 100% загрузку
    if (getTaskResourceIds(task).includes(resourceId)) {
      return 1.0;
    }
    return 1.0;
  }

  /**
   * Рассчитывает длительность задачи в рабочих часах.
   */
  private calculateTaskDurationHours(task: Task): number {
    const start = new Date(task.startDate).getTime();
    const end = new Date(task.endDate).getTime();
    const diffDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    return diffDays * CostCalculator.HOURS_PER_DAY;
  }
}

/**
 * Результат анализа затрат.
 */
export interface CostAnalysis {
  laborCost: number;
  materialCost: number;
  fixedCost: number;
  totalCost: number;
}
