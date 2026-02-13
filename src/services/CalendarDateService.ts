/**
 * CalendarDateService - Сервис для работы с календарными датами без учета времени.
 * Реализует принципы SOLID и инкапсулирует логику расчета интервалов.
 *
 * ВАЖНО: Используем ЛОКАЛЬНОЕ время для синхронизации с библиотекой gantt-task-react,
 * которая внутренне использует new Date(year, month, day) в локальном часовом поясе.
 */
export class CalendarDateService {
  /**
   * Возвращает дату НАЧАЛА, нормализованную к полуночи в ЛОКАЛЬНОМ часовом поясе.
   * Синхронизируется с внутренней логикой библиотеки gantt-task-react (startOfDate).
   *
   * ⚠️ ВАЖНО: Этот метод для startDate. Для endDate используйте toLocalMidnightEndOfDay().
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
   * Нормализует дату ОКОНЧАНИЯ к локальной полуночи ТОГО ЖЕ календарного дня.
   * 
   * MS PROJECT SEMANTIC FIX (v4.0):
   * Java Core хранит endDate как 23:59:59.999 последнего дня задачи.
   * Это означает "задача заканчивается В КОНЦЕ этого дня (включительно)".
   * 
   * ВАЖНО: 23:59:59.999 — это ВСЁ ЕЩЁ тот же календарный день!
   * Нормализуем к полуночи ТОГО ЖЕ дня для корректного отображения в UI.
   * 
   * ИСПРАВЛЕН БАГ: Ранее округляли ВВЕРХ к следующему дню, что вызывало
   * систематический сдвиг +1 день при каждом save/load цикле.
   * 
   * @param date - Дата окончания (может быть 23:59:59.999 из Java Core)
   * @returns Нормализованная дата (полночь того же календарного дня)
   * 
   * @example
   * // Java Core отдаёт endDate как конец последнего дня задачи
   * toLocalMidnightEndOfDay(new Date('2026-04-05T23:59:59.999+03:00'))
   * // => Date('2026-04-05T00:00:00.000') — тот же день, полночь
   * 
   * @example
   * // Обычная дата (не конец дня) — работает так же
   * toLocalMidnightEndOfDay(new Date('2026-04-05T14:30:00.000Z'))
   * // => Date('2026-04-05T00:00:00.000') в локальном часовом поясе
   */
  public static toLocalMidnightEndOfDay(date: Date | string | number): Date {
    const d = new Date(date)
    
    // MS PROJECT SEMANTIC: 23:59:59.999 — это ВСЁ ЕЩЁ тот же календарный день
    // Java Core использует эту конвенцию для обозначения "конца дня"
    // Но для UI нам нужна просто ДАТА без времени
    
    // Нормализуем к полуночи ТОГО ЖЕ дня (НЕ следующего!)
    const normalized = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
    
    // Логирование для диагностики (только в dev)
    if (import.meta.env.DEV) {
      const isEndOfDay = d.getHours() === 23 && d.getMinutes() >= 59
      if (isEndOfDay) {
        console.debug(
          `[CalendarDateService] END_OF_DAY same-day normalization: ${d.toISOString()} → ${normalized.toISOString()}`
        )
      }
    }
    
    return normalized
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
