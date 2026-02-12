# 🚀 ROADMAP V2: Технические улучшения PlanPro

**Версия:** 1.0.0
**Дата создания:** 12.02.2026
**Статус:** На утверждении
**Автор:** Architecture Team
**Оценка:** 14-20 рабочих дней

---

## 📋 EXECUTIVE SUMMARY

**Цель:** Повышение качества кодовой базы, расширяемости и поддерживаемости проекта через систематические технические улучшения.

**Обоснование:** Анализ проекта выявил несколько областей для улучшения:
- Покрытие тестами < 1% (критически низкое)
- Несогласованная генерация ID в разных модулях
- Смешанные async-паттерны (.then vs async/await)
- Отсутствие View-level Error Boundaries
- Дублирование кода (useEffect, array checks)

**Ожидаемый результат:**
- Покрытие тестами ≥ 60% для domain-сервисов
- Унифицированная генерация ID
- Консистентный async/await синтаксис
- Graceful degradation при ошибках в Views
- Переиспользуемые утилиты

---

## 🎯 ОБЗОР ФАЗ

| Фаза | Название | Приоритет | Оценка | Зависимости | Статус |
|------|----------|-----------|--------|-------------|--------|
| **1** | Тестовая инфраструктура | P0 | 5 дней | Нет | 📋 Планирование |
| **2** | Унификация ID генерации | P1 | 2 дня | Нет | 📋 Планирование |
| **3** | Миграция async/await | P1 | 3 дня | Нет | 📋 Планирование |
| **4** | View-level Error Boundaries | P1 | 2 дня | Нет | 📋 Планирование |
| **5** | Консолидация useEffect | P2 | 1 день | Нет | 📋 Планирование |
| **6** | Array/ID Utils | P2 | 1 день | Фаза 2 | 📋 Планирование |

---

## 📦 ФАЗА 1: Тестовая инфраструктура (P0)

### 🎯 Цель
Обеспечить 60%+ покрытие тестами критических domain-сервисов.

### 📊 Текущее состояние
- Найдено тестовых файлов: **1** (`syncProjectToJava.test.ts`)
- Файлов в `src/`: **~757**
- Покрытие: **~0.13%** (критически низкое)

### 📁 Структура файлов

```
src/
├── vitest.config.ts                    # [НОВЫЙ]
├── vitest.setup.ts                     # [НОВЫЙ]
├── domain/
│   ├── services/
│   │   ├── __tests__/
│   │   │   ├── CalendarMathService.test.ts    # [НОВЫЙ]
│   │   │   ├── TaskSchedulingService.test.ts   # [НОВЫЙ]
│   │   │   ├── TaskHierarchyService.test.ts    # [НОВЫЙ]
│   │   │   ├── DurationSyncService.test.ts     # [НОВЫЙ]
│   │   │   └── EffortDrivenService.test.ts     # [НОВЫЙ]
│   │   └── ...
│   ├── calendar/
│   │   └── services/
│   │       └── __tests__/
│   │           └── CalendarTemplateService.test.ts  # [НОВЫЙ]
│   └── sheets/
│       └── services/
│           └── __tests__/
│               └── SheetValidationService.test.ts   # [НОВЫЙ]
└── store/
    └── __tests__/
        └── projectStore.test.ts               # [НОВЫЙ]
```

### 🔧 Задачи

#### 1.1 Настройка Vitest (0.5 дня)

**Файл:** `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/domain/**/*.ts'],
      threshold: {
        lines: 60,
        branches: 50,
        functions: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Файл:** `vitest.setup.ts`
```typescript
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
```

**package.json изменения:**
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "jsdom": "^24.0.0",
    "@vitest/coverage-v8": "^1.0.0"
  },
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

#### 1.2-1.7 Тесты для domain-сервисов (4.5 дня)

| # | Тестовый файл | Сервис | Оценка |
|---|---------------|--------|--------|
| 1.2 | `CalendarMathService.test.ts` | Математика календаря | 0.5 дня |
| 1.3 | `TaskSchedulingService.test.ts` | Планирование задач | 0.5 дня |
| 1.4 | `TaskHierarchyService.test.ts` | Иерархия задач | 0.5 дня |
| 1.5 | `DurationSyncService.test.ts` | Синхронизация длительности | 0.5 дня |
| 1.6 | `EffortDrivenService.test.ts` | Effort-driven логика | 0.5 дня |
| 1.7 | `projectStore.test.ts` | Zustand store | 1 день |

### ✅ Контрольные точки

- [x] Vitest настроен и работает (`npm test`)
- [x] 7 тестовых файлов созданы
- [x] Coverage ≥ 60% для `domain/services`
- [x] Все тесты проходят
- [ ] CI интеграция (опционально)

---

## 📦 ФАЗА 2: Унификация ID генерации (P1)

### 🎯 Цель
Устранить использование `Date.now()` для генерации ID и унифицировать подход через существующие генераторы.

### 📊 Проблема

**Текущее состояние — два подхода:**

**Подход 1 (Правильный):**
```typescript
// TaskIdGenerator.ts
public static generate(existingTasks): string {
  return `${this.PREFIX}${maxNum + 1}`  // TASK1, TASK2...
}

