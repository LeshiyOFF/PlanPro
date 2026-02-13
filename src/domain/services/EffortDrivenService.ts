import { Task } from '@/store/project/interfaces'
import { CalendarPreferences } from '@/types/Master_Functionality_Catalog'
import { CalendarMathService } from './CalendarMathService'
import { DurationSyncService } from './DurationSyncService'

/**
 * EffortDrivenService - Сервис для пересчёта длительности при изменении ресурсов.
 * 
 * Effort-driven scheduling:
 * - При добавлении ресурсов → длительность уменьшается (работа делится)
 * - При удалении ресурсов → длительность увеличивается (меньше исполнителей)
 * - Формула: Duration = Work / (Units * Count)
 * 
 * Clean Architecture: Domain Service
 * SOLID: Single Responsibility - пересчёт длительности по effort-driven правилу
 * 
 * @version 1.0 - Создан 09.02.2026
 */
export class EffortDrivenService {
  /**
   * Пересчитывает длительность задачи при изменении назначений.
   * Вызывается только если effortDriven = true в настройках.
   * 
   * @param task - Задача с обновлёнными назначениями
   * @param originalTotalUnits - Суммарные units до изменения
   * @param calendarPrefs - Настройки календаря
   * @returns Обновлённая задача с пересчитанной длительностью
   */
  public static recalculateDuration(
    task: Task,
    originalTotalUnits: number,
    calendarPrefs: CalendarPreferences,
  ): Task {
    const assignments = task.resourceAssignments || []
    const newTotalUnits = assignments.reduce((sum, a) => sum + (a.units || 1), 0)
    
    // Если нет назначений или units не изменились — возвращаем как есть
    if (newTotalUnits === 0 || newTotalUnits === originalTotalUnits) {
      return task
    }
    
    // UNITS-FIX: Если originalUnits = 0, это первое назначение на задачу.
    // В этом случае НЕ изменяем duration - первый ресурс просто берёт на себя 
    // всю работу по исходной длительности. Это стандартное поведение MS Project.
    if (originalTotalUnits === 0) {
      console.debug('[EffortDrivenService] First assignment - skipping duration recalculation')
      return task
    }
    
    // Соотношение: если было 2 units, стало 1 → duration * 2
    const ratio = originalTotalUnits / newTotalUnits
    
    // Текущая длительность в часах
    const currentDuration = CalendarMathService.calculateDuration(
      task.startDate, task.endDate, 'hours', calendarPrefs,
    )
    
    // Новая длительность
    const newDurationHours = currentDuration.value * ratio
    
    // Вычисляем новую дату окончания
    const newEndDate = CalendarMathService.calculateFinishDate(
      task.startDate,
      { value: newDurationHours, unit: 'hours' },
      calendarPrefs,
    )
    
    // Пересчитываем duration в днях для синхронизации с Java Core
    const newDurationDays = DurationSyncService.calculateDurationInDays(task.startDate, newEndDate)
    
    return {
      ...task,
      endDate: newEndDate,
      duration: newDurationDays,
    }
  }
  
  /**
   * Вычисляет суммарные units из назначений задачи.
   * Используется для сохранения исходного значения перед изменением.
   */
  public static getTotalUnits(task: Task): number {
    const assignments = task.resourceAssignments || []
    return assignments.reduce((sum, a) => sum + (a.units || 1), 0)
  }
  
  /**
   * Проверяет, нужно ли применять effort-driven логику.
   * @param effortDrivenEnabled - Настройка из preferences.schedule.effortDriven
   * @param task - Задача
   */
  public static shouldApply(effortDrivenEnabled: boolean, task: Task): boolean {
    // Не применяем для вех и суммарных задач
    if (task.isMilestone || task.isSummary) return false
    
    // Не применяем если отключено в настройках
    if (!effortDrivenEnabled) return false
    
    return true
  }
}
