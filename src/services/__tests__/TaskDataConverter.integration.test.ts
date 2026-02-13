import { describe, it, expect } from 'vitest'
import { TaskDataConverter } from '../TaskDataConverter'
import type { CoreTaskData } from '@/types/api-types'

describe('TaskDataConverter - Integration: Linked Tasks Date Preservation', () => {
  it('сохраняет целостность дат при конвертации связанных задач из Java CPM', () => {
    // Mock данных из Java API после CPM (реальный сценарий из бага)
    // TASK2 - задача-последователь после TASK1, CPM вычислил её earlyFinish
    const coreTask2: CoreTaskData = {
      id: 'TASK2',
      name: 'Новая задача 2',
      startDate: '2026-03-15T00:00:00+03:00',
      endDate: '2026-04-11T23:59:59.999+03:00', // ❗ Конец дня из CPM
      calculatedStartDate: '2026-03-15T00:00:00+03:00',
      calculatedEndDate: '2026-04-11T23:59:59.999+03:00',
      duration: 28,
      progress: 0,
      level: 0,
      color: '#4A90D9',
      isSummary: false,
      isMilestone: false,
      isEstimated: false,
      isCritical: true,
      type: 'TASK',
      children: [],
      predecessors: ['TASK1'],
      resourceIds: [],
      notes: '',
      wbs: 'TASK2',
    }
    
    const frontendTask = TaskDataConverter.coreToFrontendTask(coreTask2)
    
    // Проверяем: endDate НЕ потерял день
    // До фикса: endDate был 2026-04-10T21:00:00.000Z (потеря дня)
    // После фикса: endDate должен быть 2026-04-11T21:00:00.000Z или позже
    const endDay = frontendTask.endDate.getDate()
    expect(endDay).toBeGreaterThanOrEqual(11) // Не 10!
    
    // Проверяем: время нормализовано к полуночи
    expect(frontendTask.endDate.getHours()).toBe(0)
    expect(frontendTask.endDate.getMinutes()).toBe(0)
    expect(frontendTask.endDate.getSeconds()).toBe(0)
    expect(frontendTask.endDate.getMilliseconds()).toBe(0)
    
    // Проверяем: duration не исказилась
    expect(frontendTask.duration).toBe(28)
  })
  
  it('обрабатывает задачу без 23:59:59.999 (обычный случай)', () => {
    const coreTask1: CoreTaskData = {
      id: 'TASK1',
      name: 'Новая задача 1',
      startDate: '2026-02-16T00:00:00+03:00',
      endDate: '2026-03-15T00:00:00+03:00', // Обычная дата (не конец дня)
      calculatedStartDate: '2026-02-16T00:00:00+03:00',
      calculatedEndDate: '2026-03-15T00:00:00+03:00',
      duration: 28,
      progress: 0,
      level: 0,
      color: '#4A90D9',
      isSummary: false,
      isMilestone: false,
      isEstimated: false,
      isCritical: true,
      type: 'TASK',
      children: [],
      predecessors: [],
      resourceIds: [],
      notes: '',
      wbs: 'TASK1',
    }
    
    const frontendTask = TaskDataConverter.coreToFrontendTask(coreTask1)
    
    // Обычная дата не должна искажаться
    // Проверяем что время нормализовано к полуночи
    expect(frontendTask.startDate.getHours()).toBe(0)
    expect(frontendTask.startDate.getMinutes()).toBe(0)
    expect(frontendTask.endDate.getHours()).toBe(0)
    expect(frontendTask.endDate.getMinutes()).toBe(0)
    
    // Проверяем duration
    expect(frontendTask.duration).toBe(28)
  })
  
  it('preserves predecessor-successor chain без потери дат', () => {
    // Симулируем full chain: TASK1 -> TASK2
    const task1: CoreTaskData = {
      id: 'TASK1',
      name: 'Предшественник',
      startDate: '2026-02-16T00:00:00+03:00',
      endDate: '2026-03-15T00:00:00+03:00',
      calculatedStartDate: '2026-02-16T00:00:00+03:00',
      calculatedEndDate: '2026-03-15T00:00:00+03:00',
      duration: 27,
      progress: 0,
      level: 0,
      color: '#4A90D9',
      isSummary: false,
      isMilestone: false,
      isEstimated: false,
      isCritical: true,
      type: 'TASK',
      children: [],
      predecessors: [],
      resourceIds: [],
      notes: '',
      wbs: 'TASK1',
    }
    
    const task2: CoreTaskData = {
      id: 'TASK2',
      name: 'Последователь',
      startDate: '2026-03-15T00:00:00+03:00',
      endDate: '2026-04-11T23:59:59.999+03:00', // ❗ End-of-day из CPM
      calculatedStartDate: '2026-03-15T00:00:00+03:00',
      calculatedEndDate: '2026-04-11T23:59:59.999+03:00',
      duration: 28,
      progress: 0,
      level: 0,
      color: '#4A90D9',
      isSummary: false,
      isMilestone: false,
      isEstimated: false,
      isCritical: true,
      type: 'TASK',
      children: [],
      predecessors: ['TASK1'],
      resourceIds: [],
      notes: '',
      wbs: 'TASK2',
    }
    
    const frontendTask1 = TaskDataConverter.coreToFrontendTask(task1)
    const frontendTask2 = TaskDataConverter.coreToFrontendTask(task2)
    
    // Проверяем: TASK1 endDate = TASK2 startDate (непрерывность цепочки)
    const task1EndMs = frontendTask1.endDate.getTime()
    const task2StartMs = frontendTask2.startDate.getTime()
    
    // Должны быть равны или TASK2 начинается сразу после TASK1
    expect(task2StartMs).toBeGreaterThanOrEqual(task1EndMs)
    
    // Проверяем: TASK2 не потерял день
    expect(frontendTask2.endDate.getDate()).toBeGreaterThanOrEqual(11)
    
    // Проверяем: обе задачи имеют правильные durations
    expect(frontendTask1.duration).toBe(27)
    expect(frontendTask2.duration).toBe(28)
  })
  
  it('не вносит регрессию для одиночных задач без связей', () => {
    const singleTask: CoreTaskData = {
      id: 'SINGLE',
      name: 'Одиночная задача',
      startDate: '2026-02-16T00:00:00+03:00',
      endDate: '2026-02-23T00:00:00+03:00', // 7 дней
      calculatedStartDate: '2026-02-16T00:00:00+03:00',
      calculatedEndDate: '2026-02-23T00:00:00+03:00',
      duration: 7,
      progress: 0,
      level: 0,
      color: '#4A90D9',
      isSummary: false,
      isMilestone: false,
      isEstimated: false,
      isCritical: true,
      type: 'TASK',
      children: [],
      predecessors: [],
      resourceIds: [],
      notes: '',
      wbs: 'SINGLE',
    }
    
    const frontendTask = TaskDataConverter.coreToFrontendTask(singleTask)
    
    // Одиночная задача не должна искажаться
    expect(frontendTask.duration).toBe(7)
    expect(frontendTask.startDate.getHours()).toBe(0)
    expect(frontendTask.endDate.getHours()).toBe(0)
  })
})