// ResourceIdGenerator.ts
public static generate(existingResources): string {
  return `${this.PREFIX}${String(nextNum).padStart(3, '0')}`  // RES-001...
}
```

**Подход 2 (Устаревший — 10 файлов):**
```typescript
id: Date.now().toString()
```

**Риск:** При быстром создании нескольких сущностей возможны коллизии.

### 🛡️ Защита от дубликатов (max + 1)

Генераторы используют подход **max(existingIds) + 1** для гарантии уникальности:

```typescript
// Пример: есть задачи TASK-1, TASK-2, TASK-5, TASK-10
// max = 10 → следующая задача = TASK-11

// При удалении TASK-5:
// max = 10 → следующая задача = TASK-11 (не TASK-5!)

// При удалении TASK-10:
// max = 5 → следующая задача = TASK-10 (возможен повтор номера)
```

**Важно:** Подход защищает от дубликатов в большинстве случаев. Единственное исключение — при удалении сущности с максимальным номером он может быть переиспользован. Для полной защиты требуется **каскадное удаление связей** (см. задачу 2.7).

### 📁 Файлы для изменения

| Файл | Строка | Текущий код | Изменение |
|------|--------|-------------|-----------|
| `projectStore.ts` | 354 | `id: Date.now().toString()` | BaselineIdGenerator |
| `ResourceFactory.ts` | 26 | `id: Date.now().toString()` | ResourceIdGenerator |
| `task-utils.ts` | 47 | `id: Date.now().toString()` | TaskIdGenerator |
| `project-utils.ts` | 11 | `createMockProject` | Генераторы |
| `assignment-utils.ts` | 48 | `createMockAssignment` | Генераторы |
| `resource-utils.ts` | 41 | `createMockResource` | ResourceIdGenerator |
| `hooks/useTaskActions.ts` | - | `Date.now()` | TaskIdGenerator |
| `hooks/useAssignmentActions.ts` | - | `Date.now()` | AssignmentIdGenerator |
| `hooks/state/useProjectLifecycle.ts` | - | `Date.now()` | Генераторы |
| `ContextMenuProvider.tsx` | 94 | `Date.now()` | generateMenuId |

### 🔧 Задачи

#### 2.1 Создание BaselineIdGenerator (0.25 дня)

**Файл:** `src/domain/baseline/services/BaselineIdGenerator.ts`

```typescript
/**
 * Сервис генерации уникальных ID для baseline'ов.
 * Clean Architecture: Domain Service
 * SOLID: Single Responsibility - только генерация ID baseline
 *
 * @version 1.0.0
 */

interface BaselineWithId {
  id: string;
}

export class BaselineIdGenerator {
  private static readonly PREFIX = 'BL'

  /**
   * Генерирует ID baseline в формате BL-001, BL-002...
   * Использует max(existingIds) + 1 для гарантии уникальности.
   *
   * @param existingBaselines - массив существующих baseline'ов
   * @returns уникальный ID
   */
  public static generate(existingBaselines: ReadonlyArray<BaselineWithId>): string {
    let maxNum = 0
    for (const baseline of existingBaselines) {
      const num = this.extractNumber(baseline.id)
      if (num !== null && num > maxNum) {
        maxNum = num
      }
    }
    return `${this.PREFIX}-${String(maxNum + 1).padStart(3, '0')}`
  }

  /**
   * Извлекает числовой порядок из ID baseline.
   */
  private static extractNumber(id: string): number | null {
    const match = id.match(/^BL-(\d+)$/)
    return match ? parseInt(match[1], 10) : null
  }

  /**
   * Проверяет соответствие ID стандартному формату.
   */
  public static isValid(id: string): boolean {
    return /^BL-\d{3,}$/.test(id)
  }
}
```

#### 2.2 Создание AssignmentIdGenerator (0.25 дня)

**Файл:** `src/domain/assignment/services/AssignmentIdGenerator.ts`

```typescript
/**
 * Сервис генерации уникальных ID для назначений ресурсов на задачи.
 * Clean Architecture: Domain Service
 *
 * @version 1.0.0
 */

export class AssignmentIdGenerator {
  private static readonly PREFIX = 'ASSIGN'

  /**
   * Генерирует ID назначения на основе taskId и resourceId.
   * Формат: ASSIGN-{taskId}-{resourceId}
   *
   * @param taskId - ID задачи
   * @param resourceId - ID ресурса
   * @returns уникальный ID назначения
   */
  public static generate(taskId: string, resourceId: string): string {
    // Нормализуем ID для использования в составном ключе
    const normalizedTaskId = taskId.replace(/[^a-zA-Z0-9]/g, '_')
    const normalizedResourceId = resourceId.replace(/[^a-zA-Z0-9]/g, '_')
    return `${this.PREFIX}-${normalizedTaskId}-${normalizedResourceId}`
  }

  /**
   * Проверяет соответствие ID стандартному формату.
   */
  public static isValid(id: string): boolean {
    return /^ASSIGN-.+-.+$/.test(id)
  }

  /**
   * Извлекает taskId из ID назначения.
   */
  public static extractTaskId(id: string): string | null {
    const match = id.match(/^ASSIGN-(.+)-(.+)$/)
    return match ? match[1] : null
  }

