import { ViewMode } from 'gantt-task-react'

/**
 * GanttViewModeService - Сервис для управления режимами отображения Ганта.
 * Реализует логику переключения масштаба (zoomLevel).
 */
export class GanttViewModeService {
  /**
   * Возвращает ViewMode на основе уровня масштабирования.
   */
  public static getViewMode(zoomLevel: number): ViewMode {
    if (zoomLevel <= 0.5) return ViewMode.Month
    if (zoomLevel <= 1) return ViewMode.Week
    return ViewMode.Day
  }

  /**
   * Возвращает ширину колонки на основе масштаба.
   */
  public static getColumnWidth(zoomLevel: number): number {
    return zoomLevel * 65
  }
}
