/**
 * Хук для управления навигацией в Gantt диаграмме
 * Выделен из GanttCanvasController для соблюдения лимита 200 строк
 */

import { useState, useCallback } from 'react'
import { ViewMode } from 'gantt-task-react'
import { GanttNavigationService } from '@/services/GanttNavigationService'
import { Task } from '@/store/project/interfaces'

/**
 * Результат хука навигации
 */
export interface IUseGanttNavigationResult {
  readonly forcedEndDate: Date | null;
  readonly targetNavigationDate: Date | null;
  readonly pendingDate: Date | null;
  readonly showEmptyDateWarning: boolean;
  readonly showLargeJumpWarning: boolean;
  readonly handleDateSelect: (date: Date | undefined) => void;
  readonly confirmLargeJump: () => void;
  readonly confirmEmptyDateNavigation: () => void;
  readonly setShowEmptyDateWarning: (show: boolean) => void;
  readonly setShowLargeJumpWarning: (show: boolean) => void;
}

/**
 * Параметры хука навигации
 */
interface IUseGanttNavigationParams {
  readonly tasks: ReadonlyArray<Task>;
  readonly viewMode: 'day' | 'week' | 'month';
  readonly onDateChange: (date: Date) => void;
  readonly onViewModeChange: (mode: 'day' | 'week' | 'month') => void;
  readonly onZoomChange: (zoom: number) => void;
}

/**
 * Хук управления навигацией
 */
export const useGanttNavigation = ({
  tasks,
  viewMode,
  onDateChange,
  onViewModeChange,
  onZoomChange,
}: IUseGanttNavigationParams): IUseGanttNavigationResult => {
  const [forcedEndDate, setForcedEndDate] = useState<Date | null>(null)
  const [targetNavigationDate, setTargetNavigationDate] = useState<Date | null>(null)
  const [pendingDate, setPendingDate] = useState<Date | null>(null)
  const [showEmptyDateWarning, setShowEmptyDateWarning] = useState(false)
  const [showLargeJumpWarning, setShowLargeJumpWarning] = useState(false)

  const performScroll = useCallback((date: Date) => {
    setForcedEndDate(date)
    setTargetNavigationDate(date)
    onDateChange(date)
  }, [onDateChange])

  const viewModeEnum = viewMode === 'day' ? ViewMode.Day : viewMode === 'week' ? ViewMode.Week : ViewMode.Month

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (!date) return

    const safety = GanttNavigationService.checkNavigationSafety(date, viewModeEnum)
    if (!safety.isSafe) {
      setPendingDate(date)
      setShowLargeJumpWarning(true)
      return
    }

    const hasTasks = GanttNavigationService.hasTasksAtDate(date, [...tasks])
    if (!hasTasks) {
      setPendingDate(date)
      setShowEmptyDateWarning(true)
    } else {
      performScroll(date)
    }
  }, [tasks, performScroll, viewModeEnum])

  const confirmLargeJump = useCallback(() => {
    if (pendingDate) {
      onViewModeChange('month')
      onZoomChange(0.8)
      performScroll(pendingDate)
      setPendingDate(null)
    }
    setShowLargeJumpWarning(false)
  }, [pendingDate, performScroll, onViewModeChange, onZoomChange])

  const confirmEmptyDateNavigation = useCallback(() => {
    if (pendingDate) {
      performScroll(pendingDate)
      setPendingDate(null)
    }
    setShowEmptyDateWarning(false)
  }, [pendingDate, performScroll])

  return {
    forcedEndDate,
    targetNavigationDate,
    pendingDate,
    showEmptyDateWarning,
    showLargeJumpWarning,
    handleDateSelect,
    confirmLargeJump,
    confirmEmptyDateNavigation,
    setShowEmptyDateWarning,
    setShowLargeJumpWarning,
  }
}