  /**
   * Извлекает resourceId из ID назначения.
   */
  public static extractResourceId(id: string): string | null {
    const match = id.match(/^ASSIGN-(.+)-(.+)$/)
    return match ? match[2] : null
  }
}
```

#### 2.3-2.6 Рефакторинг файлов (1 день)

Пошаговое обновление всех 10 файлов с заменой `Date.now()` на генераторы с логикой **max + 1**:
- `TaskIdGenerator` → TASK1, TASK2, TASK3...
- `ResourceIdGenerator` → RES-001, RES-002...
- `BaselineIdGenerator` → BL-001, BL-002...
- `AssignmentIdGenerator` → ASSIGN-{taskId}-{resourceId} (детерминированный)

---

**2.3 projectStore.ts (saveBaseline)**

```typescript
// ДО:
saveBaseline: (name) => set((s) => {
  const newBaseline = {
    id: Date.now().toString(),
    name: name || `Baseline ${s.baselines.length + 1}`,
    // ...
  }
  return { baselines: [...s.baselines, newBaseline], /* ... */ }
}),

// ПОСЛЕ:
import { BaselineIdGenerator } from '@/domain/baseline/services/BaselineIdGenerator'

saveBaseline: (name) => set((s) => {
  const newBaseline = {
    id: BaselineIdGenerator.generate(s.baselines),  // BL-001, BL-002...
    name: name || `Baseline ${s.baselines.length + 1}`,
    // ...
  }
  return { baselines: [...s.baselines, newBaseline], /* ... */ }
}),
```

---

**2.4 ResourceFactory.ts**

```typescript
// ДО:
static create(data: Partial<Resource>, preferences: UserPreferences): Resource {
  const resource: Resource = {
    ...data,
    id: Date.now().toString(),
    standardRate: this.getValueOrDefault(data.standardRate, defaultStandardRate),
  }
  return resource
}

// ПОСЛЕ:
import { ResourceIdGenerator } from '@/domain/resources/services/ResourceIdGenerator'

static create(data: Partial<Resource>, preferences: UserPreferences, existingResources: Resource[]): Resource {
  const resource: Resource = {
    ...data,
    id: ResourceIdGenerator.generate(existingResources),  // RES-001, RES-002...
    standardRate: this.getValueOrDefault(data.standardRate, defaultStandardRate),
  }
  return resource
}
```

---

**2.5 task-utils.ts (createMockTask)**

```typescript
// ДО:
static createMockTask(data: Omit<Task, 'id'>): Task {
  return {
    id: Date.now().toString(),
    ...data,
  }
}

// ПОСЛЕ:
import { TaskIdGenerator } from '@/domain/tasks/services/TaskIdGenerator'

static createMockTask(data: Omit<Task, 'id'>, existingTasks: Task[] = []): Task {
  return {
    id: TaskIdGenerator.generate(existingTasks),  // TASK1, TASK2...
    ...data,
  }
}
```

---

**2.6 assignment-utils.ts (createMockAssignment)**

```typescript
// ДО:
static createMockAssignment(data: Omit<Assignment, 'id'>): Assignment {
  return {
    id: Date.now().toString(),
    ...data,
  }
}

// ПОСЛЕ:
import { AssignmentIdGenerator } from '@/domain/assignment/services/AssignmentIdGenerator'

static createMockAssignment(data: Omit<Assignment, 'id'>): Assignment {
  return {
    id: AssignmentIdGenerator.generate(data.taskId, data.resourceId),  // ASSIGN-TASK-1-RES-001
    ...data,
  }
}
```

---

**2.7 resource-utils.ts (createMockResource)**

```typescript
// ДО:
static createMockResource(data: Omit<Resource, 'id'>): Resource {
  return {
    id: Date.now().toString(),
    ...data,
  }
}

// ПОСЛЕ:
import { ResourceIdGenerator } from '@/domain/resources/services/ResourceIdGenerator'

static createMockResource(data: Omit<Resource, 'id'>, existingResources: Resource[] = []): Resource {
  return {
    id: ResourceIdGenerator.generate(existingResources),  // RES-001, RES-002...
    ...data,
  }
}
```

---

**2.8 project-utils.ts (createMockProject)**

```typescript
// ДО:
static createMockProject(name: string, additionalData?: Partial<Project>): Project {
  const mockProject: Project = {
    id: Date.now().toString(),
    name,
    // ...
  }
}

// ПОСЛЕ:
// Для mock-проектов используем префикс MOCK- для отличия от реальных
static createMockProject(name: string, additionalData?: Partial<Project>): Project {
  const mockProject: Project = {
    id: `MOCK-${Date.now().toString(36)}`,  // MOCK-lq3x7k (короткий, уникальный)
    name,
    // ...
  }
}
```

> **Примечание:** Для mock-утилит допустимо использовать `Date.now()` с префиксом, так как они не попадают в production.

---

**2.9 hooks/useTaskActions.ts**

```typescript
// ДО:
const newTask: Task = {
  ...taskData,
  id: Date.now().toString(),
}

