/**
 * Хук для управления состоянием Gantt диаграммы
 * Выделен для соблюдения принципа Single Responsibility
 */

import { useState, useCallback } from 'react'

/**
 * Результат хука состояния Gantt
 */
export interface IUseGanttStateResult {
  readonly viewMode: 'day' | 'week' | 'month';
  readonly showToday: boolean;
  readonly zoomLevel: number;
  readonly currentDate: Date;
  readonly setViewMode: (mode: 'day' | 'week' | 'month') => void;
  readonly setShowToday: (show: boolean) => void;
  readonly setZoomLevel: (zoom: number) => void;
  readonly setCurrentDate: (date: Date) => void;
  readonly handleViewModeChange: (mode: 'day' | 'week' | 'month') => void;
  readonly handleZoomIn: () => void;
  readonly handleZoomOut: () => void;
  readonly handleFitToScreen: () => void;
}

/**
 * Параметры хука состояния
 */
interface IUseGanttStateParams {
  readonly initialDate?: Date;
}

/**
 * Хук управления состоянием Gantt
 */
export const useGanttState = ({
  initialDate,
}: IUseGanttStateParams = {}): IUseGanttStateResult => {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day')
  const [showToday, setShowToday] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [currentDate, setCurrentDate] = useState(initialDate || new Date())

  const handleViewModeChange = useCallback((mode: 'day' | 'week' | 'month') => {
    setViewMode(mode)
    setZoomLevel(mode === 'day' ? 1.5 : mode === 'week' ? 1 : 0.8)
  }, [])

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.1, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5))
  }, [])

  const handleFitToScreen = useCallback(() => {
    setZoomLevel(1)
    setCurrentDate(new Date())
    setShowToday(true)
  }, [])

  return {
    viewMode,
    showToday,
    zoomLevel,
    currentDate,
    setViewMode,
    setShowToday,
    setZoomLevel,
    setCurrentDate,
    handleViewModeChange,
    handleZoomIn,
    handleZoomOut,
    handleFitToScreen,
  }
}
