/**
 * Shared project data for all views
 */

export const INITIAL_TASKS = [
  {
    id: 'TASK-001',
    name: 'Проект Разработки Системы',
    startDate: new Date(),
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    baselineStartDate: new Date(),
    baselineEndDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    progress: 0.6,
    color: '#6c757d',
    level: 0,
    summary: true,
    type: 'summary',
    children: ['TASK-002', 'TASK-003', 'TASK-004', 'TASK-005', 'TASK-006'],
    predecessors: []
  },
  {
    id: 'TASK-002',
    name: 'Разработка UI',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    baselineStartDate: new Date(),
    baselineEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    progress: 0.8,
    color: '#007bff',
    level: 1,
    critical: true,
    criticalPath: true,
    resourceIds: ['1'], // John Smith
    predecessors: ['TASK-001']
  },
  {
    id: 'TASK-003',
    name: 'Настройка Tailwind',
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    baselineStartDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    baselineEndDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    progress: 0.65,
    color: '#28a745',
    level: 1,
    critical: true,
    criticalPath: true,
    resourceIds: ['1', '2'], // John & Maria
    predecessors: ['TASK-002']
  },
  {
    id: 'TASK-004',
    name: 'Интеграция Canvas',
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    progress: 0.3,
    color: '#ffc107',
    level: 1,
    estimated: true,
    predecessors: ['TASK-002']
  },
  {
    id: 'TASK-005',
    name: 'Тестирование',
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    progress: 0,
    color: '#dc3545',
    level: 1,
    critical: true,
    criticalPath: true,
    predecessors: ['TASK-003', 'TASK-004']
  },
  {
    id: 'TASK-006',
    name: 'Запуск Продукта',
    startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    progress: 0,
    color: '#ff6b6b',
    level: 1,
    milestone: true,
    type: 'milestone',
    predecessors: ['TASK-005']
  }
];

