import { describe, it, expect } from 'vitest'
import { CalendarDateService } from '../CalendarDateService'

describe('CalendarDateService - Date Normalization', () => {
  describe('toLocalMidnight (startDate)', () => {
    it('нормализует обычную дату к началу того же дня', () => {
      const input = new Date('2026-04-11T14:30:00.000Z')
      const result = CalendarDateService.toLocalMidnight(input)
      
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
      expect(result.getDate()).toBe(input.getDate()) // Тот же день (может отличаться из-за timezone)
    })
    
    it('не изменяет уже нормализованную дату', () => {
      const input = new Date('2026-04-11T00:00:00.000')
      const result = CalendarDateService.toLocalMidnight(input)
      
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
    })
    
    it('обрабатывает строку ISO', () => {
      const input = '2026-04-11T14:30:00.000Z'
      const result = CalendarDateService.toLocalMidnight(input)
      
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
    })
    
    it('обрабатывает timestamp', () => {
      const input = 1775941199999 // 2026-04-11T20:59:59.999Z
      const result = CalendarDateService.toLocalMidnight(input)
      
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
    })
  })
  
  describe('toLocalMidnightEndOfDay (endDate) - MS PROJECT SEMANTIC FIX v4.0', () => {
    it('нормализует 23:59:59.999 к полуночи ТОГО ЖЕ дня (НЕ следующего!)', () => {
      // MS PROJECT SEMANTIC: 23:59:59.999 — это конец ТОГО ЖЕ календарного дня
      // Java Core хранит endDate так, но UI должен показать просто дату
      
      // Создаём дату: 5 апреля 23:59:59.999 в MSK
      const input = new Date('2026-04-05T23:59:59.999+03:00')
      const result = CalendarDateService.toLocalMidnightEndOfDay(input)
      
      // Проверяем что время обнулено
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
      
      // КРИТИЧНО: День НЕ должен увеличиваться!
      // 5 апреля 23:59:59 → 5 апреля 00:00:00 (тот же день)
      expect(result.getDate()).toBe(5)
      expect(result.getMonth()).toBe(3) // April (0-indexed)
    })
    
    it('нормализует 23:59:00.000 к полуночи ТОГО ЖЕ дня', () => {
      const input = new Date('2026-04-05T23:59:00.000+03:00')
      const result = CalendarDateService.toLocalMidnightEndOfDay(input)
      
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
      
      // День остаётся тем же
      expect(result.getDate()).toBe(5)
      expect(result.getMonth()).toBe(3)
    })
    
    it('нормализует любое время к полуночи того же дня', () => {
      const input = new Date('2026-04-05T23:58:59.999+03:00')
      const result = CalendarDateService.toLocalMidnightEndOfDay(input)
      
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
      expect(result.getDate()).toBe(5)
    })
    
    it('обрабатывает обычную дату (середина дня)', () => {
      const input = new Date('2026-04-05T14:30:00.000+03:00')
      const result = CalendarDateService.toLocalMidnightEndOfDay(input)
      
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
      expect(result.getDate()).toBe(5)
    })
    
    it('обрабатывает UTC дату с корректным преобразованием в локальную', () => {
      // 2026-04-05T20:59:59.999Z в UTC = 2026-04-05T23:59:59.999+03:00 в MSK
      const input = new Date('2026-04-05T20:59:59.999Z')
      const result = CalendarDateService.toLocalMidnightEndOfDay(input)
      
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      
      // В MSK (UTC+3) это 5 апреля 23:59, нормализуется к 5 апреля 00:00
      expect(result.getDate()).toBe(5)
    })
    
    it('обрабатывает timestamp (число миллисекунд)', () => {
      // Timestamp для 2026-04-05T20:59:59.999Z
      const input = new Date('2026-04-05T20:59:59.999Z').getTime()
      const result = CalendarDateService.toLocalMidnightEndOfDay(input)
      
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getDate()).toBe(5)
    })
  })
  
  describe('Regression: SAVE/LOAD CYCLE — НЕТ СДВИГА ДАТ', () => {
    it('сохраняет дату при round-trip Java → Frontend → Java', () => {
      // Сценарий: Пользователь создаёт задачу с концом 05.04.2026
      // Java Core сохраняет как: 2026-04-05T23:59:59.999+03:00
      // При загрузке Frontend НЕ должен сдвигать дату на +1 день!
      
      const javaEndDate = new Date('2026-04-05T23:59:59.999+03:00')
      const frontendNormalized = CalendarDateService.toLocalMidnightEndOfDay(javaEndDate)
      
      // КРИТИЧНО: Дата должна остаться 5 апреля, НЕ 6 апреля!
      expect(frontendNormalized.getDate()).toBe(5)
      expect(frontendNormalized.getMonth()).toBe(3) // April
      expect(frontendNormalized.getHours()).toBe(0)
      expect(frontendNormalized.getMinutes()).toBe(0)
    })
    
    it('связанные задачи: даты не смещаются при save/load', () => {
      // Сценарий: TASK1 (34 дня) -> TASK2 (28 дней)
      // TASK1: 02.03 - 05.04 (заканчивается 05.04.2026)
      // Java Core хранит TASK1.end = 2026-04-05T23:59:59.999+03:00
      
      const task1EndFromJava = new Date('2026-04-05T23:59:59.999+03:00')
      const normalizedTask1End = CalendarDateService.toLocalMidnightEndOfDay(task1EndFromJava)
      
      // Пользователь должен увидеть "05.04.2026", НЕ "06.04.2026"
      expect(normalizedTask1End.getDate()).toBe(5)
      expect(normalizedTask1End.getMonth()).toBe(3)
      
      // TASK2 начинается 06.04 (следующий день после TASK1)
      // Java Core хранит TASK2.end = 2026-05-03T23:59:59.999+03:00
      const task2EndFromJava = new Date('2026-05-03T23:59:59.999+03:00')
      const normalizedTask2End = CalendarDateService.toLocalMidnightEndOfDay(task2EndFromJava)
      
      // Пользователь должен увидеть "03.05.2026", НЕ "04.05.2026"
      expect(normalizedTask2End.getDate()).toBe(3)
      expect(normalizedTask2End.getMonth()).toBe(4) // May
    })
    
    it('UTC дата с offset корректно конвертируется в локальную', () => {
      // Java API отдаёт: 2026-04-05T20:59:59.999Z (UTC)
      // Это эквивалентно: 2026-04-05T23:59:59.999+03:00 (MSK)
      // Должно нормализоваться к: 05.04.2026 00:00:00 (MSK)
      
      const utcDate = new Date('2026-04-05T20:59:59.999Z')
      const normalized = CalendarDateService.toLocalMidnightEndOfDay(utcDate)
      
      // В MSK это 23:59:59.999 5 апреля → 5 апреля 00:00:00
      expect(normalized.getDate()).toBe(5)
      expect(normalized.getHours()).toBe(0)
    })
  })
  
  describe('toLocalEndOfDay', () => {
    it('устанавливает время на 23:59:59.999', () => {
      const input = new Date('2026-04-11T14:30:00.000Z')
      const result = CalendarDateService.toLocalEndOfDay(input)
      
      expect(result.getHours()).toBe(23)
      expect(result.getMinutes()).toBe(59)
      expect(result.getSeconds()).toBe(59)
      expect(result.getMilliseconds()).toBe(999)
    })
  })
  
  describe('getCalendarDaysDiff', () => {
    it('вычисляет разницу в днях корректно', () => {
      const start = new Date('2026-02-16T00:00:00')
      const end = new Date('2026-03-15T00:00:00')
      
      const diff = CalendarDateService.getCalendarDaysDiff(start, end)
      
      // 16 февраля - 15 марта = 27 дней (28 - 1, т.к. не включая начальный)
      expect(diff).toBe(27)
    })
  })
})
