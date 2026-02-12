/**
 * DurationSyncService - Централизованный сервис для синхронизации длительности задач.
 *
 * АРХИТЕКТУРНОЕ РЕШЕНИЕ (DURATION-SYNC-FIX v2.0):
 * Длительность задачи = КАЛЕНДАРНЫЕ дни (elapsed).
 * Графики работы (5/2, 2/2 и т.д.) учитываются только на уровне ресурсов.
 *
 * Этот сервис обеспечивает:
 * 1. Единую точку расчёта duration из дат (DRY)
 * 2. Консистентность данных между UI и Java Core
 * 3. Правильный расчёт критического пути (CPM)
 *
 * @version 2.0.0
 * @author ProjectLibre Team
 */
export class DurationSyncService {
  /** Миллисекунд в одном календарном дне (24 часа) */
  private static readonly MS_PER_CALENDAR_DAY = 24 * 60 * 60 * 1000

  /**
   * Вычисляет длительность в КАЛЕНДАРНЫХ днях из дат начала и окончания.
   *
   * DURATION-SYNC-FIX: Длительность = календарные дни (elapsed).
   * Графики работы учитываются только на уровне ресурсов.
   *
   * @param startDate Дата начала задачи
   * @param endDate Дата окончания задачи
   * @returns Длительность в календарных днях (округлено до целого, минимум 1)
   */
  public static calculateDurationInDays(startDate: Date, endDate: Date): number {
    // Валидация дат
    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.warn('[DurationSyncService] Invalid dates, returning 1 day')
      return 1
    }

    // Если endDate раньше или равна startDate — минимум 1 день
    if (endDate.getTime() <= startDate.getTime()) {
      return 1
    }

    // DURATION-SYNC-FIX: Вычисляем КАЛЕНДАРНЫЕ дни (elapsed)
    // Без учёта выходных — графики работы учитываются на уровне ресурсов
    const diffMs = endDate.getTime() - startDate.getTime()
    const calendarDays = Math.max(1, Math.round(diffMs / DurationSyncService.MS_PER_CALENDAR_DAY))

    console.debug(
      `[DurationSyncService] calculateDurationInDays (elapsed): ` +
        `${startDate.toISOString()} → ${endDate.toISOString()} = ${calendarDays} calendar days`,
    )

    return calendarDays
  }

  /**
   * Обновляет объект задачи с пересчитанным duration при изменении дат.
   * Возвращает обновлённые поля для partial update.
   *
   * @param updates Частичное обновление задачи (должно содержать startDate и/или endDate)
   * @param currentTask Текущее состояние задачи (для получения недостающих дат)
   * @returns Обновлённые поля с пересчитанным duration
   */
  public static enrichUpdatesWithDuration<T extends { startDate?: Date; endDate?: Date; duration?: number }>(
    updates: Partial<T>,
    currentTask: { startDate: Date; endDate: Date; duration?: number },
  ): Partial<T> {
    // Если меняется хотя бы одна дата - пересчитываем duration
    const hasDateChange = 'startDate' in updates || 'endDate' in updates

    if (!hasDateChange) {
      return updates
    }

    // Берём новые даты или текущие
    const startDate = updates.startDate ?? currentTask.startDate
    const endDate = updates.endDate ?? currentTask.endDate

    // Вычисляем новый duration
    const newDuration = DurationSyncService.calculateDurationInDays(startDate, endDate)

    console.debug(
      `[DurationSyncService] enrichUpdatesWithDuration: duration ${currentTask.duration ?? 'undefined'} → ${newDuration}`,
    )

    return {
      ...updates,
      duration: newDuration,
    }
  }

  /**
   * Вычисляет duration для передачи на Гант при изменении размера задачи.
   * Используется в ProfessionalGantt.onDateChange.
   *
   * @param ganttStart Дата начала из Ганта
   * @param ganttEnd Дата окончания из Ганта
   * @returns Длительность в днях
   */
  public static calculateDurationFromGantt(ganttStart: Date, ganttEnd: Date): number {
    return DurationSyncService.calculateDurationInDays(ganttStart, ganttEnd)
  }
}
