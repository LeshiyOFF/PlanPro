import { Task } from '@/store/project/interfaces'
import { CalendarMathService } from './CalendarMathService'
import { CalendarPreferences } from '@/types/Master_Functionality_Catalog'

/**
 * TaskLinkService - Сервис для управления связями между задачами.
 * Реализует интеллектуальную корректировку дат при создании связей.
 *
 * ВАЖНО: Автокоррекция дат НЕ выполняется при загрузке файла,
 * чтобы сохранить исходные даты из проекта.
 *
 * @version 2.0.0
 */
export class TaskLinkService {

  private static isLoadingFromFile = false

  /**
   * Устанавливает режим загрузки файла.
   * В этом режиме автокоррекция дат отключена.
   */
  public static setLoadingMode(loading: boolean): void {
    this.isLoadingFromFile = loading
    if (loading) {
      console.log('[TaskLinkService] 🔒 Autocorrection DISABLED (loading file)')
    } else {
      console.log('[TaskLinkService] 🔓 Autocorrection ENABLED (manual editing)')
    }
  }

  /**
   * Создаёт связь Finish-to-Start между задачами с автокоррекцией дат.
   *
   * Алгоритм:
   * 1. Проверяет корректность связи (нет циклов)
   * 2. Если successor начинается раньше окончания predecessor — корректирует даты
   *    (ТОЛЬКО если НЕ загружается файл)
   * 3. Сохраняет длительность задачи при сдвиге
   *
   * @param tasks Массив всех задач
   * @param sourceId ID задачи-преемника (successor)
   * @param targetId ID задачи-предшественника (predecessor)
   * @param calendarPrefs Календарные настройки для расчёта дат
   * @returns Обновлённый массив задач
   */
  public static link(
    tasks: Task[],
    sourceId: string,
    targetId: string,
    calendarPrefs: CalendarPreferences,
  ): Task[] {
    const targetTask = tasks.find(t => t.id === targetId)
    if (!targetTask) return tasks

    return tasks.map(task => {
      if (task.id === sourceId) {
        const preds = task.predecessors || []
        if (preds.includes(targetId)) return task

        // Вычисляем минимально возможную дату начала (день после окончания predecessor)
        const minStartDate = new Date(targetTask.endDate)
        minStartDate.setDate(minStartDate.getDate() + 1)

        // Рассчитываем длительность successor (сохраняем при сдвиге)
        const duration = CalendarMathService.calculateDuration(
          task.startDate, task.endDate, 'hours', calendarPrefs,
        )

        // ✅ АВТОКОРРЕКЦИЯ: Если successor начинается раньше минимальной даты
        // КРИТИЧНО: Пропускаем автокоррекцию при загрузке файла!
        let finalStartDate: Date
        let finalEndDate: Date

        if (!TaskLinkService.isLoadingFromFile && task.startDate < minStartDate) {
          console.warn(
            `[TaskLinkService] Date conflict detected: task "${task.name}" starts before predecessor "${targetTask.name}" ends. Auto-fixing...`,
          )
          console.log(`[TaskLinkService] Old dates: ${task.startDate.toISOString()} - ${task.endDate.toISOString()}`)

          finalStartDate = minStartDate
          finalEndDate = CalendarMathService.calculateFinishDate(
            finalStartDate, duration, calendarPrefs,
          )

          console.log(`[TaskLinkService] New dates: ${finalStartDate.toISOString()} - ${finalEndDate.toISOString()}`)
        } else {
          // Даты корректны ИЛИ загружается файл — используем существующие
          if (TaskLinkService.isLoadingFromFile && task.startDate < minStartDate) {
            console.log(
              `[TaskLinkService] ⏭️ Skipping autocorrection for "${task.name}" (loading mode)`,
            )
          }
          finalStartDate = task.startDate
          finalEndDate = task.endDate
        }

        return {
          ...task,
          predecessors: [...preds, targetId],
          startDate: finalStartDate,
          endDate: finalEndDate,
        }
      }
      return task
    })
  }

  public static isValidPredecessor(tasks: Task[], taskId: string, potentialPredId: string): boolean {
    if (taskId === potentialPredId) return false

    const checkCycle = (currentId: string, visited: Set<string>): boolean => {
      if (currentId === taskId) return true
      if (visited.has(currentId)) return false
      visited.add(currentId)

      const task = tasks.find(t => t.id === currentId)
      if (!task || !task.predecessors) return false

      return task.predecessors.some(predId => checkCycle(predId, visited))
    }

    return !checkCycle(potentialPredId, new Set())
  }
}

