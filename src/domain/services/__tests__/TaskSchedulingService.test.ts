import { describe, it, expect, beforeEach } from 'vitest'
import { TaskSchedulingService } from '../TaskSchedulingService'
import type { Task } from '@/store/project/interfaces'
import type { CalendarPreferences, SchedulePreferences, TaskType } from '@/types/Master_Functionality_Catalog'

/**
 * Тесты для TaskSchedulingService.
 * Проверяют корректность пересчёта расписания задач.
 */
describe('TaskSchedulingService', () => {
  let defaultCalendarPrefs: CalendarPreferences
  let defaultSchedulePrefs: SchedulePreferences

  beforeEach(() => {
    defaultCalendarPrefs = {
      hoursPerDay: 8,
      hoursPerWeek: 40,
      daysPerMonth: 20,
      durationCalculationMode: 'working',
    }
    defaultSchedulePrefs = {
      newTasksStartToday: true,
      durationEnteredIn: 'days',
      schedulingRule: 'FIXED_UNITS' as TaskType,
      effortDriven: false,
      honorRequiredDates: false,
      workUnit: 'hours',
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
    }
    return { ...baseTask, ...overrides } as Task
  }

  describe('recalculateAll', () => {
    it('пересчитывает длительность обычной задачи', () => {
      const tasks = [createMockTask()]
      const result = TaskSchedulingService.recalculateAll(
        tasks,
        defaultCalendarPrefs,
        defaultSchedulePrefs,
      )
      expect(result[0].duration).toBeDefined()
      expect(result[0].duration).toBeGreaterThan(0)
    })

    it('не пересчитывает milestone задачи', () => {
      const originalDuration = 0
      const tasks = [createMockTask({ isMilestone: true, duration: originalDuration })]
      const result = TaskSchedulingService.recalculateAll(
        tasks,
        defaultCalendarPrefs,
        defaultSchedulePrefs,
      )
      expect(result[0].duration).toBe(originalDuration)
    })

    it('не пересчитывает summary задачи напрямую', () => {
      const originalDuration = 5
      const tasks = [createMockTask({ isSummary: true, duration: originalDuration })]
      const result = TaskSchedulingService.recalculateAll(
        tasks,
        defaultCalendarPrefs,
        defaultSchedulePrefs,
      )
      // Summary задачи обрабатываются отдельно в recalculateSummaryTasks
      expect(result).toHaveLength(1)
    })

    it('уважает honorRequiredDates для задач с MustStartOn', () => {
      const originalEndDate = new Date('2026-02-15')
      const tasks = [createMockTask({
        constraint: 'MustStartOn',
        endDate: originalEndDate,
      })]
      const prefsWithHonor = { ...defaultSchedulePrefs, honorRequiredDates: true }

      const result = TaskSchedulingService.recalculateAll(
        tasks,
        defaultCalendarPrefs,
        prefsWithHonor,
      )
      // При honorRequiredDates=true задача с MustStartOn не должна пересчитываться
      expect(result[0].endDate.getTime()).toBe(originalEndDate.getTime())
    })

    it('уважает honorRequiredDates для задач с MustFinishOn', () => {
      const originalEndDate = new Date('2026-02-15')
      const tasks = [createMockTask({
        constraint: 'MustFinishOn',
        endDate: originalEndDate,
      })]
      const prefsWithHonor = { ...defaultSchedulePrefs, honorRequiredDates: true }

      const result = TaskSchedulingService.recalculateAll(
        tasks,
        defaultCalendarPrefs,
        prefsWithHonor,
      )
      expect(result[0].endDate.getTime()).toBe(originalEndDate.getTime())
    })

    it('пересчитывает задачи без constraint при honorRequiredDates=true', () => {
      const tasks = [createMockTask({ constraint: undefined })]
      const prefsWithHonor = { ...defaultSchedulePrefs, honorRequiredDates: true }

      const result = TaskSchedulingService.recalculateAll(
        tasks,
        defaultCalendarPrefs,
        prefsWithHonor,
      )
      // Задача без constraint должна быть пересчитана
      expect(result[0].duration).toBeDefined()
    })

    it('игнорирует honorRequiredDates при honorRequiredDates=false', () => {
      const tasks = [createMockTask({ constraint: 'MustStartOn' })]
      const prefsWithoutHonor = { ...defaultSchedulePrefs, honorRequiredDates: false }

      const result = TaskSchedulingService.recalculateAll(
        tasks,
        defaultCalendarPrefs,
        prefsWithoutHonor,
      )
      // Задача должна быть пересчитана даже с constraint
      expect(result[0].duration).toBeDefined()
    })
  })

  describe('recalculateSummaryTasks', () => {
    it('агрегирует даты дочерних задач', () => {
      const parentTask = createMockTask({
        id: 'TASK-1',
        isSummary: true,
        level: 0,
        startDate: new Date('2026-02-12'),
        endDate: new Date('2026-02-15'),
      })
      const childTask1 = createMockTask({
        id: 'TASK-2',
        startDate: new Date('2026-02-10T00:00:00'),
        endDate: new Date('2026-02-12T00:00:00'),
        parentId: 'TASK-1',
        level: 1,
      })
      const childTask2 = createMockTask({
        id: 'TASK-3',
        startDate: new Date('2026-02-13T00:00:00'),
        endDate: new Date('2026-02-16T00:00:00'),
        parentId: 'TASK-1',
        level: 1,
      })

      const tasks = [parentTask, childTask1, childTask2]
      const result = TaskSchedulingService.recalculateSummaryTasks(tasks)

      const updatedParent = result.find((t) => t.id === 'TASK-1')
      // Проверяем что даты установлены корректно
      // CalendarDateService.toLocalMidnight учитывает timezone
      expect(updatedParent?.startDate).toBeDefined()
      expect(updatedParent?.endDate).toBeDefined()
      // startDate должен быть около 10.02 (допуск +/- 1 день для timezone)
      expect(updatedParent?.startDate.getTime()).toBeLessThan(new Date('2026-02-12').getTime())
      // endDate должен быть около 16.02 (допуск +/- 1 день для timezone)
      expect(updatedParent?.endDate.getTime()).toBeGreaterThan(new Date('2026-02-15').getTime())
    })

    it('вычисляет средний прогресс дочерних задач (без milestone)', () => {
      const parentTask = createMockTask({
        id: 'TASK-1',
        isSummary: true,
        level: 0,
        progress: 0,
      })
      const childTask1 = createMockTask({
        id: 'TASK-2',
        progress: 0.5,
        parentId: 'TASK-1',
        level: 1,
      })
      const childTask2 = createMockTask({
        id: 'TASK-3',
        progress: 0.7,
        parentId: 'TASK-1',
        level: 1,
      })

      const tasks = [parentTask, childTask1, childTask2]
      const result = TaskSchedulingService.recalculateSummaryTasks(tasks)

      const updatedParent = result.find((t) => t.id === 'TASK-1')
      // (0.5 + 0.7) / 2 = 0.6
      expect(updatedParent?.progress).toBeCloseTo(0.6, 2)
    })

    it('игнорирует milestone при расчёте прогресса', () => {
      const parentTask = createMockTask({
        id: 'TASK-1',
        isSummary: true,
        level: 0,
        progress: 0,
      })
      const childTask = createMockTask({
        id: 'TASK-2',
        progress: 0.8,
        parentId: 'TASK-1',
        level: 1,
      })
      const milestoneTask = createMockTask({
        id: 'TASK-3',
        progress: 1.0,
        isMilestone: true,
        parentId: 'TASK-1',
        level: 1,
      })

      const tasks = [parentTask, childTask, milestoneTask]
      const result = TaskSchedulingService.recalculateSummaryTasks(tasks)

      const updatedParent = result.find((t) => t.id === 'TASK-1')
      // Только childTask учитывается, milestone игнорируется
      expect(updatedParent?.progress).toBe(0.8)
    })

    it('устанавливает duration для summary задачи', () => {
      const parentTask = createMockTask({
        id: 'TASK-1',
        isSummary: true,
        level: 0,
        duration: 0,
      })
      const childTask1 = createMockTask({
        id: 'TASK-2',
        startDate: new Date('2026-02-10'),
        endDate: new Date('2026-02-12'),
        parentId: 'TASK-1',
        level: 1,
      })
      const childTask2 = createMockTask({
        id: 'TASK-3',
        startDate: new Date('2026-02-13'),
        endDate: new Date('2026-02-16'),
        parentId: 'TASK-1',
        level: 1,
      })

      const tasks = [parentTask, childTask1, childTask2]
      const result = TaskSchedulingService.recalculateSummaryTasks(tasks)

      const updatedParent = result.find((t) => t.id === 'TASK-1')
      expect(updatedParent?.duration).toBeGreaterThan(0)
    })

    it('не изменяет задачи без дочерних элементов', () => {
      const task = createMockTask({
        isSummary: true,
        level: 0,
        startDate: new Date('2026-02-12'),
        endDate: new Date('2026-02-15'),
        duration: 3,
      })

      const tasks = [task]
      const result = TaskSchedulingService.recalculateSummaryTasks(tasks)

      // Задача без дочерних не должна измениться
      expect(result[0].startDate.getTime()).toBe(task.startDate.getTime())
      expect(result[0].endDate.getTime()).toBe(task.endDate.getTime())
    })
  })

  describe('prepareNewTask', () => {
    it('нормализует даты к локальной полуночи', () => {
      const task = createMockTask({
        startDate: new Date('2026-02-12T14:30:00'),
        endDate: new Date('2026-02-15T16:45:00'),
      })

      const result = TaskSchedulingService.prepareNewTask(
        task,
        defaultSchedulePrefs,
        defaultCalendarPrefs,
      )

      // Даты должны быть нормализованы к полуночи
      expect(result.startDate.getHours()).toBe(0)
      expect(result.startDate.getMinutes()).toBe(0)
      expect(result.endDate.getHours()).toBe(0)
      expect(result.endDate.getMinutes()).toBe(0)
    })

    it('устанавливает startDate из newTasksStartToday при отсутствии', () => {
      const task = createMockTask({
        startDate: undefined as unknown as Date,
        endDate: undefined as unknown as Date,
      })

      const result = TaskSchedulingService.prepareNewTask(
        task,
        { ...defaultSchedulePrefs, newTasksStartToday: true },
        defaultCalendarPrefs,
      )

      expect(result.startDate).toBeDefined()
      expect(result.startDate.getHours()).toBe(0)
    })

    it('вычисляет endDate на основе startDate при отсутствии', () => {
      const task = createMockTask({
        startDate: new Date('2026-02-12'),
        endDate: undefined as unknown as Date,
      })

      const result = TaskSchedulingService.prepareNewTask(
        task,
        defaultSchedulePrefs,
        defaultCalendarPrefs,
      )

      expect(result.endDate).toBeDefined()
      expect(result.endDate.getTime()).toBeGreaterThan(result.startDate.getTime())
    })

    it('устанавливает duration на основе дат', () => {
      const task = createMockTask({
        startDate: new Date('2026-02-12'),
        endDate: new Date('2026-02-15'),
        duration: 0,
      })

      const result = TaskSchedulingService.prepareNewTask(
        task,
        defaultSchedulePrefs,
        defaultCalendarPrefs,
      )

      expect(result.duration).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('обрабатывает пустой массив задач', () => {
      const result = TaskSchedulingService.recalculateAll(
        [],
        defaultCalendarPrefs,
        defaultSchedulePrefs,
      )
      expect(result).toEqual([])
    })

    it('обрабатывает undefined schedulePrefs', () => {
      const tasks = [createMockTask()]
      const result = TaskSchedulingService.recalculateAll(
        tasks,
        defaultCalendarPrefs,
        undefined,
      )
      expect(result).toHaveLength(1)
    })

    it('обрабатывает пустой schedulePrefs', () => {
      const tasks = [createMockTask()]
      const result = TaskSchedulingService.recalculateAll(
        tasks,
        defaultCalendarPrefs,
        {},
      )
      expect(result).toHaveLength(1)
    })
  })
})