// ПОСЛЕ:
import { TaskIdGenerator } from '@/domain/tasks/services/TaskIdGenerator'
import { useProjectStore } from '@/store/projectStore'

const tasks = useProjectStore.getState().tasks
const newTask: Task = {
  ...taskData,
  id: TaskIdGenerator.generate(tasks),  // TASK1, TASK2...
}
```

---

**2.10 hooks/useAssignmentActions.ts**

```typescript
// ДО:
const newAssignment: Assignment = {
  ...assignmentData,
  id: Date.now().toString(),
}

// ПОСЛЕ:
import { AssignmentIdGenerator } from '@/domain/assignment/services/AssignmentIdGenerator'

const newAssignment: Assignment = {
  ...assignmentData,
  id: AssignmentIdGenerator.generate(assignmentData.taskId, assignmentData.resourceId),  // ASSIGN-TASK-1-RES-001
}
```

---

**2.11 hooks/state/useProjectLifecycle.ts**

```typescript
// ДО:
const createProject = useCallback((initialData?: Partial<Project>): Project => {
  const newProject: Project = {
    id: Date.now().toString(),
    name: 'Новый проект',
    // ...
  }
}

// ПОСЛЕ:
// Для проекта используем UUID или короткий идентификатор
import { nanoid } from 'nanoid'

const createProject = useCallback((initialData?: Partial<Project>): Project => {
  const newProject: Project = {
    id: `PROJ-${nanoid(8)}`,  // PROJ-x7k2m9p3
    name: 'Новый проект',
    // ...
  }
}
```

> **Примечание:** Для проектов ID генерируется через nanoid, так как проект — корневая сущность и не требует последовательной нумерации.

---

#### 2.12 Каскадное удаление связей (0.5 дня)

**Проблема:** При удалении задачи/ресурса остаются orphaned-связи (назначения). Если ID переиспользуется, старые связи "оживают".

**Решение:** Добавить очистку связанных сущностей при удалении.

**Файл:** `src/store/projectStore.ts`

```typescript
/**
 * Удаляет задачу и все её назначения.
 * Каскадное удаление предотвращает "оживание" связей при переиспользовании ID.
 */
deleteTask: (taskId: string) => {
  const state = get()
  
  // 1. Удаляем все назначения этой задачи
  const updatedAssignments = state.assignments.filter(
    assignment => assignment.taskId !== taskId
  )
  
  // 2. Удаляем все зависимости (predecessors/successors)
  const updatedDependencies = state.dependencies.filter(
    dep => dep.predecessorId !== taskId && dep.successorId !== taskId
  )
  
  // 3. Удаляем саму задачу
  const updatedTasks = state.tasks.filter(task => task.id !== taskId)
  
  set({
    tasks: updatedTasks,
    assignments: updatedAssignments,
    dependencies: updatedDependencies,
  })
},

/**
 * Удаляет ресурс и все его назначения.
 */
deleteResource: (resourceId: string) => {
  const state = get()
  
  // 1. Удаляем все назначения этого ресурса
  const updatedAssignments = state.assignments.filter(
    assignment => assignment.resourceId !== resourceId
  )
  
  // 2. Удаляем сам ресурс
  const updatedResources = state.resources.filter(
    resource => resource.id !== resourceId
  )
  
  set({
    resources: updatedResources,
    assignments: updatedAssignments,
  })
},
```

**Тесты для каскадного удаления:**

```typescript
describe('Каскадное удаление', () => {
  it('удаляет все назначения при удалении задачи', () => {
    const { addTask, addAssignment, deleteTask, getState } = useProjectStore.getState()
    
    addTask({ id: 'TASK-1', name: 'Task 1' })
    addAssignment({ id: 'ASSIGN-1', taskId: 'TASK-1', resourceId: 'RES-1' })
    addAssignment({ id: 'ASSIGN-2', taskId: 'TASK-1', resourceId: 'RES-2' })
    
    deleteTask('TASK-1')
    
    expect(getState().assignments).toHaveLength(0)
  })
  
  it('удаляет все назначения при удалении ресурса', () => {
    const { addResource, addAssignment, deleteResource, getState } = useProjectStore.getState()
    
    addResource({ id: 'RES-1', name: 'Resource 1' })
    addAssignment({ id: 'ASSIGN-1', taskId: 'TASK-1', resourceId: 'RES-1' })
    
    deleteResource('RES-1')
    
    expect(getState().assignments).toHaveLength(0)
  })
})
```

### ✅ Контрольные точки

- [x] `BaselineIdGenerator` создан
- [x] `AssignmentIdGenerator` создан
- [x] Все 10 файлов обновлены
- [x] Нет `Date.now().toString()` для entity ID
- [x] Каскадное удаление задач (assignments + dependencies)
- [x] Каскадное удаление ресурсов (assignments)
- [x] Тесты для каскадного удаления проходят
- [x] Общие тесты проходят

### 📋 Результаты выполнения (12.02.2026)

**Созданные файлы:**

| Файл | Формат ID | Логика |
|------|-----------|--------|
| `src/domain/baseline/services/BaselineIdGenerator.ts` | BL-001, BL-002... | max + 1 |
| `src/domain/assignment/services/AssignmentIdGenerator.ts` | ASSIGN-{taskId}-{resourceId} | детерминированный |

**Обновлённые файлы:**

| Файл | Изменение |
|------|-----------|
| `src/store/projectStore.ts` | BaselineIdGenerator для saveBaseline |
| `src/domain/resources/ResourceFactory.ts` | ResourceIdGenerator.generate() |
| `src/utils/task-utils.ts` | TaskIdGenerator.generate() |
| `src/utils/assignment-utils.ts` | AssignmentIdGenerator.generate() |
| `src/utils/resource-utils.ts` | ResourceIdGenerator.generate() |
| `src/utils/project-utils.ts` | MOCK-{timestamp36} для mock-проектов |
| `src/hooks/useTaskActions.ts` | TaskIdGenerator.generate() |
| `src/hooks/useAssignmentActions.ts` | AssignmentIdGenerator.generate() |
| `src/hooks/useResourceActions.ts` | Передача existingResources в ResourceFactory |
| `src/hooks/state/useProjectLifecycle.ts` | PROJ-{uuid8} для проектов |

**Проверка:**
- ✅ Сборка: `npm run build:frontend` — успешно
- ✅ Тесты: 128 из 128 проходят
- ✅ Размер файлов: все < 90 строк (требование ≤ 200)
- ✅ SOLID: Single Responsibility соблюдён

---

## 📦 ФАЗА 3: Миграция async/await (P1)

### 🎯 Цель
Унифицировать работу с Promise на современный async/await синтаксис.

### 📊 Проблема

В коде используется два стиля:

**Стиль 1 — async/await (хороший):**
```typescript
const loadData = async () => {
  try {
    const response = await javaApi.getProject(id)
    // ...
  } catch (error) {
    // обработка
  }
}
```

**Стиль 2 — .then/.catch (legacy):**
```typescript
syncWithJava(...).catch((err) => { ... })
import('@/store/appStore').then(({ useAppStore }) => { ... })
```

### 📁 Файлы для изменения

| Файл | .then/.catch | Сложность |
|------|--------------|-----------|
| `criticalPathAutoRecalcScheduler.ts` | 5 | Высокая |
| `ProjectManager.tsx` | 3 | Средняя |
| `MainWindowInitializer.tsx` | 2 | Низкая |
| `MainWindow.tsx` | 2 | Низкая |
| `UserPreferencesService.ts` | 1 | Низкая |
| `useHotkey.ts` | 1 | Низкая |
| `useUserPreferences.ts` | 1 | Низкая |
| `gantt.tsx` | 2 | Средняя |

### 🔧 Пример рефакторинга

**До:**
```typescript
import('@/components/userpreferences/services/UserPreferencesService')
  .then(({ UserPreferencesService }) => {
    return import('@/store/appStore').then(({ useAppStore }) => {
      return import('@/store/projectStore').then(({ useProjectStore }) => {
        // callback hell
      })
    })
  })
  .catch(() => { ... })
```

**После:**
```typescript
async function scheduleCriticalPathRecalc(): Promise<void> {
  try {
    const { UserPreferencesService } = await import(
      '@/components/userpreferences/services/UserPreferencesService'
    )
    const { useAppStore } = await import('@/store/appStore')
    const { useProjectStore } = await import('@/store/projectStore')
    // Чистый линейный код
  } catch (error) {
    console.error('[criticalPathAutoRecalcScheduler]', error)
  }
}
```

### ✅ Контрольные точки

- [x] Все 8 файлов мигрированы
- [x] Нет `.then/.catch` в бизнес-логике (кроме библиотек)
- [x] Тесты проходят

### 📋 Результаты выполнения (12.02.2026)

**Обновлённые файлы:**

| Файл | Изменения |
|------|-----------|
| `src/store/criticalPathAutoRecalcScheduler.ts` | 5 `.then()` → `async/await` |
| `src/components/projects/ProjectManager.tsx` | 3 `.then()` → `async/await` |
| `src/components/layout/MainWindowInitializer.tsx` | 2 `.then()` → `async/await` |
| `src/components/layout/MainWindow.tsx` | 2 `.then()` → `async/await` |
| `src/components/userpreferences/services/UserPreferencesService.ts` | 1 `.then()` → `async/await` |
| `src/hooks/useHotkey.ts` | 1 `.then()` → `async/await` |
| `src/components/userpreferences/hooks/useUserPreferences.ts` | 1 `.then()` → `async/await` |
| `src/lib/gantt-task-react/components/gantt/gantt.tsx` | 2 `.then()` → `async/await` |

**Всего мигрировано:** 17 использований `.then()/.catch()` → `async/await`

**Проверка:**
- ✅ Сборка: `npm run build:frontend` — успешно
- ✅ Тесты: 128 из 128 проходят

---

## 📦 ФАЗА 4: View-level Error Boundaries (P1)

### 🎯 Цель
Обеспечить graceful degradation при ошибках в отдельных Views.

### 📊 Проблема

**Текущее состояние:**
- Есть только глобальный ErrorBoundary в `App.tsx`
- Ошибка в одном View (например, GanttView) рендерит fallback для всего приложения
- Пользователь теряет доступ к другим работающим частям

**Целевое состояние:**
- Каждый View обёрнут в свой ErrorBoundary
- Ошибка в одном View не влияет на другие
- Пользователь может продолжать работать с остальным UI

### 📁 Структура файлов

```
src/
├── components/
│   ├── error-handling/
│   │   ├── ViewErrorBoundary.tsx          # [НОВЫЙ]
│   │   ├── ViewErrorFallback.tsx          # [НОВЫЙ]
│   │   └── index.ts                       # [ИЗМЕНИТЬ]
│   └── views/
│       ├── GanttView.tsx                  # [ИЗМЕНИТЬ]
│       ├── TaskSheetComponent.tsx         # [ИЗМЕНИТЬ]
│       ├── NetworkView.tsx                # [ИЗМЕНИТЬ]
│       ├── ResourceSheetComponent.tsx     # [ИЗМЕНИТЬ]
│       ├── WBSView.tsx                    # [ИЗМЕНИТЬ]
│       ├── TaskUsageView.tsx              # [ИЗМЕНИТЬ]
│       ├── ResourceUsageView.tsx          # [ИЗМЕНИТЬ]
│       ├── TrackingGanttView.tsx          # [ИЗМЕНИТЬ]
│       ├── SettingsView.tsx               # [ИЗМЕНИТЬ]
│       └── calendar/
│           └── CalendarView.tsx           # [ИЗМЕНИТЬ]
```

### 🔧 Задачи

#### 4.1 Создание ViewErrorBoundary (0.5 дня)

**Файл:** `src/components/error-handling/ViewErrorBoundary.tsx`

```typescript
import { Component, ErrorInfo, ReactNode } from 'react'
import { logger } from '@/utils/logger'

interface Props {
  children: ReactNode
  viewName: string
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error Boundary для отдельных View с graceful degradation.
 * Позволяет изолировать ошибки в конкретном представлении,
 * не ломая всё приложение.
 *
 * @example
 * <ViewErrorBoundary viewName="Диаграмма Ганта">
 *   <GanttView />
 * </ViewErrorBoundary>
 */
export class ViewErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error(`[${this.props.viewName}] View crashed:`, {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })

    this.props.onError?.(error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-600">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-200 mb-2">
            Ошибка загрузки: {this.props.viewName}
          </h2>
          <p className="text-slate-400 mb-6 text-center max-w-md">
            Произошла ошибка при отображении этого представления.
            Другие части приложения продолжают работать.
          </p>
          <button
            onClick={this.handleRetry}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-400 hover:to-emerald-500 transition-all duration-200 shadow-lg hover:shadow-emerald-500/20"
          >
            Попробовать снова
          </button>
          <details className="mt-6 text-left text-xs text-slate-500 max-w-md">
            <summary className="cursor-pointer hover:text-slate-400">
              Техническая информация
            </summary>
            <pre className="mt-2 p-3 bg-slate-800/50 rounded-lg overflow-auto border border-slate-700">
              {this.state.error?.stack}
            </pre>
          </details>
        </div>
      )
    }

    return this.props.children
  }
}
```

#### 4.2 Обёртка Views (1 день)

**Пример для GanttView.tsx:**

```typescript
import { ViewErrorBoundary } from '@/components/error-handling'

