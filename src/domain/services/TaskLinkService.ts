import { Task } from '@/store/project/interfaces'
import { CalendarDateService } from '@/services/CalendarDateService'
import { CalendarPreferences } from '@/types/Master_Functionality_Catalog'

// 7-DAY-CALENDAR: Все дни рабочие (суббота, воскресенье, праздники).
// Выходные назначаются на РЕСУРСЫ, не на проектный календарь.
// Frontend и Java Core используют единую логику: +1 календарный день для FS-связей.

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
   * Минимальная дата начала преемника по связи FS.
   * 
   * 7-DAY-CALENDAR: Все дни рабочие (суббота, воскресенье, праздники включены).
   * Выходные назначаются на РЕСУРСЫ, не на проектный календарь.
   * 
   * Для FS-связи: successor может начаться ТОЛЬКО на следующий день после predecessor.
   * Если predecessor заканчивается 20-го, минимальная дата для successor — 21-е.
   * 
   * @returns predecessor.endDate + 1 календарный день (нормализованный к полуночи)
   */
  private static getMinSuccessorStartDate(predecessorEndDate: Date): Date {
    // 7-DAY-CALENDAR: Добавляем +1 календарный день.
    // Все дни рабочие — выходные на уровне ресурсов, не проекта.
    const nextDay = new Date(predecessorEndDate.getTime() + 24 * 60 * 60 * 1000)
    return CalendarDateService.toLocalMidnight(nextDay)
  }

  /**
   * Проверяет, создаёт ли связь successor→predecessor конфликт дат.
   * 
   * 7-DAY-CALENDAR: Конфликт = successor.startDate < (predecessor.endDate + 1 день).
   * Это означает что successor начинается в тот же день или раньше окончания predecessor.
   * 
   * Пример: predecessor заканчивается 20-го
   * - successor на 20-е → КОНФЛИКТ (тот же день)
   * - successor на 21-е → OK (следующий день)
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
    
    // minStart = predecessor.endDate + 1 день (7-DAY-CALENDAR: все дни рабочие)
    const minStart = predecessor
      ? TaskLinkService.getMinSuccessorStartDate(predecessor.endDate)
      : new Date(0)

    // Конфликт: successor начинается РАНЬШЕ минимальной допустимой даты
    const hasConflict =
      !!successor &&
      !!predecessor &&
      successor.startDate < minStart

    return { hasConflict, successorName, predecessorName, minStartDate: minStart }
  }

  /**
   * Проверяет, создаёт ли сдвиг задачи (новые даты) конфликт с предшественником.
   * Используется при перетаскивании на Ганте или в календаре.
   * 
   * 7-DAY-CALENDAR: Конфликт возникает если newStartDate < (predecessor.endDate + 1 день).
   * 
   * Примеры (predecessor заканчивается 20-го, minStartDate = 21-е):
   * - newStartDate = 19-е → КОНФЛИКТ ('before_predecessor')
   * - newStartDate = 20-е → КОНФЛИКТ ('during_or_end')
   * - newStartDate = 21-е → OK
   * - newStartDate = 22-е → OK
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
      // 7-DAY-CALENDAR: newStartDate должен быть >= minStartDate (predecessor.endDate + 1 день)
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
   * Создаёт связь Finish-to-Start между задачами.
   *
   * АРХИТЕКТУРНОЕ РЕШЕНИЕ (FS-LINK-DATE-FIX v3):
   * Frontend НЕ корректирует даты successor! Это делает CPM в Java Core.
   * 
   * Алгоритм:
   * 1. Проверяет корректность связи (нет циклов)
   * 2. Добавляет predecessor в список
   * 3. НЕ меняет даты — CPM рассчитает правильные даты после sync
   *
   * @param tasks Массив всех задач
   * @param sourceId ID задачи-преемника (successor)
   * @param targetId ID задачи-предшественника (predecessor)
   * @param calendarPrefs Календарные настройки (не используется для дат, только для duration)
   * @param options Опции (skipDateCorrection — устаревший параметр, игнорируется)
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

    return tasks.map(task => {
      if (task.id === sourceId) {
        const preds = task.predecessors || []
        if (preds.includes(targetId)) return task

        // FS-LINK-DATE-FIX v3: НЕ корректируем даты!
        // CPM (Dependency.java) рассчитает правильную дату с учётом рабочего календаря.
        // Frontend только добавляет связь, даты обновятся после recalculateCriticalPath().
        console.log(
          `[TaskLinkService] Creating FS link: "${targetTask.name}" → "${task.name}". ` +
          `Dates will be calculated by CPM after sync.`,
        )
        
        return {
          ...task,
          predecessors: [...preds, targetId],
          // Даты НЕ меняем — CPM рассчитает
          startDate: task.startDate,
          endDate: task.endDate,
          duration: task.duration,
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

