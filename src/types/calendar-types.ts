/**
 * Типы для календарей ProjectLibre
 */

export interface Calendar {
  id: string
  name: string
  workingDays: boolean[]
  workingHours: {
    from: number
    to: number
  }[]
  exceptions: CalendarException[]
}

export interface CalendarException {
  date: Date
  working: boolean
  from?: number
  to?: number
  name?: string
}
