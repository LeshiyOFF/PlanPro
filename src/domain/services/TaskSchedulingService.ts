import { Task } from '@/store/project/interfaces'
import { CalendarMathService } from './CalendarMathService'
import { DurationSyncService } from './DurationSyncService'
import { CalendarPreferences, SchedulePreferences, TaskType } from '@/types/Master_Functionality_Catalog'
import { CalendarDateService } from '@/services/CalendarDateService'
import { normalizeFraction } from '@/utils/ProgressFormatter'

/** Маппинг числового schedulingRule в TaskType enum */
const SCHEDULING_RULE_MAP: Record<number, TaskType> = {
  0: TaskType.FIXED_UNITS,
  1: TaskType.FIXED_DURATION,
  2: TaskType.FIXED_WORK,
}

/** Ограничения, защищающие даты от автоматического перепланирования */
const REQUIRED_DATE_CONSTRAINTS = ['MustStartOn', 'MustFinishOn'] as const

/**
 * TaskSchedulingService - Сервис для пересчета расписания задач.
 */
export class TaskSchedulingService {
  /**
   * Пересчитывает все задачи проекта.
   * @param tasks - Массив задач
   * @param calendarPrefs - Настройки календаря
   * @param schedulePrefs - Настройки планирования (опционально)
   */
  public static recalculateAll(
    tasks: Task[],
    calendarPrefs: CalendarPreferences,
    schedulePrefs?: Partial<SchedulePreferences>,
  ): Task[] {
    const honorRequiredDates = schedulePrefs?.honorRequiredDates ?? false
    
    // 1. Сначала пересчитываем длительности обычных задач
    const updatedTasks = tasks.map(task => {
      if (task.isMilestone || task.isSummary) return task
      
      // Проверяем honorRequiredDates: не пересчитываем задачи с обязательными датами
      if (honorRequiredDates && this.hasRequiredDateConstraint(task)) {
        return task
      }

      const currentDuration = CalendarMathService.calculateDuration(
        task.startDate, task.endDate, 'hours', calendarPrefs,
      )

      const newEndDate = CalendarMathService.calculateFinishDate(
        task.startDate, currentDuration, calendarPrefs,
      )

      const durationInDays = DurationSyncService.calculateDurationInDays(task.startDate, newEndDate)
      
      return { ...task, endDate: newEndDate, duration: durationInDays }
    })

    // 2. Затем пересчитываем суммарные задачи (снизу вверх)
    return this.recalculateSummaryTasks(updatedTasks)
  }
  
  /**
   * Проверяет, имеет ли задача ограничение обязательной даты.
   * Такие задачи не должны перепланироваться автоматически при honorRequiredDates = true.
   */
  private static hasRequiredDateConstraint(task: Task): boolean {
    if (!task.constraint) return false
    return REQUIRED_DATE_CONSTRAINTS.includes(task.constraint as typeof REQUIRED_DATE_CONSTRAINTS[number])
  }

  /**
   * Пересчитывает даты и прогресс для суммарных задач.
   * Defensive Programming: нормализует агрегированные даты к локальной полуночи.
   */
  public static recalculateSummaryTasks(tasks: Task[]): Task[] {
    const result = [...tasks]

    // Идем с конца в начало, чтобы сначала обработать глубокие уровни вложенности
    for (let i = result.length - 1; i >= 0; i--) {
      const task = result[i]
      if (!task.isSummary) continue

      // Находим все прямые и косвенные подзадачи
      const subtasks: Task[] = []
      for (let j = i + 1; j < result.length; j++) {
        if (result[j].level > task.level) {
          subtasks.push(result[j])
        } else {
          break
        }
      }

      if (subtasks.length > 0) {
        const startDates = subtasks.map(t => new Date(t.startDate).getTime())
        const endDates = subtasks.map(t => new Date(t.endDate).getTime())

        // SEMANTIC-FIX: startDate → toLocalMidnight (00:00:00), endDate → toLocalEndOfDay (23:59:59.999)
        // Это критично для корректной синхронизации с Java Core (CPM расчёты)
        const minStart = CalendarDateService.toLocalMidnight(new Date(Math.min(...startDates)))
        const maxEnd = CalendarDateService.toLocalEndOfDay(new Date(Math.max(...endDates)))

        // Средний прогресс: игнорируем вехи (как в MS Project)
        // Вехи - это контрольные точки, а не работа, поэтому не учитываем их в прогрессе
        const nonMilestones = subtasks.filter(t => !t.isMilestone)
        let avgProgress = 0

        if (nonMilestones.length > 0) {
          const totalProgress = nonMilestones.reduce((acc, t) => acc + (t.progress || 0), 0)
          // Используем normalizeFraction для устранения IEEE 754 артефактов
          // При делении (например, 0.84 / 3 = 0.2799999999...) нужна нормализация
          avgProgress = normalizeFraction(totalProgress / nonMilestones.length)
        }

        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Вычисляем duration для суммарной задачи
        const summaryDuration = DurationSyncService.calculateDurationInDays(minStart, maxEnd)
        
        result[i] = {
          ...task,
          startDate: minStart,
          endDate: maxEnd,
          progress: avgProgress,
          duration: summaryDuration,
        }
      }
    }

    return result
  }

  /**
   * Подготавливает новую задачу с нормализацией дат (Defensive Programming).
   * ВСЕГДА нормализует даты к локальной полуночи, независимо от источника данных.
   * Это защищает от UTC-сдвигов при создании задач из любых View-компонентов.
   * 
   * @param task - Новая задача
   * @param schedulePrefs - Настройки планирования
   * @param calendarPrefs - Настройки календаря
   */
  public static prepareNewTask(
    task: Task,
    schedulePrefs: Partial<SchedulePreferences> | null | undefined,
    calendarPrefs: CalendarPreferences,
  ): Task {
    const newTask = { ...task }

    // Устанавливаем тип задачи из настроек schedulingRule
    if (!newTask.type && schedulePrefs?.schedulingRule !== undefined) {
      const ruleNum = typeof schedulePrefs.schedulingRule === 'number' 
        ? schedulePrefs.schedulingRule 
        : 0
      newTask.type = SCHEDULING_RULE_MAP[ruleNum] ?? TaskType.FIXED_UNITS
    }

    // Defensive Programming: ВСЕГДА нормализуем startDate
    if (newTask.startDate) {
      newTask.startDate = CalendarDateService.toLocalMidnight(newTask.startDate)
    } else if (schedulePrefs?.newTasksStartToday) {
      newTask.startDate = CalendarDateService.toLocalMidnight(new Date())
    }

    // SEMANTIC-FIX: endDate должен быть концом дня (23:59:59.999), не полуночью!
    // Это критично для корректной синхронизации с Java Core (CPM расчёты)
    if (newTask.endDate) {
      newTask.endDate = CalendarDateService.toLocalEndOfDay(newTask.endDate)
    } else if (newTask.startDate) {
      // calculateFinishDate возвращает endDate с 23:59:59.999
      newTask.endDate = CalendarMathService.calculateFinishDate(
        newTask.startDate, { value: 1, unit: 'days' }, calendarPrefs,
      )
    }

    // Устанавливаем duration для синхронизации с Java Core для CPM расчётов
    if (newTask.startDate && newTask.endDate) {
      newTask.duration = DurationSyncService.calculateDurationInDays(newTask.startDate, newTask.endDate)
    }

    return newTask
  }
}

