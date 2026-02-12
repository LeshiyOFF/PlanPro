import { describe, it, expect } from 'vitest'
import { DurationSyncService } from '../DurationSyncService'

/**
 * Тесты для DurationSyncService.
 * Проверяют корректность синхронизации длительности задач.
 */
describe('DurationSyncService', () => {
  describe('calculateDurationInDays', () => {
    it('вычисляет 1 день для совпадающих дат', () => {
      const date = new Date('2026-02-12')
      const result = DurationSyncService.calculateDurationInDays(date, date)
      expect(result).toBe(1)
    })

    it('вычисляет 3 дня для трёхдневного интервала', () => {
      const startDate = new Date('2026-02-12')
      const endDate = new Date('2026-02-15')
      const result = DurationSyncService.calculateDurationInDays(startDate, endDate)
      expect(result).toBe(3)
    })

    it('вычисляет 7 дней для недельного интервала', () => {
      const startDate = new Date('2026-02-12')
      const endDate = new Date('2026-02-19')
      const result = DurationSyncService.calculateDurationInDays(startDate, endDate)
      expect(result).toBe(7)
    })

    it('возвращает минимум 1 день если endDate раньше startDate', () => {
      const startDate = new Date('2026-02-15')
      const endDate = new Date('2026-02-12')
      const result = DurationSyncService.calculateDurationInDays(startDate, endDate)
      expect(result).toBe(1)
    })

    it('возвращает 1 день для null дат', () => {
      const result = DurationSyncService.calculateDurationInDays(
        null as unknown as Date,
        new Date(),
      )
      expect(result).toBe(1)
    })

    it('возвращает 1 день для undefined дат', () => {
      const result = DurationSyncService.calculateDurationInDays(
        undefined as unknown as Date,
        undefined as unknown as Date,
      )
      expect(result).toBe(1)
    })

    it('возвращает 1 день для invalid дат (NaN)', () => {
      const invalidDate = new Date('invalid')
      const result = DurationSyncService.calculateDurationInDays(
        invalidDate,
        new Date(),
      )
      expect(result).toBe(1)
    })

    it('корректно округляет дробные дни', () => {
      const startDate = new Date('2026-02-12T00:00:00')
      const endDate = new Date('2026-02-14T12:00:00') // 2.5 дня
      const result = DurationSyncService.calculateDurationInDays(startDate, endDate)
      expect(result).toBe(3) // Math.round(2.5) = 3
    })

    it('вычисляет длительность для дат с временем', () => {
      const startDate = new Date('2026-02-12T09:00:00')
      const endDate = new Date('2026-02-14T17:00:00')
      const result = DurationSyncService.calculateDurationInDays(startDate, endDate)
      // ~2.33 дня -> округляется до 2
      expect(result).toBeGreaterThanOrEqual(2)
      expect(result).toBeLessThanOrEqual(3)
    })

    it('вычисляет длительность для большого интервала (месяц)', () => {
      const startDate = new Date('2026-02-01')
      const endDate = new Date('2026-03-01')
      const result = DurationSyncService.calculateDurationInDays(startDate, endDate)
      // Февраль 2026 = 28 дней
      expect(result).toBe(28)
    })
  })

  describe('enrichUpdatesWithDuration', () => {
    const currentTask = {
      startDate: new Date('2026-02-12'),
      endDate: new Date('2026-02-15'),
      duration: 3,
    }

    it('пересчитывает duration при изменении startDate', () => {
      const updates: { startDate: Date; endDate?: Date; duration?: number } = {
        startDate: new Date('2026-02-10'),
      }
      const result = DurationSyncService.enrichUpdatesWithDuration(updates, currentTask)

      expect(result.duration).toBeDefined()
      expect(result.duration).toBe(5) // 10.02 -> 15.02 = 5 дней
    })

    it('пересчитывает duration при изменении endDate', () => {
      const updates: { startDate?: Date; endDate: Date; duration?: number } = {
        endDate: new Date('2026-02-20'),
      }
      const result = DurationSyncService.enrichUpdatesWithDuration(updates, currentTask)

      expect(result.duration).toBeDefined()
      expect(result.duration).toBe(8) // 12.02 -> 20.02 = 8 дней
    })

    it('пересчитывает duration при изменении обеих дат', () => {
      const updates: { startDate: Date; endDate: Date; duration?: number } = {
        startDate: new Date('2026-02-10'),
        endDate: new Date('2026-02-20'),
      }
      const result = DurationSyncService.enrichUpdatesWithDuration(updates, currentTask)

      expect(result.duration).toBeDefined()
      expect(result.duration).toBe(10) // 10.02 -> 20.02 = 10 дней
    })

    it('не изменяет updates если даты не меняются', () => {
      const updates: { startDate?: Date; endDate?: Date; duration?: number; progress?: number; name?: string } = {
        progress: 0.5,
        name: 'Updated Task',
      }
      const result = DurationSyncService.enrichUpdatesWithDuration(updates, currentTask)

      expect(result.duration).toBeUndefined()
      expect(result.progress).toBe(0.5)
      expect(result.name).toBe('Updated Task')
    })

    it('сохраняет другие поля updates при пересчёте duration', () => {
      const updates: { startDate?: Date; endDate: Date; duration?: number; progress?: number; name?: string } = {
        endDate: new Date('2026-02-20'),
        progress: 0.8,
        name: 'Updated Task',
      }
      const result = DurationSyncService.enrichUpdatesWithDuration(updates, currentTask)

      expect(result.duration).toBe(8)
      expect(result.progress).toBe(0.8)
      expect(result.name).toBe('Updated Task')
    })

    it('использует текущие даты если в updates только одна дата', () => {
      const updates: { startDate?: Date; endDate: Date; duration?: number } = {
        endDate: new Date('2026-02-20'),
      }
      const result = DurationSyncService.enrichUpdatesWithDuration(updates, currentTask)

      // startDate из currentTask (12.02), endDate из updates (20.02)
      expect(result.duration).toBe(8)
    })
  })

  describe('calculateDurationFromGantt', () => {
    it('делегирует вызов calculateDurationInDays', () => {
      const startDate = new Date('2026-02-12')
      const endDate = new Date('2026-02-15')

      const result = DurationSyncService.calculateDurationFromGantt(startDate, endDate)
      const expected = DurationSyncService.calculateDurationInDays(startDate, endDate)

      expect(result).toBe(expected)
    })

    it('возвращает корректное количество дней', () => {
      const startDate = new Date('2026-02-12')
      const endDate = new Date('2026-02-15')
      const result = DurationSyncService.calculateDurationFromGantt(startDate, endDate)
      expect(result).toBe(3)
    })
  })

  describe('edge cases', () => {
    it('обрабатывает граничные даты (год перехода)', () => {
      const startDate = new Date('2025-12-30')
      const endDate = new Date('2026-01-02')
      const result = DurationSyncService.calculateDurationInDays(startDate, endDate)
      expect(result).toBe(3)
    })

    it('обрабатывает високосный год (29 февраля)', () => {
      // 2024 - високосный год
      const startDate = new Date('2024-02-28')
      const endDate = new Date('2024-03-01')
      const result = DurationSyncService.calculateDurationInDays(startDate, endDate)
      expect(result).toBe(2) // 28.02 -> 29.02 -> 01.03 = 2 дня
    })

    it('обрабатывает очень большой интервал (год)', () => {
      const startDate = new Date('2026-01-01')
      const endDate = new Date('2027-01-01')
      const result = DurationSyncService.calculateDurationInDays(startDate, endDate)
      expect(result).toBe(365)
    })
  })
})
