import { describe, it, expect } from 'vitest'
import { TaskHierarchyService } from '../TaskHierarchyService'
import type { Task } from '@/store/project/interfaces'

/**
 * Тесты для TaskHierarchyService.
 * Проверяют корректность управления иерархией задач (WBS).
 */
describe('TaskHierarchyService', () => {
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

  describe('indent', () => {
    it('увеличивает уровень задачи при отступе', () => {
      const tasks = [
        createMockTask({ id: 'TASK-1', level: 0 }),
        createMockTask({ id: 'TASK-2', level: 0 }),
      ]

      const result = TaskHierarchyService.indent(tasks, 'TASK-2')

      expect(result[1].level).toBe(1)
    })

    it('не изменяет уровень первой задачи', () => {
      const tasks = [
        createMockTask({ id: 'TASK-1', level: 0 }),
      ]

      const result = TaskHierarchyService.indent(tasks, 'TASK-1')

      expect(result[0].level).toBe(0)
    })

    it('не позволяет уровню превышать (уровень предыдущей + 1)', () => {
      const tasks = [
        createMockTask({ id: 'TASK-1', level: 0 }),
        createMockTask({ id: 'TASK-2', level: 0 }),
        createMockTask({ id: 'TASK-3', level: 0 }),
      ]

      // Первый indent для TASK-2
      let result = TaskHierarchyService.indent(tasks, 'TASK-2')
      expect(result[1].level).toBe(1)

      // Повторный indent для TASK-2 — не должен изменить уровень
      result = TaskHierarchyService.indent(result, 'TASK-2')
      expect(result[1].level).toBe(1)
    })

    it('переносит подзадачи вместе с родительской задачей', () => {
      const tasks = [
        createMockTask({ id: 'TASK-1', level: 0 }),
        createMockTask({ id: 'TASK-2', level: 0 }),
        createMockTask({ id: 'TASK-3', level: 1, parentId: 'TASK-2' }),
      ]

      const result = TaskHierarchyService.indent(tasks, 'TASK-2')

      // TASK-2 становится level 1, TASK-3 становится level 2
      expect(result[1].level).toBe(1)
      expect(result[2].level).toBe(2)
    })

    it('устанавливает isSummary=true для родительской задачи', () => {
      const tasks = [
        createMockTask({ id: 'TASK-1', level: 0, isSummary: false }),
        createMockTask({ id: 'TASK-2', level: 0 }),
      ]

      const result = TaskHierarchyService.indent(tasks, 'TASK-2')

      expect(result[0].isSummary).toBe(true)
    })

    it('очищает resourceAssignments при превращении в summary', () => {
      const tasks = [
        createMockTask({
          id: 'TASK-1',
          level: 0,
          isSummary: false,
          resourceAssignments: [{ resourceId: 'RES-1', units: 1.0 }],
        }),
        createMockTask({ id: 'TASK-2', level: 0 }),
      ]

      const result = TaskHierarchyService.indent(tasks, 'TASK-2')

      // При превращении в summary назначения должны быть очищены
      expect(result[0].resourceAssignments).toEqual([])
    })

    it('возвращает тот же массив если задача не найдена', () => {
      const tasks = [
        createMockTask({ id: 'TASK-1', level: 0 }),
      ]

      const result = TaskHierarchyService.indent(tasks, 'NON-EXISTENT')

      expect(result).toEqual(tasks)
    })
  })

  describe('outdent', () => {
    it('не изменяет уровень задачи если level = 1 (защита от выхода за root)', () => {
      const tasks = [
        createMockTask({ id: 'TASK-1', level: 0, isSummary: true }),
        createMockTask({ id: 'TASK-2', level: 1 }),
      ]

      const result = TaskHierarchyService.outdent(tasks, 'TASK-2')

      // level <= 1 защищает от выхода за root уровень
      expect(result[1].level).toBe(1)
    })

    it('не изменяет уровень задачи если level = 0', () => {
      const tasks = [
        createMockTask({ id: 'TASK-1', level: 0 }),
      ]

      const result = TaskHierarchyService.outdent(tasks, 'TASK-1')

      // Первая задача с level=0 не может быть outdent'нута
      expect(result[0].level).toBe(0)
    })

    it('уменьшает уровень задачи и подзадач если level > 1', () => {
      const tasks = [
        createMockTask({ id: 'TASK-1', level: 0, isSummary: true }),
        createMockTask({ id: 'TASK-2', level: 1, isSummary: true }),
        createMockTask({ id: 'TASK-3', level: 2 }),
      ]

      const result = TaskHierarchyService.outdent(tasks, 'TASK-3')

      // TASK-3 становится level 1 (было 2)
      expect(result[2].level).toBe(1)
    })

    it('снимает isSummary если у задачи больше нет подзадач после outdent дочерней', () => {
      const tasks = [
        createMockTask({ id: 'TASK-1', level: 0, isSummary: true }),
        createMockTask({ id: 'TASK-2', level: 1, isSummary: true }),
        createMockTask({ id: 'TASK-3', level: 2 }),
      ]

      // Outdent TASK-3 (level 2 -> 1)
      const result = TaskHierarchyService.outdent(tasks, 'TASK-3')

      // TASK-2 остаётся summary потому что TASK-3 всё ещё на уровне ниже
      // Но после outdent TASK-3 станет level=1, как и TASK-2
      expect(result[1].isSummary).toBe(false) // TASK-2 больше не summary
    })

    it('возвращает тот же массив если задача не найдена', () => {
      const tasks = [
        createMockTask({ id: 'TASK-1', level: 0 }),
      ]

      const result = TaskHierarchyService.outdent(tasks, 'NON-EXISTENT')

      expect(result).toEqual(tasks)
    })
  })

  describe('refreshSummaryFlags', () => {
    it('устанавливает isSummary=true для задач с дочерними элементами', () => {
      const tasks = [
        createMockTask({ id: 'TASK-1', level: 0, isSummary: false }),
        createMockTask({ id: 'TASK-2', level: 1 }),
      ]

      const result = TaskHierarchyService.refreshSummaryFlags(tasks)

      expect(result[0].isSummary).toBe(true)
    })

    it('устанавливает isSummary=false для задач без дочерних элементов', () => {
      const tasks = [
        createMockTask({ id: 'TASK-1', level: 0, isSummary: true }),
        createMockTask({ id: 'TASK-2', level: 0 }),
      ]

      const result = TaskHierarchyService.refreshSummaryFlags(tasks)

      expect(result[0].isSummary).toBe(false)
    })

    it('корректно обрабатывает многоуровневую иерархию', () => {
      const tasks = [
        createMockTask({ id: 'TASK-1', level: 0 }),
        createMockTask({ id: 'TASK-2', level: 1 }),
        createMockTask({ id: 'TASK-3', level: 2 }),
        createMockTask({ id: 'TASK-4', level: 1 }),
        createMockTask({ id: 'TASK-5', level: 0 }),
      ]

      const result = TaskHierarchyService.refreshSummaryFlags(tasks)

      expect(result[0].isSummary).toBe(true)  // TASK-1 имеет дочерние
      expect(result[1].isSummary).toBe(true)  // TASK-2 имеет дочерние
      expect(result[2].isSummary).toBe(false) // TASK-3 без дочерних
      expect(result[3].isSummary).toBe(false) // TASK-4 без дочерних
      expect(result[4].isSummary).toBe(false) // TASK-5 без дочерних
    })

    it('очищает resourceAssignments при первом превращении в summary', () => {
      const tasks = [
        createMockTask({
          id: 'TASK-1',
          level: 0,
          isSummary: false,
          resourceAssignments: [{ resourceId: 'RES-1', units: 1.0 }],
        }),
        createMockTask({ id: 'TASK-2', level: 1 }),
      ]

      const result = TaskHierarchyService.refreshSummaryFlags(tasks)

      // При превращении в summary назначения очищаются
      expect(result[0].resourceAssignments).toEqual([])
    })

    it('сохраняет resourceAssignments если задача уже была summary', () => {
      const tasks = [
        createMockTask({
          id: 'TASK-1',
          level: 0,
          isSummary: true,
          resourceAssignments: [], // Уже пусто
        }),
        createMockTask({ id: 'TASK-2', level: 1 }),
      ]

      const result = TaskHierarchyService.refreshSummaryFlags(tasks)

      // Результат должен быть тем же
      expect(result[0].resourceAssignments).toEqual([])
    })

    it('обрабатывает пустой массив задач', () => {
      const result = TaskHierarchyService.refreshSummaryFlags([])
      expect(result).toEqual([])
    })

    it('обрабатывает массив из одной задачи', () => {
      const tasks = [createMockTask({ id: 'TASK-1', level: 0 })]

      const result = TaskHierarchyService.refreshSummaryFlags(tasks)

      expect(result[0].isSummary).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('обрабатывает indent для последней задачи в списке', () => {
      const tasks = [
        createMockTask({ id: 'TASK-1', level: 0 }),
        createMockTask({ id: 'TASK-2', level: 0 }),
      ]

      const result = TaskHierarchyService.indent(tasks, 'TASK-2')

      expect(result[1].level).toBe(1)
    })

    it('обрабатывает outdent для первой задачи в списке', () => {
      const tasks = [
        createMockTask({ id: 'TASK-1', level: 1 }),
      ]

      const result = TaskHierarchyService.outdent(tasks, 'TASK-1')

      // Первая задача с level=1: task.level <= 1, возвращается без изменений
      expect(result[0].level).toBe(1)
    })
  })
})
