import { Task, getTaskResourceIds } from '@/store/project/interfaces'
import { Resource } from '@/types/resource-types'
import { IResourceHistogramData, IResourceWorkloadDay } from '../interfaces/IResourceHistogram'

/**
 * Сервис для расчета загрузки ресурсов.
 * Использует реальные units из resourceAssignments и maxUnits ресурса.
 * 
 * @version 2.0 - Исправлено: теперь используется resource.maxUnits для определения перегрузки
 * @version 3.0 - ФОРМАТ-ФИХ: Добавлена поддержка двух форматов maxUnits (целое/коэффициент)
 *                Это исправляет баг, когда гистограмма не показывала перегруз при units=2.0, maxUnits=100
 */
export class ResourceLoadingService {

  /** Базовая мощность ресурса по умолчанию = 100% (используется как fallback) */
  private static readonly DEFAULT_MAX_UNITS = 1.0

  /**
   * Рассчитывает данные гистограммы для конкретного ресурса на заданный период
   */
  public calculateHistogram(
    resource: Resource,
    tasks: Task[],
    startDate: Date,
    endDate: Date,
  ): IResourceHistogramData {
    const days = this.buildDaysArray(resource, tasks, startDate, endDate)
    const totalWorkload = days.reduce((sum, d) => sum + d.workloadPercent, 0)
    const avgWorkload = days.length > 0 ? totalWorkload / days.length : 0

    return {
      resourceId: resource.id,
      resourceName: resource.name,
      days,
      totalWorkload,
      averageWorkload: avgWorkload,
    }
  }

  /**
   * Строит массив данных по дням
   */
  private buildDaysArray(
    resource: Resource, tasks: Task[], startDate: Date, endDate: Date,
  ): IResourceWorkloadDay[] {
    const days: IResourceWorkloadDay[] = []
    const current = new Date(startDate)
    current.setHours(0, 0, 0, 0)

    while (current <= endDate) {
      const day = this.calculateDayWorkload(resource, tasks, new Date(current))
      days.push(day)
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  /**
   * Рассчитывает нагрузку для конкретного дня.
   * Суммирует units из всех назначений, активных в этот день.
   * 
   * ИСПРАВЛЕНИЕ: Теперь использует resource.maxUnits для определения перегрузки.
   * - Если maxUnits = 1.0 (100%), перегрузка при workload > 100%
   * - Если maxUnits = 0.5 (50%), перегрузка при workload > 50%
   * - Если maxUnits = 2.0 (200%), перегрузка при workload > 200%
   */
  private calculateDayWorkload(
    resource: Resource, tasks: Task[], date: Date,
  ): IResourceWorkloadDay {
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const workloadPercent = this.sumUnitsForDay(resource.id, tasks, dayStart, dayEnd)
    
    // FIX: Используем реальный maxUnits ресурса вместо захардкоженного 1.0
    // maxUnits может быть: 0.5 (part-time), 1.0 (full-time), 2.0 (overtime capable), etc.
    const maxCapacity = this.getResourceMaxCapacity(resource)

    return {
      date: new Date(date),
      workloadPercent,
      maxCapacityPercent: maxCapacity,
      isOverloaded: workloadPercent > maxCapacity,
    }
  }

  /**
   * Получает максимальную мощность ресурса.
   * Использует resource.maxUnits если доступно, иначе DEFAULT_MAX_UNITS.
   * 
   * ФОРМАТ-ФИХ v3.0: Поддержка двух форматов maxUnits:
   * - Целое число (100 = 100%) → преобразуется в коэффициент 1.0
   * - Коэффициент (1.0 = 100%) → используется как есть
   * 
   * Это необходимо для корректного определения перегрузки:
   * - units = 2.0 (200%), maxUnits = 100 → после конвертации: 2.0 > 1.0 = перегруз ✓
   * - units = 2.0 (200%), maxUnits = 100 → без конвертации: 2.0 > 100 = НЕТ перегруза ✗
   */
  private getResourceMaxCapacity(resource: Resource): number {
    const rawMax = resource.maxUnits ?? ResourceLoadingService.DEFAULT_MAX_UNITS
    
    // Если maxUnits хранится как целое число (> 10), делим на 100 для получения коэффициента
    // Примеры: 100 → 1.0, 50 → 0.5, 200 → 2.0
    // Если уже коэффициент (≤ 10), используем как есть
    // Примеры: 1.0 → 1.0, 0.5 → 0.5, 2.0 → 2.0
    const effectiveMaxUnits = rawMax > 10 ? rawMax / 100 : rawMax
    
    return effectiveMaxUnits
  }

  /**
   * Суммирует units всех назначений ресурса, активных в указанный день.
   * Поддерживает обратную совместимость: если resourceAssignments пуст,
   * проверяет устаревшее поле resourceIds (с units=1.0 по умолчанию).
   */
  private sumUnitsForDay(
    resourceId: string, tasks: Task[], dayStart: Date, dayEnd: Date,
  ): number {
    let totalUnits = 0

    for (const task of tasks) {
      const taskStart = new Date(task.startDate)
      const taskEnd = new Date(task.endDate)

      if (taskStart <= dayEnd && taskEnd >= dayStart) {
        // Приоритет: новый формат resourceAssignments
        const assignment = task.resourceAssignments?.find(a => a.resourceId === resourceId)
        if (assignment) {
          totalUnits += assignment.units
        } else if (getTaskResourceIds(task).includes(resourceId)) {
          // Fallback: старый формат resourceIds (100% по умолчанию)
          totalUnits += ResourceLoadingService.DEFAULT_MAX_UNITS
        }
      }
    }

    return totalUnits
  }
}


