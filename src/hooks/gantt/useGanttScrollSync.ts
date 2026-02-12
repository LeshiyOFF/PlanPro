import { useRef, useCallback } from 'react'
import type { RefObject } from 'react'

/**
 * Хук для синхронизации вертикальной прокрутки между левой таблицей задач
 * и правой диаграммой Ганта.
 * 
 * Паттерн основан на useVerticalScrollbars из библиотеки @wamra/gantt-task-react,
 * адаптирован для архитектуры с двумя независимыми панелями.
 */
export const useGanttScrollSync = (): {
  leftPanelRef: RefObject<HTMLDivElement>
  rightPanelRef: RefObject<HTMLDivElement>
  onLeftScroll: () => void
  onRightScroll: () => void
} => {
  const leftPanelRef = useRef<HTMLDivElement>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)

  /**
   * Обработчик прокрутки левой панели (таблица задач).
   * Синхронизирует scrollTop правой панели (диаграмма Ганта).
   */
  const onLeftScroll = useCallback(() => {
    if (!leftPanelRef.current || !rightPanelRef.current) return

    // Синхронизация: левая → правая
    rightPanelRef.current.scrollTop = leftPanelRef.current.scrollTop

    // Нормализация (для Chrome с горизонтальным скроллбаром)
    leftPanelRef.current.scrollTop = rightPanelRef.current.scrollTop
  }, [])

  /**
   * Обработчик прокрутки правой панели (диаграмма Ганта).
   * Синхронизирует scrollTop левой панели (таблица задач).
   */
  const onRightScroll = useCallback(() => {
    if (!leftPanelRef.current || !rightPanelRef.current) return

    // Синхронизация: правая → левая
    leftPanelRef.current.scrollTop = rightPanelRef.current.scrollTop

    // Нормализация (для Chrome с горизонтальным скроллбаром)
    rightPanelRef.current.scrollTop = leftPanelRef.current.scrollTop
  }, [])

  return {
    leftPanelRef,
    rightPanelRef,
    onLeftScroll,
    onRightScroll,
  }
}