// Переименовываем существующий компонент
const GanttViewInner: React.FC<GanttViewProps> = (props) => {
  // ... существующий код без изменений
}

// Обёртка с ErrorBoundary
export const GanttView: React.FC<GanttViewProps> = (props) => (
  <ViewErrorBoundary viewName="Диаграмма Ганта">
    <GanttViewInner {...props} />
  </ViewErrorBoundary>
)
```

### ✅ Контрольные точки

- [ ] `ViewErrorBoundary` создан
- [ ] Экспорт обновлён в `index.ts`
- [ ] Все 12 Views обёрнуты
- [ ] Тестирование crash-сценариев

---

## 📦 ФАЗА 5: Консолидация useEffect (P2)

### 🎯 Цель
Уменьшить количество useEffect через консолидацию связанных эффектов.

### 📊 Проблема

**Пример из GeneralPreferences.tsx:**
```typescript
useEffect(() => { setUserName(preferences.general.userName) }, [preferences.general.userName])
useEffect(() => { setCompanyName(preferences.general.companyName) }, [preferences.general.companyName])
useEffect(() => { setDefaultView(preferences.general.defaultView) }, [preferences.general.defaultView])
useEffect(() => { setAutoSave(preferences.general.autoSave) }, [preferences.general.autoSave])
```

### 📁 Файлы для изменения

| Файл | useEffect | Рекомендация |
|------|-----------|--------------|
| `GeneralPreferences.tsx` | 4 | Консолидировать в 1 |
| `DisplayPreferences.tsx` | 2 | Консолидировать в 1 |
| `ProfessionalGantt.tsx` | 6 | Оставить (разные зависимости) |
| `GanttCanvasController.tsx` | 2 | Консолидировать |
| `NetworkDiagramCore.tsx` | 4 | Частично консолидировать |

### 🔧 Пример рефакторинга

**До:**
```typescript
useEffect(() => { setUserName(preferences.general.userName) }, [preferences.general.userName])
useEffect(() => { setCompanyName(preferences.general.companyName) }, [preferences.general.companyName])
useEffect(() => { setDefaultView(preferences.general.defaultView) }, [preferences.general.defaultView])
useEffect(() => { setAutoSave(preferences.general.autoSave) }, [preferences.general.autoSave])
```

**После:**
```typescript
useEffect(() => {
  const { userName, companyName, defaultView, autoSave } = preferences.general
  setUserName(userName)
  setCompanyName(companyName)
  setDefaultView(defaultView)
  setAutoSave(autoSave)
}, [preferences.general])
```

### ✅ Контрольные точки

- [ ] `GeneralPreferences.tsx` оптимизирован (4 → 1 useEffect)
- [ ] `DisplayPreferences.tsx` оптимизирован (2 → 1 useEffect)
- [ ] `GanttCanvasController.tsx` оптимизирован
- [ ] Тесты проходят

---

## 📦 ФАЗА 6: Array/ID Utils (P2)

### 🎯 Цель
Создать переиспользуемые утилиты для часто повторяющихся паттернов.

### 📊 Проблема

**Дублирование `.length > 0` / `.length === 0`:**
```typescript
if (tasks.length > 0) { ... }
if (tasks.length === 0) return null
```
Найдено: **~30+ использований**

**Дублирование `Date.now()` для UI-элементов:**
```typescript
id: `menu-${Date.now()}`
id: `dialog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
```
Найдено: **~15 использований**

