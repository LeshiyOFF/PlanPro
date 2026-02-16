import { describe, it, expect, beforeEach } from 'vitest'
import { EffortDrivenService } from '../EffortDrivenService'
import type { Task, ResourceAssignment } from '@/store/project/interfaces'
import type { CalendarPreferences } from '@/types/Master_Functionality_Catalog'
import { TaskType } from '@/types/Master_Functionality_Catalog'

/**
 * Тесты для EffortDrivenService.
 * Проверяют корректность пересчёта длительности при изменении ресурсов.
 */
describe('EffortDrivenService', () => {
  let defaultCalendarPrefs: CalendarPreferences

  beforeEach(() => {
    defaultCalendarPrefs = {
      hoursPerDay: 8,
      hoursPerWeek: 40,
      daysPerMonth: 20,
      durationCalculationMode: 'working',
    }
  })

  /**
   * Фабрика для создания mock-задач.
   */
  const createMockTask = (overrides: Partial<Task> = {}): Task => {
    const baseTask: Task = {
      id: 'TASK-1',
      name: 'Test Task',
      startDate: new Date('2026-02-12'),
      endDate: new Date('2026-02-15'),
      duration: 3,
      progress: 0,
      isSummary: false,
      isMilestone: false,
      level: 0,
      resourceAssignments: [
        { resourceId: 'RES-1', units: 1.0 },
      ],
    }
    return { ...baseTask, ...overrides } as Task
  }

  describe('recalculateDuration', () => {
    it('уменьшает длительность при добавлении ресурсов', () => {
      const task = createMockTask({
        resourceAssignments: [
          { resourceId: 'RES-1', units: 1.0 },
          { resourceId: 'RES-2', units: 1.0 },
        ],
      })
      const originalTotalUnits = 1.0 // Был 1 ресурс

      const result = EffortDrivenService.recalculateDuration(
        task,
        originalTotalUnits,
        defaultCalendarPrefs,
      )

      // При удвоении ресурсов длительность должна уменьшиться
      expect(result.duration).toBeLessThan(task.duration)
    })

    it('увеличивает длительность при удалении ресурсов', () => {
      const task = createMockTask({
        resourceAssignments: [
          { resourceId: 'RES-1', units: 1.0 },
        ],
      })
      const originalTotalUnits = 2.0 // Было 2 ресурса

      const result = EffortDrivenService.recalculateDuration(
        task,
        originalTotalUnits,
        defaultCalendarPrefs,
      )

      // При уменьшении ресурсов длительность должна увеличиться
      expect(result.duration).toBeGreaterThan(task.duration)
    })

    it('не изменяет задачу если units не изменились', () => {
      const task = createMockTask()
      const originalTotalUnits = 1.0

      const result = EffortDrivenService.recalculateDuration(
        task,
        originalTotalUnits,
        defaultCalendarPrefs,
      )

      expect(result.duration).toBe(task.duration)
      expect(result.endDate.getTime()).toBe(task.endDate.getTime())
    })

    it('не изменяет задачу если нет назначений', () => {
      const task = createMockTask({
        resourceAssignments: [],
      })
      const originalTotalUnits = 1.0

      const result = EffortDrivenService.recalculateDuration(
        task,
        originalTotalUnits,
        defaultCalendarPrefs,
      )

      expect(result.duration).toBe(task.duration)
    })

    it('корректно пересчитывает endDate', () => {
      const task = createMockTask({
        startDate: new Date('2026-02-12'),
        endDate: new Date('2026-02-15'), // 3 дня
        duration: 3,
        resourceAssignments: [
          { resourceId: 'RES-1', units: 1.0 },
          { resourceId: 'RES-2', units: 1.0 },
        ],
      })
      const originalTotalUnits = 1.0

      const result = EffortDrivenService.recalculateDuration(
        task,
        originalTotalUnits,
        defaultCalendarPrefs,
      )

      // endDate должен быть пересчитан
      expect(result.endDate).toBeDefined()
      expect(result.endDate.getTime()).toBeLessThan(task.endDate.getTime())
    })

    it('учитывает частичную загрузку ресурсов (units < 1)', () => {
      const task = createMockTask({
        resourceAssignments: [
          { resourceId: 'RES-1', units: 0.5 },
          { resourceId: 'RES-2', units: 0.5 },
        ],
      })
      const originalTotalUnits = 1.0

      const result = EffortDrivenService.recalculateDuration(
        task,
        originalTotalUnits,
        defaultCalendarPrefs,
      )

      // 0.5 + 0.5 = 1.0, ratio = 1/1 = 1, длительность не меняется
      expect(result.duration).toBe(task.duration)
    })

    it('учитывает перегрузку ресурсов (units > 1)', () => {
      const task = createMockTask({
        resourceAssignments: [
          { resourceId: 'RES-1', units: 2.0 },
        ],
      })
      const originalTotalUnits = 1.0

      const result = EffortDrivenService.recalculateDuration(
        task,
        originalTotalUnits,
        defaultCalendarPrefs,
      )

      // 2.0 units вместо 1.0 → длительность уменьшается в 2 раза
      expect(result.duration).toBeLessThan(task.duration)
    })
  })

  describe('getTotalUnits', () => {
    it('возвращает сумму units из назначений', () => {
      const task = createMockTask({
        resourceAssignments: [
          { resourceId: 'RES-1', units: 1.0 },
          { resourceId: 'RES-2', units: 0.5 },
        ],
      })

      const result = EffortDrivenService.getTotalUnits(task)

      expect(result).toBe(1.5)
    })

    it('возвращает 0 для задачи без назначений', () => {
      const task = createMockTask({
        resourceAssignments: [],
      })

      const result = EffortDrivenService.getTotalUnits(task)

      expect(result).toBe(0)
    })

    it('возвращает 0 для задачи без поля resourceAssignments', () => {
      const task = createMockTask({
        resourceAssignments: undefined,
      })

      const result = EffortDrivenService.getTotalUnits(task)

      expect(result).toBe(0)
    })

    it('использует units=1 по умолчанию если units не указан', () => {
      const task = createMockTask({
        resourceAssignments: [
          { resourceId: 'RES-1', units: 1.0 },
          { resourceId: 'RES-2', units: undefined },
        ] as ResourceAssignment[],
      })

      const result = EffortDrivenService.getTotalUnits(task)

      // Второй ресурс без units считается как 1.0
      expect(result).toBe(2)
    })
  })

  describe('shouldApply', () => {
    it('возвращает true если effortDriven включен и тип задачи FIXED_UNITS', () => {
      const task = createMockTask({
        isMilestone: false,
        isSummary: false,
        type: TaskType.FIXED_UNITS,
      })

      const result = EffortDrivenService.shouldApply(true, task)

      expect(result).toBe(true)
    })

    it('возвращает true если effortDriven включен и тип задачи FIXED_WORK', () => {
      const task = createMockTask({
        isMilestone: false,
        isSummary: false,
        type: TaskType.FIXED_WORK,
      })

      const result = EffortDrivenService.shouldApply(true, task)

      expect(result).toBe(true)
    })

    it('возвращает false для типа FIXED_DURATION (длительность не пересчитывается)', () => {
      const task = createMockTask({
        isMilestone: false,
        isSummary: false,
        type: TaskType.FIXED_DURATION,
      })

      const result = EffortDrivenService.shouldApply(true, task)

      expect(result).toBe(false)
    })

    it('возвращает false если effortDriven отключен', () => {
      const task = createMockTask()

      const result = EffortDrivenService.shouldApply(false, task)

      expect(result).toBe(false)
    })

    it('возвращает false для milestone задачи', () => {
      const task = createMockTask({
        isMilestone: true,
      })

      const result = EffortDrivenService.shouldApply(true, task)

      expect(result).toBe(false)
    })

    it('возвращает false для summary задачи', () => {
      const task = createMockTask({
        isSummary: true,
      })

      const result = EffortDrivenService.shouldApply(true, task)

      expect(result).toBe(false)
    })

    it('возвращает false для milestone с отключенным effortDriven', () => {
      const task = createMockTask({
        isMilestone: true,
      })

      const result = EffortDrivenService.shouldApply(false, task)

      expect(result).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('обрабатывает нулевой originalTotalUnits', () => {
      const task = createMockTask({
        resourceAssignments: [
          { resourceId: 'RES-1', units: 1.0 },
        ],
      })
      const originalTotalUnits = 0

      // При originalTotalUnits=0 и newTotalUnits=1, ratio=0/1=0
      // Длительность станет 0, но DurationSyncService вернёт минимум 1
      const result = EffortDrivenService.recalculateDuration(
        task,
        originalTotalUnits,
        defaultCalendarPrefs,
      )

      expect(result.duration).toBeGreaterThanOrEqual(1)
    })

    it('обрабатывает очень большое количество ресурсов', () => {
      const manyAssignments = Array.from({ length: 100 }, (_, i) => ({
        resourceId: `RES-${i}`,
        units: 1.0,
      }))
      const task = createMockTask({
        resourceAssignments: manyAssignments,
      })
      const originalTotalUnits = 1.0

      const result = EffortDrivenService.recalculateDuration(
        task,
        originalTotalUnits,
        defaultCalendarPrefs,
      )

      // При 100x ресурсов длительность должна значительно уменьшиться
      expect(result.duration).toBeLessThan(task.duration)
    })
  })
})
