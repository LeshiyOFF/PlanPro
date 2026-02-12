import { Task } from '@/store/project/interfaces'
import { CalendarDateService } from '@/services/CalendarDateService'
import { ViewMode } from '@wamra/gantt-task-react'
import { startOfDay, startOfWeek, startOfMonth, startOfYear } from 'date-fns'

/**
 * GanttRangeService - Сервис для расчета временного диапазона проекта.
 * Используется для вычисления диапазона overlay'ев (Baseline, Pulse).
 *
 * GANTT-HEADER-SYNC: Для синхронизации хедера используется GanttSvgSyncService,
 * который читает реальные данные из SVG библиотеки.
 */
export class GanttRangeService {

  /**
   * Вычисляет начальную и конечную даты для отображения Ганта.
   * Реализует стратегию "Synchronized Horizon" с поддержкой принудительного расширения.
   */
  public static calculateRange(
    tasks: Task[],
    containerWidth: number,
    zoomLevel: number,
    viewMode: ViewMode,
    forcedEndDate?: Date | null,
  ) {
    const rawStart = tasks.length > 0
      ? CalendarDateService.toLocalMidnight(Math.min(...tasks.map((t: Task) => new Date(t.startDate).getTime())))
      : CalendarDateService.toLocalMidnight(new Date())

    // Нормализация к границе периода (для overlay'ев)
    const start = this.normalizeStartDate(rawStart, viewMode)

    const maxTaskEnd = tasks.length > 0
      ? new Date(Math.max(...tasks.map((t: Task) => new Date(t.endDate).getTime())))
      : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Учет ширины экрана
    const columnWidth = zoomLevel * 65

    // 1. Расчет Целевого Горизонта (Header End)
    let libraryBufferDays = 19
    switch (viewMode) {
      case ViewMode.Year:
      case ViewMode.Month: libraryBufferDays = 365; break
      case ViewMode.Week: libraryBufferDays = 45; break
      case ViewMode.Day: libraryBufferDays = 19; break
      default: libraryBufferDays = 19
    }

    let headerEnd = CalendarDateService.toLocalMidnight(new Date(maxTaskEnd))
    headerEnd.setDate(headerEnd.getDate() + libraryBufferDays)

    // Учет принудительного расширения (для перехода в 2090 год и т.д.)
    if (forcedEndDate && forcedEndDate > headerEnd) {
      headerEnd = CalendarDateService.toLocalMidnight(new Date(forcedEndDate))

      // Добавляем запасную "взлетную полосу" (Extra Runway)
      // Нам нужно минимум 2-3 ширины экрана ПУСТОТЫ за целевой датой,
      // чтобы библиотека позволила прокрутить холст и поставить дату в начало/центр.
      const runwaySteps = Math.max(15, Math.ceil((containerWidth * 3) / columnWidth))

      switch (viewMode) {
        case ViewMode.Year:
          headerEnd.setFullYear(headerEnd.getFullYear() + runwaySteps)
          break
        case ViewMode.Month:
          headerEnd.setMonth(headerEnd.getMonth() + runwaySteps)
          break
        case ViewMode.Week:
          headerEnd.setDate(headerEnd.getDate() + (runwaySteps * 7))
          break
        case ViewMode.Day:
          headerEnd.setDate(headerEnd.getDate() + runwaySteps)
          break
        default:
          headerEnd.setDate(headerEnd.getDate() + runwaySteps)
      }
    }

    const minColumnsNeeded = Math.ceil(containerWidth / columnWidth) + 2

    const viewportEnd = new Date(start)
    switch (viewMode) {
      case ViewMode.Year: viewportEnd.setFullYear(viewportEnd.getFullYear() + minColumnsNeeded); break
      case ViewMode.Month: viewportEnd.setMonth(viewportEnd.getMonth() + minColumnsNeeded); break
      case ViewMode.Week: viewportEnd.setDate(viewportEnd.getDate() + (minColumnsNeeded * 7)); break
      case ViewMode.Day: viewportEnd.setDate(viewportEnd.getDate() + minColumnsNeeded); break
      default: viewportEnd.setDate(viewportEnd.getDate() + minColumnsNeeded)
    }

    // Финальный визуальный горизонт
    const finalVisualEnd = headerEnd.getTime() > viewportEnd.getTime() ? headerEnd : viewportEnd

    // 3. Календарное выравнивание (Calendar Alignment)
    if (viewMode === ViewMode.Month || viewMode === ViewMode.Year) {
      finalVisualEnd.setFullYear(finalVisualEnd.getFullYear() + 1)
      finalVisualEnd.setMonth(0, 1)
      finalVisualEnd.setHours(0, 0, 0, 0)
    }

    // GANTT-SYNC: tasksEnd = реальная максимальная дата задач
    // Используется для определения необходимости anchor-задачи
    // Anchor нужен когда end > maxTaskEnd (навигация за пределы реальных задач)
    return {
      start,
      end: finalVisualEnd,
      tasksEnd: maxTaskEnd,
    }
  }

  /**
   * Нормализует дату к границе периода (как библиотека).
   */
  private static normalizeStartDate(date: Date, viewMode: ViewMode): Date {
    switch (viewMode) {
      case ViewMode.Year:
        return startOfYear(date)
      case ViewMode.Month:
        return startOfMonth(date)
      case ViewMode.Week:
        return startOfWeek(date, { weekStartsOn: 1 })
      case ViewMode.Day:
      default:
        return startOfDay(date)
    }
  }
}