### 📁 Структура файлов

```
src/
└── utils/
    ├── array-utils.ts    # [НОВЫЙ]
    ├── id-utils.ts       # [НОВЫЙ]
    └── index.ts          # [ИЗМЕНИТЬ]
```

### 🔧 Задачи

#### 6.1 Создание array-utils.ts (0.25 дня)

```typescript
/**
 * Утилиты для работы с массивами.
 * Устраняет дублирование проверок .length > 0 / .length === 0
 *
 * @module array-utils
 */

/**
 * Type guard: проверяет, что массив непустой.
 * Сужает тип до [T, ...T[]] (non-empty tuple).
 *
 * @example
 * if (isNotEmpty(tasks)) {
 *   // tasks[0] гарантированно существует
 *   const firstTask = tasks[0]
 * }
 */
export function isNotEmpty<T>(arr: T[]): arr is [T, ...T[]] {
  return arr.length > 0
}

/**
 * Type guard: проверяет, что массив пустой.
 * Сужает тип до [].
 */
export function isEmpty<T>(arr: T[]): arr is [] {
  return arr.length === 0
}

/**
 * Возвращает первый элемент или undefined.
 */
export function first<T>(arr: T[]): T | undefined {
  return arr[0]
}

/**
 * Возвращает последний элемент или undefined.
 */
export function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1]
}

/**
 * Группирует массив по ключу.
 */
export function groupBy<T, K extends string | number>(
  arr: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  return arr.reduce(
    (acc, item) => {
      const key = keyFn(item)
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    },
    {} as Record<K, T[]>,
  )
}

/**
 * Удаляет дубликаты по ключу.
 */
export function uniqueBy<T, K>(arr: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>()
  return arr.filter((item) => {
    const key = keyFn(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
```

