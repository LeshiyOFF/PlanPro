/**
 * Типы для диаграммы Ганта
 */

import { Task } from './task-types'

export interface GanttBar extends Task {
  x: number
  width: number
  color: string
}

export interface GanttTimescale {
  startDate: Date
  endDate: Date
  unit: 'day' | 'week' | 'month'
  intervals: GanttInterval[]
}

export interface GanttInterval {
  start: Date
  end: Date
  label: string
  isWeekend: boolean
  isToday: boolean
}
