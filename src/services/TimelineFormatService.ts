import { ViewMode } from '@wamra/gantt-task-react'
import i18next from 'i18next'

/**
 * TimelineFormatService - Сервис для профессионального форматирования временной шкалы.
 * Обеспечивает адаптивное отображение меток в зависимости от ширины колонки и масштаба.
 *
 * GANTT-HEADER-SYNC: Метод generateIntervals() удалён.
 * Теперь генерация интервалов происходит через GanttSvgSyncService,
 * который читает реальные данные из SVG библиотеки.
 */
export class TimelineFormatService {
  /**
   * Возвращает форматированную строку для верхней части заголовка (Месяц/Год).
   * Адаптируется под ширину колонки для лучшей читаемости.
   */
  public static formatTopHeader(date: Date, viewMode: ViewMode, columnWidth: number): string {
    const locale = i18next.language === 'ru' ? 'ru-RU' : 'en-US'

    if (viewMode === ViewMode.Month) {
      return date.toLocaleDateString(locale, { year: 'numeric' })
    }

    if (columnWidth < 50) {
      return date.toLocaleDateString(locale, { month: 'short', year: '2-digit' })
    }

    return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  }

  /**
   * Возвращает форматированную строку для нижней части заголовка (День/Неделя).
   * Поддерживает русскую локализацию и адаптивное сокращение.
   */
  public static formatBottomHeader(date: Date, viewMode: ViewMode, columnWidth: number): string {
    const locale = i18next.language === 'ru' ? 'ru-RU' : 'en-US'

    switch (viewMode) {
      case ViewMode.Day:
        return this.formatDayHeader(date, locale, columnWidth)

      case ViewMode.Week:
        return this.formatWeekHeader(date, columnWidth)

      case ViewMode.Month:
        return this.formatMonthHeader(date, locale, columnWidth)

      default:
        return date.getDate().toString()
    }
  }

  /**
   * Форматирует заголовок для режима День.
   */
  private static formatDayHeader(date: Date, locale: string, columnWidth: number): string {
    if (columnWidth < 30) return date.getDate().toString()
    if (columnWidth < 60) {
      return date.toLocaleDateString(locale, { day: 'numeric', weekday: 'short' }).split(' ')[0]
    }
    return date.toLocaleDateString(locale, { day: 'numeric', weekday: 'short' })
  }

  /**
   * Форматирует заголовок для режима Неделя.
   */
  private static formatWeekHeader(date: Date, columnWidth: number): string {
    const weekNumber = this.getWeekNumber(date)
    if (columnWidth < 40) return weekNumber.toString()
    if (columnWidth < 80) {
      return `${i18next.t('units.weeks_short', { defaultValue: 'н.' })}${weekNumber}`
    }
    return `${i18next.t('units.weeks', { defaultValue: 'Нед.' })} ${weekNumber}`
  }

  /**
   * Форматирует заголовок для режима Месяц.
   */
  private static formatMonthHeader(date: Date, locale: string, columnWidth: number): string {
    if (columnWidth < 50) return date.toLocaleDateString(locale, { month: 'narrow' })
    if (columnWidth < 100) return date.toLocaleDateString(locale, { month: 'short' })
    return date.toLocaleDateString(locale, { month: 'long' })
  }

  /**
   * Вычисляет номер недели в году по ISO-8601.
   */
  private static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }
}