#### 6.2 Создание id-utils.ts (0.25 дня)

```typescript
/**
 * Унифицированная генерация ID для UI-элементов и временных сущностей.
 *
 * ВАЖНО: НЕ использовать для domain-сущностей (tasks, resources) —
 * для них есть специализированные генераторы:
 * - TaskIdGenerator для задач
 * - ResourceIdGenerator для ресурсов
 * - AssignmentIdGenerator для назначений
 * - BaselineIdGenerator для baseline'ов
 *
 * @module id-utils
 */

/**
 * Генерирует уникальный ID с префиксом.
 * Использует crypto.randomUUID если доступен, иначе Date.now + random.
 */
export function generateUniqueId(prefix: string): string {
  const unique =
    crypto.randomUUID?.() ??
    `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  return `${prefix}-${unique}`
}

/**
 * Генерирует ID для UI-элементов (menus, dialogs, etc).
 */
export function generateElementId(elementType: string): string {
  return generateUniqueId(elementType)
}

/**
 * Генерирует ID для подписок (event subscribers).
 */
export function generateSubscriptionId(): string {
  return generateUniqueId('sub')
}

/**
 * Генерирует ID для диалогов.
 */
export function generateDialogId(): string {
  return generateUniqueId('dialog')
}

/**
 * Генерирует ID для пунктов меню.
 */
export function generateMenuId(): string {
  return generateUniqueId('menu')
}

/**
 * Генерирует ID для правил (hotkey rules, notification rules).
 */
export function generateRuleId(): string {
  return generateUniqueId('rule')
}

/**
 * Генерирует ID для маппингов (resource mapping, field mapping).
 */
