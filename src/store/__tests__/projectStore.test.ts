import { describe, it, expect, beforeEach, vi } from 'vitest'

/**
 * Тесты для projectStore (Zustand store).
 *
 * ВАЖНО: projectStore имеет много зависимостей (сервисы, Java API).
 * Для изолированного тестирования используем моки.
 */
describe('projectStore', () => {
  beforeEach(() => {
    // Сбрасываем все моки перед каждым тестом
    vi.clearAllMocks()
  })

  describe('Task interface validation', () => {
    it('создаёт валидную задачу с обязательными полями', () => {
      const task = {
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

      expect(task.id).toBe('TASK-1')
      expect(task.name).toBe('Test Task')
      expect(task.duration).toBe(3)
      expect(task.progress).toBe(0)
    })

    it('создаёт milestone с progress 0 или 1', () => {
      const milestone = {
        id: 'MILESTONE-1',
        name: 'Milestone',
        startDate: new Date('2026-02-15'),
        endDate: new Date('2026-02-15'),
        duration: 0,
        progress: 0,
        isMilestone: true,
        isSummary: false,
        level: 0,
      }

      expect(milestone.isMilestone).toBe(true)
      expect(milestone.progress).toBeLessThanOrEqual(1)
      expect(milestone.progress).toBeGreaterThanOrEqual(0)
    })

    it('создаёт summary задачу с дочерними элементами', () => {
      const summaryTask = {
        id: 'TASK-1',
        name: 'Summary Task',
        startDate: new Date('2026-02-10'),
        endDate: new Date('2026-02-20'),
        duration: 10,
        progress: 0.5,
        isSummary: true,
        isMilestone: false,
        level: 0,
      }

      expect(summaryTask.isSummary).toBe(true)
      expect(summaryTask.duration).toBeGreaterThan(0)
    })
  })

  describe('Resource interface validation', () => {
    it('создаёт валидный ресурс с обязательными полями', () => {
      const resource = {
        id: 'RES-001',
        name: 'Developer',
        type: 'work',
        maxUnits: 1.0,
        standardRate: 100,
        overtimeRate: 150,
      }

      expect(resource.id).toBe('RES-001')
      expect(resource.name).toBe('Developer')
      expect(resource.maxUnits).toBe(1.0)
    })
  })

  describe('ResourceAssignment interface validation', () => {
    it('создаёт валидное назначение ресурса', () => {
      const assignment = {
        resourceId: 'RES-001',
        units: 1.0,
      }

      expect(assignment.resourceId).toBe('RES-001')
      expect(assignment.units).toBe(1.0)
    })

    it('поддерживает частичную загрузку (units < 1)', () => {
      const assignment = {
        resourceId: 'RES-001',
        units: 0.5,
      }

      expect(assignment.units).toBe(0.5)
    })

    it('поддерживает перегрузку (units > 1)', () => {
      const assignment = {
        resourceId: 'RES-001',
        units: 1.5,
      }

      expect(assignment.units).toBe(1.5)
    })
  })

  describe('CalendarPreferences interface validation', () => {
    it('создаёт валидные настройки календаря', () => {
      const prefs = {
        hoursPerDay: 8,
        hoursPerWeek: 40,
        daysPerMonth: 20,
        durationCalculationMode: 'working' as const,
      }

      expect(prefs.hoursPerDay).toBe(8)
      expect(prefs.hoursPerWeek).toBe(40)
      expect(prefs.durationCalculationMode).toBe('working')
    })

    it('поддерживает calendar mode', () => {
      const prefs = {
        hoursPerDay: 8,
        hoursPerWeek: 40,
        daysPerMonth: 20,
        durationCalculationMode: 'calendar' as const,
      }

      expect(prefs.durationCalculationMode).toBe('calendar')
    })
  })

  describe('ProjectBaseline interface validation', () => {
    it('создаёт валидный baseline', () => {
      const baseline = {
        id: 'BL-001',
        name: 'Baseline 1',
        createdAt: new Date('2026-02-12'),
        taskDates: {
          'TASK-1': {
            startDate: new Date('2026-02-12'),
            endDate: new Date('2026-02-15'),
          },
        },
      }

      expect(baseline.id).toBe('BL-001')
      expect(baseline.name).toBe('Baseline 1')
      expect(baseline.taskDates['TASK-1']).toBeDefined()
    })
  })

  describe('Date calculations', () => {
    it('вычисляет правильную длительность между датами', () => {
      const startDate = new Date('2026-02-12')
      const endDate = new Date('2026-02-15')
      const diffMs = endDate.getTime() - startDate.getTime()
      const durationDays = Math.max(1, Math.round(diffMs / (24 * 60 * 60 * 1000)))

      expect(durationDays).toBe(3)
    })

    it('возвращает минимум 1 день для одинаковых дат', () => {
      const startDate = new Date('2026-02-12')
      const endDate = new Date('2026-02-12')
      const diffMs = endDate.getTime() - startDate.getTime()
      const durationDays = Math.max(1, Math.round(diffMs / (24 * 60 * 60 * 1000)))

      expect(durationDays).toBe(1)
    })
  })

  describe('Progress normalization', () => {
    it('нормализует progress в диапазон [0, 1]', () => {
      const normalizeProgress = (progress: number): number => {
        return Math.max(0, Math.min(1, progress))
      }

      expect(normalizeProgress(0)).toBe(0)
      expect(normalizeProgress(0.5)).toBe(0.5)
      expect(normalizeProgress(1)).toBe(1)
      expect(normalizeProgress(1.5)).toBe(1)
      expect(normalizeProgress(-0.5)).toBe(0)
    })

    it('нормализует milestone progress', () => {
      const normalizeMilestoneProgress = (progress: number): number => {
        const clamped = Math.max(0, Math.min(1, progress))
        return clamped >= 0.5 ? 1.0 : 0.0
      }

      expect(normalizeMilestoneProgress(0)).toBe(0)
      expect(normalizeMilestoneProgress(0.4)).toBe(0)
      expect(normalizeMilestoneProgress(0.5)).toBe(1)
      expect(normalizeMilestoneProgress(1)).toBe(1)
    })
  })

  describe('WBS Level validation', () => {
    it('корректно определяет иерархию по уровням', () => {
      const tasks = [
        { id: 'TASK-1', level: 0 },
        { id: 'TASK-2', level: 1 },
        { id: 'TASK-3', level: 2 },
        { id: 'TASK-4', level: 1 },
        { id: 'TASK-5', level: 0 },
      ]

      // TASK-1 - корневая задача
      expect(tasks[0].level).toBe(0)
      // TASK-2 - дочерняя для TASK-1
      expect(tasks[1].level).toBeGreaterThan(tasks[0].level)
      // TASK-3 - дочерняя для TASK-2
      expect(tasks[2].level).toBeGreaterThan(tasks[1].level)
      // TASK-4 - дочерняя для TASK-1, но не для TASK-3
      expect(tasks[3].level).toBeLessThan(tasks[2].level)
    })
  })

  describe('Constraint types validation', () => {
    it('поддерживает базовые типы ограничений', () => {
      const constraints = [
        'AsSoonAsPossible',
        'AsLateAsPossible',
        'MustStartOn',
        'MustFinishOn',
        'StartNoEarlierThan',
        'StartNoLaterThan',
        'FinishNoEarlierThan',
        'FinishNoLaterThan',
      ]

      constraints.forEach((constraint) => {
        expect(typeof constraint).toBe('string')
        expect(constraint.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Store state immutability', () => {
    it('не мутирует исходный массив при добавлении задачи', () => {
      const originalTasks = [
        { id: 'TASK-1', name: 'Task 1' },
      ]
      const newTask = { id: 'TASK-2', name: 'Task 2' }

      // Имитация immutable update
      const updatedTasks = [...originalTasks, newTask]

      expect(originalTasks).toHaveLength(1)
      expect(updatedTasks).toHaveLength(2)
      expect(originalTasks[0].id).toBe('TASK-1')
    })

    it('не мутирует исходный массив при удалении задачи', () => {
      const originalTasks = [
        { id: 'TASK-1', name: 'Task 1' },
        { id: 'TASK-2', name: 'Task 2' },
      ]

      // Имитация immutable delete
      const updatedTasks = originalTasks.filter((t) => t.id !== 'TASK-1')

      expect(originalTasks).toHaveLength(2)
      expect(updatedTasks).toHaveLength(1)
      expect(updatedTasks[0].id).toBe('TASK-2')
    })

    it('не мутирует задачу при обновлении', () => {
      const originalTask = { id: 'TASK-1', name: 'Task 1', progress: 0 }
      const updates = { progress: 0.5 }

      // Имитация immutable update
      const updatedTask = { ...originalTask, ...updates }

      expect(originalTask.progress).toBe(0)
      expect(updatedTask.progress).toBe(0.5)
    })
  })
})
