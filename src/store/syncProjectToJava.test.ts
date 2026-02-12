import { describe, it, expect } from 'vitest'
import {
  computeCalendarDeletionState,
  DEFAULT_CALENDAR_ID,
} from './syncProjectToJava'
import {
  type IWorkCalendar,
  CalendarTemplateType,
} from '@/domain/calendar/interfaces/IWorkCalendar'
import type { Resource } from './project/interfaces'

function makeCalendar(id: string, name: string): IWorkCalendar {
  return {
    id,
    name,
    templateType: CalendarTemplateType.STANDARD,
    workingDays: [],
    exceptions: [],
    hoursPerDay: 8,
    workingDaysPerWeek: 5,
    isBase: id === 'standard',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

function makeResource(id: string, calendarId: string): Resource {
  return {
    id,
    name: `Resource ${id}`,
    type: 'Work',
    maxUnits: 1,
    standardRate: 0,
    overtimeRate: 0,
    costPerUse: 0,
    calendarId,
  }
}

describe('computeCalendarDeletionState', () => {
  it('удаляет календарь из списка и перепривязывает ресурсы на DEFAULT_CALENDAR_ID', () => {
    const cal1 = makeCalendar('standard', 'Standard')
    const cal2 = makeCalendar('custom_1', 'Custom 1')
    const calendars: IWorkCalendar[] = [cal1, cal2]
    const r1 = makeResource('r1', 'standard')
    const r2 = makeResource('r2', 'custom_1')
    const resources: Resource[] = [r1, r2]

    const { newCalendars, newResources } = computeCalendarDeletionState(
      calendars,
      resources,
      'custom_1',
    )

    expect(newCalendars).toHaveLength(1)
    expect(newCalendars[0].id).toBe('standard')
    expect(newResources).toHaveLength(2)
    expect(newResources[0].calendarId).toBe('standard')
    expect(newResources[1].calendarId).toBe(DEFAULT_CALENDAR_ID)
  })

  it('оставляет ресурсы на других календарях без изменений', () => {
    const cal1 = makeCalendar('standard', 'Standard')
    const cal2 = makeCalendar('custom_1', 'Custom 1')
    const cal3 = makeCalendar('custom_2', 'Custom 2')
    const calendars: IWorkCalendar[] = [cal1, cal2, cal3]
    const r1 = makeResource('r1', 'custom_1')
    const r2 = makeResource('r2', 'custom_2')
    const resources: Resource[] = [r1, r2]

    const { newCalendars, newResources } = computeCalendarDeletionState(
      calendars,
      resources,
      'custom_1',
    )

    expect(newCalendars.map(c => c.id)).toEqual(['standard', 'custom_2'])
    expect(newResources.find(r => r.id === 'r1')?.calendarId).toBe(DEFAULT_CALENDAR_ID)
    expect(newResources.find(r => r.id === 'r2')?.calendarId).toBe('custom_2')
  })

  it('возвращает пустой список календарей при удалении единственного кастомного', () => {
    const cal1 = makeCalendar('standard', 'Standard')
    const cal2 = makeCalendar('custom_1', 'Custom 1')
    const calendars: IWorkCalendar[] = [cal1, cal2]
    const resources: Resource[] = []

    const { newCalendars } = computeCalendarDeletionState(
      calendars,
      resources,
      'custom_1',
    )

    expect(newCalendars).toHaveLength(1)
    expect(newCalendars[0].id).toBe('standard')
  })
})
