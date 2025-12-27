import { useState, useMemo, useCallback } from 'react'
import { ViewSettings, ViewType } from '@/types'

/**
 * Хук для управления настройками представления
 */
export const useViewSettings = () => {
  // Настройки представления
  const [viewSettings, setViewSettingsState] = useState<ViewSettings>({
    type: 'gantt',
    timescale: 'weeks',
    showCriticalPath: true,
    showProgress: true,
    showResources: true,
    zoom: 100,
  })

  /**
   * Обновление настроек представления
   */
  const setViewSettings = useCallback((settings: Partial<ViewSettings>) => {
    setViewSettingsState(prev => ({ ...prev, ...settings }))
  }, [])

  /**
   * Установка текущего представления
   */
  const setCurrentView = useCallback((view: ViewType) => {
    setViewSettingsState(prev => ({ ...prev, type: view }))
  }, [])

  /**
   * Получение текущего типа представления (оптимизировано)
   */
  const currentView = useMemo(() => viewSettings.type, [viewSettings.type])

  return {
    viewSettings,
    setViewSettings,
    currentView,
    setCurrentView,
  }
}
