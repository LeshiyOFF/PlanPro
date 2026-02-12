/**
 * GANTT-NAV-V2: Хук для управления навигацией в Gantt диаграмме
 * Упрощённая версия - навигация управляется через GanttCanvasController
 */

import { useState, useCallback } from 'react'
import { Task } from '@/store/project/interfaces'

/**
 * Результат хука навигации
 */
export interface IUseGanttNavigationResult {
  readonly forcedEndDate: Date | null;
  readonly targetNavigationDate: Date | null;
  readonly resetTargetDate: () => void;
  readonly resetForcedEndDate: () => void;
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
 * GANTT-NAV-V2: Упрощённый хук навигации
 * Основная логика перенесена в GanttCanvasController (navigateTo)
 */
export const useGanttNavigation = ({
  tasks,
  onDateChange,
}: IUseGanttNavigationParams): IUseGanttNavigationResult => {
  const [forcedEndDate, setForcedEndDate] = useState<Date | null>(null)
  const [targetNavigationDate, setTargetNavigationDate] = useState<Date | null>(null)

  // Сброс targetNavigationDate после завершения навигации
  const resetTargetDate = useCallback(() => {
    setTargetNavigationDate(null)
  }, [])

  // Сброс forcedEndDate (при «Вписать в экран» или возврате в диапазон задач)
  const resetForcedEndDate = useCallback(() => {
    setForcedEndDate(null)
  }, [])

  return {
    forcedEndDate,
    targetNavigationDate,
    resetTargetDate,
    resetForcedEndDate,
  }
}
