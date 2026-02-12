import { describe, it, expect, beforeEach } from 'vitest'
import { CalendarMathService } from '../CalendarMathService'
import type { CalendarPreferences } from '@/types/Master_Functionality_Catalog'

/**
 * Тесты для CalendarMathService.
 * Проверяют корректность математических операций с длительностью и датами.
 */
describe('CalendarMathService', () => {
  let defaultPrefs: CalendarPreferences
  let calendarModePrefs: CalendarPreferences

  beforeEach(() => {
    defaultPrefs = {
      hoursPerDay: 8,
      hoursPerWeek: 40,
      daysPerMonth: 20,
      durationCalculationMode: 'working',
    }
    calendarModePrefs = {
      hoursPerDay: 8,
      hoursPerWeek: 40,
      daysPerMonth: 20,
      durationCalculationMode: 'calendar',
    }
  })

  describe('convertDuration', () => {
    it('конвертирует дни в часы (working mode)', () => {
      const result = CalendarMathService.convertDuration(
        { value: 5, unit: 'days' },
        'hours',
        defaultPrefs,
      )
      expect(result.value).toBe(40) // 5 * 8
      expect(result.unit).toBe('hours')
    })

    it('конвертирует дни в часы (calendar mode)', () => {
      const result = CalendarMathService.convertDuration(
        { value: 2, unit: 'days' },
        'hours',
        calendarModePrefs,
      )
      expect(result.value).toBe(48) // 2 * 24
      expect(result.unit).toBe('hours')
    })

    it('конвертирует часы в дни (working mode)', () => {
      const result = CalendarMathService.convertDuration(
        { value: 16, unit: 'hours' },
        'days',
        defaultPrefs,
      )
      expect(result.value).toBe(2) // 16 / 8
      expect(result.unit).toBe('days')
    })

    it('конвертирует недели в часы (working mode)', () => {
      const result = CalendarMathService.convertDuration(
        { value: 1, unit: 'weeks' },
        'hours',
        defaultPrefs,
      )
      expect(result.value).toBe(40) // 1 * 40
      expect(result.unit).toBe('hours')
    })

    it('конвертирует недели в часы (calendar mode)', () => {
      const result = CalendarMathService.convertDuration(
        { value: 1, unit: 'weeks' },
        'hours',
        calendarModePrefs,
      )
      expect(result.value).toBe(168) // 1 * 24 * 7
      expect(result.unit).toBe('hours')
    })

    it('конвертирует месяцы в дни', () => {
      const result = CalendarMathService.convertDuration(
        { value: 1, unit: 'months' },
        'days',
        defaultPrefs,
      )
      expect(result.value).toBe(20) // 1 * 20
      expect(result.unit).toBe('days')
    })

    it('возвращает ту же длительность при одинаковых единицах', () => {
      const result = CalendarMathService.convertDuration(
        { value: 5, unit: 'days' },
        'days',
        defaultPrefs,
      )
      expect(result.value).toBe(5)
      expect(result.unit).toBe('days')
    })

    it('корректно обрабатывает нулевую длительность', () => {
      const result = CalendarMathService.convertDuration(
        { value: 0, unit: 'hours' },
        'days',
        defaultPrefs,
      )
      expect(result.value).toBe(0)
    })

    it('конвертирует минуты в часы', () => {
      const result = CalendarMathService.convertDuration(
        { value: 120, unit: 'minutes' },
        'hours',
        defaultPrefs,
      )
      expect(result.value).toBe(2)
      expect(result.unit).toBe('hours')
    })

    it('конвертирует секунды в минуты', () => {
      const result = CalendarMathService.convertDuration(
        { value: 180, unit: 'seconds' },
        'minutes',
        defaultPrefs,
      )
      expect(result.value).toBe(3)
      expect(result.unit).toBe('minutes')
    })
  })

  describe('calculateFinishDate', () => {
    it('вычисляет дату окончания для 1 рабочего дня', () => {
      const startDate = new Date('2026-02-12T09:00:00')
      const result = CalendarMathService.calculateFinishDate(
        startDate,
        { value: 1, unit: 'days' },
        defaultPrefs,
      )
      // 1 рабочий день = 8 часов
      const expectedMs = startDate.getTime() + 8 * 60 * 60 * 1000
      expect(result.getTime()).toBe(expectedMs)
    })

    it('вычисляет дату окончания для 1 календарного дня', () => {
      const startDate = new Date('2026-02-12T09:00:00')
      const result = CalendarMathService.calculateFinishDate(
        startDate,
        { value: 1, unit: 'days' },
        calendarModePrefs,
      )
      // 1 календарный день = 24 часа
      const expectedMs = startDate.getTime() + 24 * 60 * 60 * 1000
      expect(result.getTime()).toBe(expectedMs)
    })

    it('вычисляет дату окончания для нескольких дней', () => {
      const startDate = new Date('2026-02-12T09:00:00')
      const result = CalendarMathService.calculateFinishDate(
        startDate,
        { value: 5, unit: 'days' },
        defaultPrefs,
      )
      // 5 рабочих дней = 5 * 8 = 40 часов
      const expectedMs = startDate.getTime() + 5 * 8 * 60 * 60 * 1000
      expect(result.getTime()).toBe(expectedMs)
    })

    it('вычисляет дату окончания для часов', () => {
      const startDate = new Date('2026-02-12T09:00:00')
      const result = CalendarMathService.calculateFinishDate(
        startDate,
        { value: 4, unit: 'hours' },
        defaultPrefs,
      )
      const expectedMs = startDate.getTime() + 4 * 60 * 60 * 1000
      expect(result.getTime()).toBe(expectedMs)
    })

    it('корректно обрабатывает нулевую длительность', () => {
      const startDate = new Date('2026-02-12T09:00:00')
      const result = CalendarMathService.calculateFinishDate(
        startDate,
        { value: 0, unit: 'days' },
        defaultPrefs,
      )
      expect(result.getTime()).toBe(startDate.getTime())
    })
  })

  describe('calculateDuration', () => {
    it('вычисляет календарные дни между датами', () => {
      const startDate = new Date('2026-02-12')
      const endDate = new Date('2026-02-15')
      const result = CalendarMathService.calculateDuration(
        startDate,
        endDate,
        'days',
        defaultPrefs,
      )
      expect(result.value).toBe(3)
      expect(result.unit).toBe('days')
    })

    it('возвращает минимум 1 день при совпадающих датах', () => {
      const date = new Date('2026-02-12')
      const result = CalendarMathService.calculateDuration(
        date,
        date,
        'days',
        defaultPrefs,
      )
      expect(result.value).toBe(1)
    })

    it('вычисляет часы между датами (working mode)', () => {
      const startDate = new Date('2026-02-12T09:00:00')
      const endDate = new Date('2026-02-12T17:00:00') // 8 часов разницы
      const result = CalendarMathService.calculateDuration(
        startDate,
        endDate,
        'hours',
        defaultPrefs,
      )
      expect(result.value).toBe(8)
      expect(result.unit).toBe('hours')
    })

    it('вычисляет минуты между датами', () => {
      const startDate = new Date('2026-02-12T09:00:00')
      const endDate = new Date('2026-02-12T10:30:00') // 90 минут разницы
      const result = CalendarMathService.calculateDuration(
        startDate,
        endDate,
        'minutes',
        defaultPrefs,
      )
      expect(result.value).toBe(90)
      expect(result.unit).toBe('minutes')
    })

    it('корректно округляет дни', () => {
      const startDate = new Date('2026-02-12T00:00:00')
      const endDate = new Date('2026-02-14T12:00:00') // 2.5 дня
      const result = CalendarMathService.calculateDuration(
        startDate,
        endDate,
        'days',
        defaultPrefs,
      )
      // Math.round(2.5) = 3, но Math.max(1, Math.round(...)) применяется
      expect(result.value).toBe(3)
    })
  })

  describe('edge cases', () => {
    it('обрабатывает отрицательную разницу дат (инвертированные даты)', () => {
      const startDate = new Date('2026-02-15')
      const endDate = new Date('2026-02-12')
      const result = CalendarMathService.calculateDuration(
        startDate,
        endDate,
        'days',
        defaultPrefs,
      )
      // Отрицательный результат округляется, но Math.max(1, ...) возвращает 1
      expect(result.value).toBeGreaterThanOrEqual(1)
    })

    it('обрабатывает очень большие значения длительности', () => {
      const result = CalendarMathService.convertDuration(
        { value: 365, unit: 'days' },
        'hours',
        defaultPrefs,
      )
      expect(result.value).toBe(365 * 8)
    })

    it('обрабатывает дробные значения длительности', () => {
      const result = CalendarMathService.convertDuration(
        { value: 1.5, unit: 'days' },
        'hours',
        defaultPrefs,
      )
      expect(result.value).toBe(12) // 1.5 * 8
    })
  })
})
