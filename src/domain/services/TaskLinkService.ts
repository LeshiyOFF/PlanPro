import { Task } from '@/store/project/interfaces'
import { CalendarDateService } from '@/services/CalendarDateService'
import { CalendarMathService } from './CalendarMathService'
import { DurationSyncService } from './DurationSyncService'
import { CalendarPreferences } from '@/types/Master_Functionality_Catalog'

/** Тип конфликта дат для UI: преемник раньше предшественника или во время/в момент окончания. */
export type DependencyConflictKind = 'before_predecessor' | 'during_or_end'

/** Результат проверки конфликта дат при связи задач (преемник начинается раньше допустимой даты по связи). */
export interface DependencyConflictResult {
  hasConflict: boolean
  successorName: string
  predecessorName: string
  minStartDate: Date
  /** Уточнение для UI: раньше начала предшественника или во время выполнения/в момент окончания. */
  conflictKind?: DependencyConflictKind
}

/** Опции при создании связи (для модального выбора пользователя). */
export interface LinkTasksOptions {
  skipDateCorrection?: boolean
}

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
   * Минимальная дата начала преемника по связи FS: полночь следующего календарного дня
   * после окончания предшественника. Согласовано с Гантом (toLocalMidnight).
   */
  private static getMinSuccessorStartDate(predecessorEndDate: Date): Date {
    const nextDay = new Date(predecessorEndDate)
    nextDay.setDate(nextDay.getDate() + 1)
    return CalendarDateService.toLocalMidnight(nextDay)
  }

  /**
   * Проверяет, создаёт ли связь successor→predecessor конфликт дат
   * (преемник начинается раньше окончания предшественника).
   */
  public static detectDateConflict(
    tasks: Task[],
    successorId: string,
    predecessorId: string,
  ): DependencyConflictResult {
    const successor = tasks.find(t => t.id === successorId)
    const predecessor = tasks.find(t => t.id === predecessorId)
    const successorName = successor?.name ?? successorId
    const predecessorName = predecessor?.name ?? predecessorId
    const minStart = predecessor
      ? TaskLinkService.getMinSuccessorStartDate(predecessor.endDate)
      : new Date(0)

    const hasConflict =
      !!successor &&
      !!predecessor &&
      successor.startDate < minStart

    return { hasConflict, successorName, predecessorName, minStartDate: minStart }
  }

  /**
   * Проверяет, создаёт ли сдвиг задачи (новые даты) конфликт с предшественником.
   * Используется при перетаскивании на Ганте или в календаре.
   */
  public static detectConflictForMove(
    tasks: Task[],
    successorId: string,
    newStartDate: Date,
  ): { conflict: DependencyConflictResult; predecessorId: string } | null {
    const successor = tasks.find((t) => t.id === successorId)
    const predIds = successor?.predecessors ?? []
    if (predIds.length === 0) return null

    for (const predId of predIds) {
      const predecessor = tasks.find((t) => t.id === predId)
      
      // ИСКЛЮЧЕНИЕ: Пропускаем проверку конфликта с суммарными задачами.
      // Обоснование:
      // 1. Даты суммарной задачи (startDate/endDate) пересчитываются автоматически
      //    по подзадачам (TaskSchedulingService.recalculateSummaryTasks).
      // 2. При перемещении дочерней задачи суммарная подстраивается, поэтому
      //    проверка "преемник начинается раньше предшественника" не имеет смысла.
      // 3. Модальное окно конфликта в этом случае дезориентирует пользователя.
      if (predecessor?.isSummary) {
        console.debug(
          `[TaskLinkService.detectConflictForMove] Skipping conflict check with summary predecessor: ${predecessor.name} (${predId})`,
        )
        continue
      }
      
      const res = TaskLinkService.detectDateConflict(tasks, successorId, predId)
      if (newStartDate < res.minStartDate) {
        const conflictKind: DependencyConflictKind = predecessor && newStartDate < predecessor.startDate
          ? 'before_predecessor'
          : 'during_or_end'
        return {
          conflict: { ...res, hasConflict: true, conflictKind },
          predecessorId: predId,
        }
      }
    }
    return null
  }

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
   *    (ТОЛЬКО если НЕ загружается файл и НЕ skipDateCorrection)
   * 3. Сохраняет длительность задачи при сдвиге
   *
   * @param tasks Массив всех задач
   * @param sourceId ID задачи-преемника (successor)
   * @param targetId ID задачи-предшественника (predecessor)
   * @param calendarPrefs Календарные настройки для расчёта дат
   * @param options Опции (skipDateCorrection — не сдвигать даты при конфликте)
   * @returns Обновлённый массив задач
   */
  public static link(
    tasks: Task[],
    sourceId: string,
    targetId: string,
    calendarPrefs: CalendarPreferences,
    options?: LinkTasksOptions,
  ): Task[] {
    const targetTask = tasks.find(t => t.id === targetId)
    if (!targetTask) return tasks

    const skipCorrection = options?.skipDateCorrection ?? false

    return tasks.map(task => {
      if (task.id === sourceId) {
        const preds = task.predecessors || []
        if (preds.includes(targetId)) return task

        // Вычисляем минимально возможную дату начала: полночь следующего календарного дня
        const minStartDate = TaskLinkService.getMinSuccessorStartDate(targetTask.endDate)

        // Рассчитываем длительность successor (сохраняем при сдвиге)
        const duration = CalendarMathService.calculateDuration(
          task.startDate, task.endDate, 'hours', calendarPrefs,
        )

        // ✅ АВТОКОРРЕКЦИЯ: Если successor начинается раньше минимальной даты
        // КРИТИЧНО: Пропускаем при загрузке файла или при явном skipDateCorrection!
        let finalStartDate: Date
        let finalEndDate: Date
        const shouldAutoCorrect =
          !TaskLinkService.isLoadingFromFile && !skipCorrection && task.startDate < minStartDate

        if (shouldAutoCorrect) {
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
          if (task.startDate < minStartDate && (TaskLinkService.isLoadingFromFile || skipCorrection)) {
            console.log(
              `[TaskLinkService] ⏭️ Skipping autocorrection for "${task.name}" (loading/skip mode)`,
            )
          }
          finalStartDate = task.startDate
          finalEndDate = task.endDate
        }

        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Сохраняем duration при создании связи
        // Это обеспечивает корректную синхронизацию с Java Core для CPM расчётов
        const finalDuration = DurationSyncService.calculateDurationInDays(finalStartDate, finalEndDate)
        
        return {
          ...task,
          predecessors: [...preds, targetId],
          startDate: finalStartDate,
          endDate: finalEndDate,
          duration: finalDuration,
        }
      }
      return task
    })
  }

  /**
   * Проверяет, можно ли выбрать задачу potentialPredId в качестве предшественника для taskId.
   * Возвращает false для:
   * - самой себя (taskId === potentialPredId),
   * - суммарной задачи (по стандарту MS Project связи только между исполнимыми задачами),
   * - задачи, связь с которой создаёт цикл.
   */
  public static isValidPredecessor(tasks: Task[], taskId: string, potentialPredId: string): boolean {
    if (taskId === potentialPredId) return false

    const potentialPred = tasks.find(t => t.id === potentialPredId)
    if (potentialPred?.isSummary) return false

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

  /**
   * Возвращает ключ причины, по которой задачу нельзя выбрать как предшественника (для тултипа).
   * null — задача допустима.
   */
  public static getPredecessorDisabledReason(
    tasks: Task[],
    taskId: string,
    potentialPredId: string,
  ): 'gantt.link_disabled_self' | 'gantt.link_disabled_summary' | 'gantt.link_disabled_cycle' | null {
    if (taskId === potentialPredId) return 'gantt.link_disabled_self'

    const potentialPred = tasks.find(t => t.id === potentialPredId)
    if (potentialPred?.isSummary) return 'gantt.link_disabled_summary'

    const checkCycle = (currentId: string, visited: Set<string>): boolean => {
      if (currentId === taskId) return true
      if (visited.has(currentId)) return false
      visited.add(currentId)
      const task = tasks.find(t => t.id === currentId)
      if (!task || !task.predecessors) return false
      return task.predecessors.some(predId => checkCycle(predId, visited))
    }
    if (checkCycle(potentialPredId, new Set())) return 'gantt.link_disabled_cycle'

    return null
  }
}