export function generateMappingId(): string {
  return generateUniqueId('mapping')
}
```

#### 6.3 Миграция использования (0.5 дня)

Заменить direct `Date.now()` на утилиты в:
- `ContextMenuProvider.tsx` → `generateMenuId()`
- `NotificationSettingsDialog.tsx` → `generateRuleId()`
- `ResourceMappingDialog.tsx` → `generateMappingId()`
- `AssignmentDialog.tsx` → `AssignmentIdGenerator.generate()`
- `SettingsImportExportService.ts` → `generateUniqueId('settings')`
- `EventDispatcher.ts` → `generateSubscriptionId()`
- `TypedDialogService.ts` → `generateDialogId()`

### ✅ Контрольные точки

- [ ] `array-utils.ts` создан
- [ ] `id-utils.ts` создан
- [ ] Экспорт обновлён в `utils/index.ts`
- [ ] Все UI-ID генерации мигрированы
- [ ] Тесты проходят

---

## 📅 ОБЩИЙ ГРАФИК

```
Неделя 1:
├── День 1-2:   Фаза 1.1-1.4 (Vitest + тесты сервисов)
├── День 3:     Фаза 1.5-1.7 (тесты сервисов + store)
├── День 4:     Фаза 2 (ID генерация)
└── День 5:     Фаза 3.1-3.3 (async/await миграция)

Неделя 2:
├── День 1:     Фаза 3.4-3.6 (async/await миграция)
├── День 2:     Фаза 4.1-4.2 (View Error Boundaries)
├── День 3:     Фаза 4.3 + Фаза 5 (View wrapping + useEffect)
└── День 4-5:   Фаза 6 + Тестирование + Документация
```

---

## ✅ ФИНАЛЬНЫЙ ЧЕК-ЛИСТ

### Фаза 1: Тестовая инфраструктура
- [ ] `vitest.config.ts` создан
- [ ] `vitest.setup.ts` создан
- [ ] `CalendarMathService.test.ts`
- [ ] `TaskSchedulingService.test.ts`
- [ ] `TaskHierarchyService.test.ts`
- [ ] `DurationSyncService.test.ts`
- [ ] `EffortDrivenService.test.ts`
- [ ] `projectStore.test.ts`
- [ ] Coverage ≥ 60% для `domain/services`

### Фаза 2: ID Генерация
- [ ] `BaselineIdGenerator` создан
- [ ] `AssignmentIdGenerator` создан
- [ ] `projectStore.ts` обновлён
- [ ] `ResourceFactory.ts` обновлён
- [ ] `task-utils.ts` обновлён
- [ ] Mock-утилиты обновлены
- [ ] Хуки обновлены

### Фаза 3: async/await
- [ ] `criticalPathAutoRecalcScheduler.ts`
- [ ] `ProjectManager.tsx`
- [ ] `MainWindow*.tsx`
- [ ] `UserPreferencesService.ts`
- [ ] `useHotkey.ts`
- [ ] `gantt.tsx`

### Фаза 4: Error Boundaries
- [ ] `ViewErrorBoundary` создан
- [ ] Экспорт обновлён
- [ ] GanttView обёрнут
- [ ] TaskSheetComponent обёрнут
- [ ] NetworkView обёрнут
- [ ] ResourceSheetComponent обёрнут
- [ ] WBSView обёрнут
- [ ] TaskUsageView обёрнут
- [ ] ResourceUsageView обёрнут
- [ ] TrackingGanttView обёрнут
- [ ] SettingsView обёрнут
- [ ] CalendarView обёрнут

### Фаза 5: useEffect консолидация
- [ ] `GeneralPreferences.tsx`
- [ ] `DisplayPreferences.tsx`
- [ ] `GanttCanvasController.tsx`

### Фаза 6: Utils
- [ ] `array-utils.ts` создан
- [ ] `id-utils.ts` создан
- [ ] Экспорт в `utils/index.ts`
- [ ] Миграция UI-ID

---

## 📊 МЕТРИКИ УСПЕХА

| Метрика | До | После |
|---------|-----|-------|
| **Покрытие тестами** | ~0.13% | ≥ 60% |
| **Date.now() для ID** | 10 файлов | 0 файлов |
| **.then/.catch** | 8 файлов | 0 файлов |
| **View Error Boundaries** | 0 | 12 |
| **Дублирование useEffect** | 10+ | Минимум |
| **Переиспользуемые utils** | 0 | 2 |

---

## 🔄 СВЯЗЬ С ДРУГИМИ ROADMAP

- **ROADMAP.md** — основной план развития функциональности
- **TIMESHEET_IMPLEMENTATION_PLAN.md** — план внедрения Timesheet
- **ROADMAP_V2_TECHNICAL_IMPROVEMENTS.md** (этот документ) — технические улучшения

---

## 📝 ПРИМЕЧАНИЯ

1. **Порядок выполнения:** Фазы можно выполнять параллельно разными разработчиками, за исключением Фазы 6 (зависит от Фазы 2).

2. **Регрессионное тестирование:** После каждой фазы рекомендуется полный проход по критическим сценариям:
   - Создание/редактирование/удаление задач
   - Работа с ресурсами
   - Сохранение/загрузка проектов
   - Диаграмма Ганта

3. **Code Review:** Каждая фаза должна пройти code review перед мержем.

4. **Документация:** После завершения обновить README.md с информацией о тестировании.

---

*Документ создан: 12.02.2026*
*Последнее обновление: 12.02.2026*
