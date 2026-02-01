/**
 * CalendarDateService - Сервис для работы с календарными датами без учета времени.
 * Реализует принципы SOLID и инкапсулирует логику расчета интервалов.
 *
 * ВАЖНО: Используем ЛОКАЛЬНОЕ время для синхронизации с библиотекой gantt-task-react,
 * которая внутренне использует new Date(year, month, day) в локальном часовом поясе.
 */
export class CalendarDateService {
  /**
   * Возвращает дату, нормализованную к полуночи в ЛОКАЛЬНОМ часовом поясе.
   * Синхронизируется с внутренней логикой библиотеки gantt-task-react (startOfDate).
   *
   * Пример для MSK (UTC+3):
   * - Вход: 24.01.2026 15:58 MSK
   * - Выход: 24.01.2026 00:00:00 MSK (= 23.01.2026 21:00:00 UTC)
   * - Результат: синхронизация с колонками библиотеки Ганта
   */
  public static toLocalMidnight(date: Date | string | number): Date {
    const d = new Date(date)
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
  }

  /**
   * Возвращает дату, нормализованную к концу дня (23:59:59.999) в ЛОКАЛЬНОМ часовом поясе.
   * Позволяет библиотеке Ганта визуально заполнять колонку дня до конца.
   */
  public static toLocalEndOfDay(date: Date | string | number): Date {
    const d = new Date(date)
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
  }

  /**
   * Вычисляет разницу в полных календарных днях между двумя датами.
   * Игнорирует время и переходы DST.
   */
  public static getCalendarDaysDiff(start: Date, end: Date): number {
    const d1 = this.toLocalMidnight(start)
    const d2 = this.toLocalMidnight(end)

    // Используем UTC для расчета разницы, чтобы избежать проблем с DST
    const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate())
    const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate())

    return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24))
  }

  /**
   * Проверяет, является ли дата сегодняшним днем (календарно).
   */
  public static isToday(date: Date): boolean {
    const today = new Date()
    const d = this.toLocalMidnight(date)
    return d.getFullYear() === today.getFullYear() &&
           d.getMonth() === today.getMonth() &&
           d.getDate() === today.getDate()
  }
}
