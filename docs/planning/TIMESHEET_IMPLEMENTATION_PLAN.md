# План реализации: Timesheet & Actual Work Tracking (Вариант 2 — MS Project Standard)

**Статус:** 📋 В разработке  
**Приоритет:** P1 - HIGH (Enterprise Feature)  
**Дата создания:** 11.02.2026  
**Последнее обновление:** 11.02.2026  
**Автор:** Architecture Team  
**Версия:** 1.1.0 (дополнено календарной спецификой)

---

## 📋 EXECUTIVE SUMMARY

**Цель:** Внедрить полноценную систему учёта фактического рабочего времени сотрудников (timesheet) уровня MS Project для профессионального трекинга трудозатрат, бюджета и прогнозирования завершения проектов.

**Проблема:** В PlanPro отсутствует критически важная функциональность для Enterprise-сегмента:
- ❌ Нет ввода фактических часов работы (`actualWork`) — невозможно отследить реальные трудозатраты.
- ❌ Нет оценки оставшихся работ (`remainingWork`) — неточные прогнозы завершения.
- ❌ Процент выполнения (`progress`) — недостаточная метрика для трудоёмких задач.
- ❌ Нет workflow табелей (ввод → утверждение → применение).
- ❌ Невозможен расчёт фактической стоимости проекта (`actualCost`).

**Решение:** Внедрение timesheet-системы по стандарту MS Project с соблюдением Clean Architecture, SOLID, TypeScript strict mode и интеграцией с существующим Java-бэкендом.

**Ожидаемый результат:**
- ✅ Сотрудники вводят фактические часы ежедневно через специализированный TimesheetView.
- ✅ Менеджеры утверждают табели еженедельно.
- ✅ Автоматический пересчёт `progress`, `remainingWork`, `actualCost` после применения табелей.
- ✅ План vs Факт визуализация в TrackingGanttView с метриками отклонения по часам.
- ✅ Интеграция с существующими TaskUsageView, ResourceUsageView для детального анализа.

**Целевая аудитория:**
- Малые и средние команды (5-100 человек)
- Проекты с бюджетным контролем
- Организации с требованиями трекинга трудозатрат

---

## ⚠️ КРИТИЧНОЕ ОТЛИЧИЕ ОТ MS PROJECT: КАЛЕНДАРНАЯ СИСТЕМА

**PlanPro использует ресурс-специфичные календари вместо глобального проектного календаря.**

### MS Project (классический подход):
- Один календарь проекта (обычно 5/2) для всех задач и ресурсов
- Задачи на выходные (Сб, Вс) создать нельзя
- Все ресурсы работают по единому графику

### PlanPro (уникальная архитектура):
- ✅ Каждому **ресурсу** назначается индивидуальный календарь (2/2, 3/1, 5/2, 6/1 и т.д.)
- ✅ Задачи создаются на любые дни, но планирование учитывает календарь ресурса
- ✅ Гибкость для команд с посменными графиками

### Последствия для реализации Timesheet:

| Аспект | MS Project | PlanPro (наша реализация) |
|--------|------------|---------------------------|
| **Валидация рабочих дней** | Проверка по проектному календарю (фиксированная 5/2) | ✅ Проверка по `CalendarService.isWorkingDay(date, resource.calendar)` |
| **Подсветка нерабочих дней в UI** | Сб, Вс всегда серые | ✅ Динамическая: зависит от графика ресурса (2/2 → Ср, Чт серые) |
| **Лимит часов в день** | Фиксированный (8ч) | ✅ Из `calendar.hoursPerDay` (может быть 12ч для 2/2) |
| **Backend валидация** | Проверка по `projectCalendar.isWorkingDay()` | ✅ Проверка по `resourceCalendar.isWorkingDay()` + `hoursPerDay` |
| **Сообщения об ошибках** | "Суббота — выходной день" | ✅ "03.02.2026 — нерабочий день для ресурса Иванов И.И. (график: 2/2)" |

**Важно:** Все компоненты (`TimesheetValidationService`, `TimesheetGrid`, `TimesheetController`) должны **динамически учитывать календарь ресурса**, а не полагаться на универсальную логику.

---

## 🎯 БИЗНЕС-ТРЕБОВАНИЯ

### Функциональные требования

| ID | Требование | Приоритет | Описание |
|----|-----------|-----------|----------|
| **FR-1** | Ввод фактических часов | P0 | Сотрудники вводят часы по задачам в сетке TimesheetView (дни недели × задачи) |
| **FR-2** | Оценка оставшихся работ | P0 | При вводе фактических часов сотрудник обновляет remaining work |
| **FR-3** | Workflow табелей | P0 | Статусы: Draft → Submitted → Approved → Applied |
| **FR-4** | Автоматический пересчёт | P0 | `progress = actualWork / (actualWork + remainingWork)` |
| **FR-5** | Детализация по дням | P1 | Сетка ввода с колонками Пн, Вт, Ср, Чт, Пт, Сб, Вс |
| **FR-6** | Валидация ввода | P1 | Часы ≥ 0, сумма не превышает maxUnits ресурса |
| **FR-7** | Фактическая стоимость | P1 | `actualCost = actualWork × resource.stdRate` |
| **FR-8** | План vs Факт | P1 | Визуализация отклонения в TrackingGanttView |
| **FR-9** | Экспорт табелей | P2 | CSV/PDF экспорт для отчётности |
| **FR-10** | Напоминания | P2 | Уведомления о незаполненных табелях |

### Нефункциональные требования

| ID | Требование | Метрика | Описание |
|----|-----------|---------|----------|
| **NFR-1** | Производительность | < 500ms | Время отклика при вводе часа в ячейку сетки |
| **NFR-2** | Масштабируемость | 1000+ задач | Поддержка больших проектов без деградации UI |
| **NFR-3** | Типобезопасность | 100% | Strict TypeScript, нулевая толерантность к `any` |
| **NFR-4** | Clean Architecture | SOLID | Разделение domain / application / services / UI |
| **NFR-5** | Тестируемость | 80%+ | Unit-тесты для domain services и use cases |
| **NFR-6** | Интернационализация | ru/en | Полная локализация всех UI-текстов |

---

## 🏗️ АРХИТЕКТУРНОЕ РЕШЕНИЕ

### Принципы проектирования

1. **Clean Architecture** — слоистая структура с изоляцией зависимостей:
   ```
   UI (React Components)
   ↓
   Application (Use Cases)
   ↓
   Domain (Business Logic)
   ↓
   Infrastructure (API Clients, Services)
   ```

2. **SOLID** — каждый сервис отвечает за одну задачу:
   - `TimesheetService` — CRUD табелей.
   - `TimesheetValidationService` — валидация ввода.
   - `TimesheetWorkflowService` — управление статусами.
   - `ActualWorkCalculationService` — пересчёт метрик.

3. **Domain-Driven Design** — богатые доменные модели:
   - `Timesheet` entity с методами `submit()`, `approve()`, `reject()`.
   - `TimesheetEntry` value object с валидацией часов.

4. **Immutability** — иммутабельные данные в store (Zustand):
   ```typescript
   set((state) => ({
     timesheets: [...state.timesheets, newTimesheet]
   }))
   ```

### Архитектура данных

```
┌─────────────────────────────────────────────────────────┐
│                 FRONTEND (React)                    │
│  ┌───────────────────────────────────────────────┐  │
│  │          TimesheetView (UI)                │  │
│  │  - TimesheetGrid (сетка ввода)            │  │
│  │  - TimesheetStatusBar (статус табеля)    │  │
│  │  - TimesheetActions (submit/approve)      │  │
│  └───────────────────────────────────────────────┘  │
│                        ↓                           │
│  ┌───────────────────────────────────────────────┐  │
│  │      Use Cases (Application Layer)         │  │
│  │  - SubmitTimesheetUseCase                  │  │
│  │  - ApproveTimesheetUseCase                 │  │
│  │  - LogTimeEntryUseCase                     │  │
│  └───────────────────────────────────────────────┘  │
│                        ↓                           │
│  ┌───────────────────────────────────────────────┐  │
│  │      Domain Services                       │  │
│  │  - TimesheetService                        │  │
│  │  - TimesheetValidationService              │  │
│  │  - ActualWorkCalculationService            │  │
│  └───────────────────────────────────────────────┘  │
│                        ↓                           │
│  ┌───────────────────────────────────────────────┐  │
│  │      Store (Zustand)                       │  │
│  │  - timesheetStore (табели, entries)       │  │
│  │  - projectStore (actualWork, remainingWork)│  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↓ IPC
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Java + Spring Boot)           │
│  ┌───────────────────────────────────────────────┐  │
│  │   TimesheetController (REST API)           │  │
│  │   - POST /api/v1/timesheets/entries       │  │
│  │   - PUT  /api/v1/timesheets/{id}/submit   │  │
│  │   - PUT  /api/v1/timesheets/{id}/approve  │  │
│  └───────────────────────────────────────────────┘  │
│                        ↓                           │
│  ┌───────────────────────────────────────────────┐  │
│  │   TimesheetService (Business Logic)        │  │
│  │   - applyActualsToProject()                │  │
│  │   - recalculateProgress()                  │  │
│  └───────────────────────────────────────────────┘  │
│                        ↓                           │
│  ┌───────────────────────────────────────────────┐  │
│  │   ProjectLibre Core (Java)                 │  │
│  │   - Assignment.setActualWork()             │  │
│  │   - Task.recalculate()                     │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Модель данных

#### 1. Timesheet (Таблица)

```typescript
interface Timesheet {
  id: string;                    // UUID
  userId: string;                // Сотрудник (owner)
  resourceId: string;            // КРИТИЧНО: ID ресурса для доступа к календарю
  projectId: string;             // Проект
  weekStartDate: Date;           // Начало недели
  weekEndDate: Date;             // Окончание недели
  status: TimesheetStatus;       // Draft | Submitted | Approved | Rejected
  entries: TimesheetEntry[];     // Записи по дням/задачам
  totalHours: number;            // Итого часов за неделю
  workingDaysCount: number;      // Количество рабочих дней в неделе (по календарю ресурса)
  calendarId: string;            // ID календаря ресурса (для валидации и подсветки)
  createdAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;           // User ID менеджера
  comments?: string;             // Комментарии при reject
}

enum TimesheetStatus {
  DRAFT = 'draft',               // Черновик
  SUBMITTED = 'submitted',       // Отправлен на утверждение
  APPROVED = 'approved',         // Утверждён
  REJECTED = 'rejected',         // Отклонён
  APPLIED = 'applied'            // Применён к проекту
}
```

**ВАЖНО:** Timesheet привязан к ресурсу (не только к userId), чтобы учитывать индивидуальный календарь работы (2/2, 3/1, 5/2, 6/1 и т.д.).

#### 2. TimesheetEntry (Запись)

```typescript
interface TimesheetEntry {
  id: string;                    // UUID
  timesheetId: string;           // FK к Timesheet
  taskId: string;                // Задача
  assignmentId: string;          // Назначение (Task × Resource)
  resourceId: string;            // Ресурс (для быстрого доступа к календарю)
  date: Date;                    // День работы
  actualHours: number;           // Фактические часы (≥ 0, ≤ maxHoursPerDay из календаря)
  remainingHours?: number;       // Оставшиеся часы (обновляется в конце дня)
  billable: boolean;             // Оплачиваемые часы?
  overtimeHours: number;         // Сверхурочные часы (часы сверх hoursPerDay календаря)
  isWorkingDay: boolean;         // Флаг: рабочий день по календарю ресурса (кэш для быстрой валидации)
  notes?: string;                // Комментарий к записи
  createdAt: Date;
  modifiedAt: Date;
}
```

**КРИТИЧНО:** Поле `isWorkingDay` вычисляется при создании entry через `CalendarService.isWorkingDay(date, resource.calendar)`. Это предотвращает ввод часов в нерабочие дни.

#### 3. Assignment (Назначение) — расширение

```typescript
// Расширение существующего interface Assignment в store/project/interfaces.ts
interface Assignment {
  // ... существующие поля
  
  // НОВЫЕ ПОЛЯ ДЛЯ TIMESHEET:
  actualWork: number;            // Фактические часы (сумма из TimesheetEntry)
  remainingWork: number;         // Оставшиеся часы
  workComplete: number;          // % выполнения (actualWork / totalWork)
  actualCost: number;            // Фактическая стоимость (actualWork × rate)
  actualStart?: Date;            // Фактическая дата начала
  actualFinish?: Date;           // Фактическая дата окончания
}
```

#### 4. Task (Задача) — расширение

```typescript
// Расширение существующего interface Task в store/project/interfaces.ts
interface Task {
  // ... существующие поля
  
  // НОВЫЕ ПОЛЯ ДЛЯ TIMESHEET:
  actualWork: number;            // Сумма actualWork всех assignments
  remainingWork: number;         // Сумма remainingWork всех assignments
  actualCost: number;            // Сумма actualCost всех assignments
  actualStart?: Date;            // Фактическая дата начала (min из assignments)
  actualFinish?: Date;           // Фактическая дата окончания (max из assignments)
  workVariance: number;          // Отклонение: actualWork - baselineWork
}
```

---

## 📦 ФАЗЫ РЕАЛИЗАЦИИ

### Фаза 0: Подготовка и проектирование (2 дня)

**Цель:** Валидация архитектуры, создание ADR, согласование с командой.

**Задачи:**

- [ ] **0.1. Создать ADR-002: Timesheet Architecture**
  - Файл: `docs/architecture/ADR-002-timesheet-architecture.md`
  - Описание архитектурного решения с диаграммами
  - Обоснование выбора подходов и технологий
  - Альтернативы и trade-offs

- [ ] **0.2. Spike: Исследование Java ProjectLibre Core API**
  - Файл: `docs/spikes/timesheet/core-api-research.md`
  - Изучить существующие методы работы с `Assignment.actualWork` в Java
  - Определить, какие изменения нужны в Core (если нужны)
  - Проверить, поддерживает ли `com.projectlibre.pm.task.Task` actual dates
  - **🆕 КРИТИЧНО:** Валидировать доступ к Calendar API:
    - Проверить `com.projectlibre.pm.calendar.WorkCalendar.isWorkingDay(Date date)`
    - Убедиться, что у Resource есть метод `.getCalendar()` или `.getWorkingCalendar()`
    - Проверить, есть ли `WorkCalendar.getHoursPerDay()` или аналогичный метод
    - Протестировать логику для нестандартных графиков (2/2, 3/1, 6/1)
    - Документировать ограничения/баги (если есть)

- [ ] **0.3. Создать OpenAPI спецификацию для Timesheet API**
  - Файл: `docs/api/timesheet-api-spec.yaml`
  - Endpoints: POST /entries, PUT /submit, PUT /approve, GET /timesheets
  - Request/Response схемы
  - Error codes и status codes

- [ ] **0.4. Обновить Master_Functionality_Catalog.ts**
  - Добавить интерфейсы `Timesheet`, `TimesheetEntry`, `TimesheetStatus`
  - Расширить `Assignment` и `Task` с полями actualWork, remainingWork
  - Добавить типы для API contracts

**Критерии приёмки:**
- ✅ ADR-002 утверждён командой
- ✅ OpenAPI спецификация прошла code review
- ✅ Spike подтвердил техническую возможность интеграции с Java Core

---

### Фаза 1: Domain Layer (3 дня)

**Цель:** Реализовать доменную логику без UI — бизнес-правила, валидацию, расчёты.

**Задачи:**

- [ ] **1.1. Создать доменные сущности**
  - Файл: `src/domain/timesheet/entities/Timesheet.ts`
    ```typescript
    export class Timesheet {
      constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly projectId: string,
        // ... остальные поля
      ) {}

      submit(): Timesheet {
        if (this.status !== TimesheetStatus.DRAFT) {
          throw new TimesheetError('Cannot submit non-draft timesheet')
        }
        return new Timesheet({ ...this, status: TimesheetStatus.SUBMITTED, submittedAt: new Date() })
      }

      approve(approverId: string): Timesheet {
        if (this.status !== TimesheetStatus.SUBMITTED) {
          throw new TimesheetError('Can only approve submitted timesheets')
        }
        return new Timesheet({ ...this, status: TimesheetStatus.APPROVED, approvedAt: new Date(), approvedBy: approverId })
      }

      reject(reason: string): Timesheet {
        // ... логика отклонения
      }
    }
    ```
  - Файл: `src/domain/timesheet/entities/TimesheetEntry.ts`
    ```typescript
    export class TimesheetEntry {
      constructor(
        public readonly id: string,
        public readonly timesheetId: string,
        public readonly taskId: string,
        public readonly assignmentId: string,
        public readonly date: Date,
        public readonly actualHours: number,
        public readonly remainingHours: number | undefined,
        // ...
      ) {
        this.validate()
      }

      private validate(): void {
        if (this.actualHours < 0) throw new ValidationError('actualHours must be >= 0')
        if (this.actualHours > 24) throw new ValidationError('actualHours must be <= 24')
        if (this.remainingHours !== undefined && this.remainingHours < 0) {
          throw new ValidationError('remainingHours must be >= 0')
        }
      }
    }
    ```

- [ ] **1.2. Создать TimesheetValidationService (Calendar-Aware)**
  - Файл: `src/domain/timesheet/services/TimesheetValidationService.ts`
  - **КРИТИЧНО:** Валидация с учётом календаря ресурса (не универсальная 5/2)
  - Методы:
    - `validateEntry(entry: TimesheetEntry, resource: Resource, calendar: IWorkCalendar): ValidationResult`
    - `validateWeekTotal(entries: TimesheetEntry[], maxHours: number): ValidationResult`
    - `validateResourceCapacity(entries: TimesheetEntry[], resource: Resource): ValidationResult`
    - `isWorkingDayForResource(date: Date, resource: Resource, calendars: IWorkCalendar[]): boolean`
  - Правила:
    - **НОВОЕ:** Проверка рабочего дня через `CalendarService.isWorkingDay(date, calendar)`
    - **НОВОЕ:** Лимит часов из `calendar.hoursPerDay` (не фиксированные 8ч)
    - Если `entry.actualHours > 0` и день нерабочий → ошибка валидации
    - Сумма часов в день ≤ `calendar.hoursPerDay` для рабочих дней
    - Часы на задачу не превышают `resource.maxUnits`
    - Нельзя вводить часы на завершённые задачи (опционально)
  - Пример реализации:
    ```typescript
    validateEntry(
      entry: TimesheetEntry, 
      resource: Resource, 
      calendar: IWorkCalendar
    ): ValidationResult {
      // 1. Базовая валидация
      if (entry.actualHours < 0) {
        return { isValid: false, errors: ['Часы не могут быть отрицательными'] }
      }

      // 2. КАЛЕНДАРНАЯ ВАЛИДАЦИЯ (ключевое отличие от MS Project)
      const isWorking = CalendarService.isWorkingDay(entry.date, calendar)
      if (!isWorking && entry.actualHours > 0) {
        return { 
          isValid: false, 
          errors: [
            `${entry.date.toLocaleDateString()} — нерабочий день по календарю "${calendar.name}" (график: ${this.getScheduleType(calendar)})`
          ] 
        }
      }

      // 3. Проверка лимита часов (из календаря ресурса)
      const maxHours = calendar.hoursPerDay || 8
      if (entry.actualHours > maxHours) {
        return { 
          isValid: false, 
          errors: [`Превышен лимит часов в день (${maxHours}ч) для графика ${this.getScheduleType(calendar)}`] 
        }
      }

      return { isValid: true }
    }

    private getScheduleType(calendar: IWorkCalendar): string {
      // Определение типа графика: 5/2, 2/2, 3/1, 6/1 и т.д.
      const workingDays = calendar.workingDays?.filter(d => d).length || 5
      const totalDays = 7
      return `${workingDays}/${totalDays - workingDays}`
    }
    ```

- [ ] **1.3. Создать ActualWorkCalculationService**
  - Файл: `src/domain/timesheet/services/ActualWorkCalculationService.ts`
  - Методы:
    - `calculateProgress(actualWork: number, remainingWork: number): number`
    - `calculateActualCost(actualWork: number, stdRate: number): number`
    - `calculateWorkVariance(actualWork: number, baselineWork: number): number`
    - `aggregateAssignmentActuals(entries: TimesheetEntry[]): { actualWork: number; remainingWork: number }`

- [ ] **1.4. Создать TimesheetWorkflowService**
  - Файл: `src/domain/timesheet/services/TimesheetWorkflowService.ts`
  - Методы:
    - `canSubmit(timesheet: Timesheet): boolean`
    - `canApprove(timesheet: Timesheet, approverId: string): boolean`
    - `canReject(timesheet: Timesheet, approverId: string): boolean`
    - `applyTimesheetToProject(timesheet: Timesheet): ProjectUpdate[]`

- [ ] **1.5. Юнит-тесты для domain services**
  - Файлы: `src/domain/timesheet/services/*.test.ts`
  - Покрытие: 80%+
  - Тест-кейсы:
    - Валидация некорректных часов (< 0, > 24)
    - Расчёт прогресса при разных соотношениях actual/remaining
    - Workflow переходов (draft → submitted → approved)
    - Edge cases (нулевые часы, отсутствие remainingWork)

**Критерии приёмки:**
- ✅ Все доменные сущности реализованы с immutability
- ✅ Валидация покрывает все бизнес-правила
- ✅ Юнит-тесты проходят, покрытие 80%+
- ✅ Нет использования `any`, strict TypeScript mode

---

### Фаза 2: Application Layer (2 дня)

**Цель:** Реализовать use cases — сценарии взаимодействия пользователя с системой.

**Задачи:**

- [ ] **2.1. Создать LogTimeEntryUseCase**
  - Файл: `src/application/timesheet/usecases/LogTimeEntryUseCase.ts`
  ```typescript
  export class LogTimeEntryUseCase {
    constructor(
      private readonly timesheetService: TimesheetService,
      private readonly validationService: TimesheetValidationService,
      private readonly projectStore: ProjectStore
    ) {}

    async execute(request: LogTimeEntryRequest): Promise<Result<TimesheetEntry>> {
      // 1. Валидация входных данных
      const validation = this.validationService.validateEntry(request)
      if (!validation.isValid) return Result.fail(validation.errors)

      // 2. Проверка существования задачи и назначения
      const task = this.projectStore.tasks.find(t => t.id === request.taskId)
      if (!task) return Result.fail('Task not found')

      // 3. Создание entry
      const entry = new TimesheetEntry({ ...request, id: generateId() })

      // 4. Добавление в табель
      await this.timesheetService.addEntry(entry)

      return Result.ok(entry)
    }
  }
  ```

- [ ] **2.2. Создать SubmitTimesheetUseCase**
  - Файл: `src/application/timesheet/usecases/SubmitTimesheetUseCase.ts`
  - Логика:
    - Валидация: все обязательные дни заполнены
    - Проверка: нет незавершённых задач с нулевыми часами
    - Изменение статуса: Draft → Submitted

- [ ] **2.3. Создать ApproveTimesheetUseCase**
  - Файл: `src/application/timesheet/usecases/ApproveTimesheetUseCase.ts`
  - Логика:
    - Проверка прав: только менеджер проекта
    - Применение actuals к Assignment и Task
    - Синхронизация с Java Core
    - Пересчёт progress и actualCost
    - Изменение статуса: Submitted → Approved → Applied

- [ ] **2.4. Создать RejectTimesheetUseCase**
  - Файл: `src/application/timesheet/usecases/RejectTimesheetUseCase.ts`
  - Логика:
    - Указание причины отклонения (обязательное поле)
    - Возврат статуса: Submitted → Draft
    - Уведомление сотрудника (опционально)

- [ ] **2.5. Создать GetUserTimesheetsUseCase**
  - Файл: `src/application/timesheet/usecases/GetUserTimesheetsUseCase.ts`
  - Логика:
    - Получение списка табелей сотрудника
    - Фильтрация по статусу, диапазону дат
    - Пагинация (если нужна)

**Критерии приёмки:**
- ✅ Все use cases реализованы по паттерну Command/Query
- ✅ Use cases не зависят от UI и Infrastructure
- ✅ Обработка ошибок через Result<T> (монада)
- ✅ Юнит-тесты для каждого use case

---

### Фаза 3: Infrastructure Layer (3 дня)

**Цель:** Реализовать интеграцию с Java Backend, API клиенты, персистентность.

**Задачи:**

- [ ] **3.1. Создать TimesheetAPIClient**
  - Файл: `src/services/TimesheetAPIClient.ts`
  ```typescript
  export class TimesheetAPIClient extends BaseAPIClient {
    async logTimeEntry(entry: TimesheetEntryDTO): Promise<Result<TimesheetEntryDTO>> {
      return this.post<TimesheetEntryDTO>('/api/v1/timesheets/entries', entry)
    }

    async submitTimesheet(timesheetId: string): Promise<Result<TimesheetDTO>> {
      return this.put<TimesheetDTO>(`/api/v1/timesheets/${timesheetId}/submit`)
    }

    async approveTimesheet(timesheetId: string, approverId: string): Promise<Result<TimesheetDTO>> {
      return this.put<TimesheetDTO>(`/api/v1/timesheets/${timesheetId}/approve`, { approverId })
    }

    async getTimesheets(userId: string, filters?: TimesheetFilters): Promise<Result<TimesheetDTO[]>> {
      return this.get<TimesheetDTO[]>('/api/v1/timesheets', { params: { userId, ...filters } })
    }
  }
  ```

- [ ] **3.2. Реализовать Java Backend — TimesheetController (Calendar-Aware)**
  - Файл: `projectlibre-api/src/main/java/com/projectlibre/api/timesheet/TimesheetController.java`
  - **КРИТИЧНО:** Валидация с учётом календаря ресурса на уровне бэкенда
  ```java
  @RestController
  @RequestMapping("/api/v1/timesheets")
  public class TimesheetController {
      private final TimesheetService timesheetService;
      private final CalendarService calendarService; // НОВОЕ: сервис работы с календарями

      @PostMapping("/entries")
      public ResponseEntity<?> logTimeEntry(@RequestBody TimesheetEntryDTO entry) {
          // КАЛЕНДАРНАЯ ВАЛИДАЦИЯ (ключевое дополнение)
          Resource resource = resourceService.getResourceById(entry.getResourceId());
          WorkCalendar calendar = calendarService.getCalendarForResource(resource);
          
          // 1. Проверка рабочего дня
          if (!calendar.isWorkingDay(entry.getDate())) {
              return ResponseEntity
                  .status(HttpStatus.BAD_REQUEST)
                  .body(new ErrorResponse(
                      "NON_WORKING_DAY",
                      String.format(
                          "Дата %s является нерабочим днём для ресурса %s (график: %s)",
                          entry.getDate(),
                          resource.getName(),
                          getScheduleType(calendar)
                      )
                  ));
          }
          
          // 2. Проверка лимита часов
          double maxHours = calendar.getHoursPerDay();
          if (entry.getActualHours() > maxHours) {
              return ResponseEntity
                  .status(HttpStatus.BAD_REQUEST)
                  .body(new ErrorResponse(
                      "HOURS_LIMIT_EXCEEDED",
                      String.format(
                          "Превышен лимит часов (%.1fч > %.1fч) для графика %s",
                          entry.getActualHours(),
                          maxHours,
                          getScheduleType(calendar)
                      )
                  ));
          }
          
          // 3. Сохранение в памяти/БД
          return ResponseEntity.ok(timesheetService.addEntry(entry));
      }

      @PutMapping("/{id}/approve")
      public ResponseEntity<TimesheetDTO> approveTimesheet(@PathVariable String id, @RequestBody ApproveRequest req) {
          // Применение actuals к ProjectLibre Core
          TimesheetDTO approved = timesheetService.approveAndApply(id, req.getApproverId());
          return ResponseEntity.ok(approved);
      }
      
      // НОВОЕ: Вспомогательный метод для определения типа графика
      private String getScheduleType(WorkCalendar calendar) {
          int workingDays = calendar.getWorkingDaysPerWeek();
          return String.format("%d/%d", workingDays, 7 - workingDays);
      }
  }
  ```

- [ ] **3.3. Реализовать Java Backend — TimesheetService**
  - Файл: `projectlibre-api/src/main/java/com/projectlibre/api/timesheet/TimesheetService.java`
  - Методы:
    - `addEntry(TimesheetEntryDTO entry)` — сохранить entry в памяти
    - `approveAndApply(String timesheetId, String approverId)` — применить actuals к Core
  - Интеграция с Core:
    ```java
    LocalSession session = SessionFactory.getInstance().getLocalSession();
    Project project = session.getCurrentProject();
    Task task = project.getTaskById(entry.getTaskId());
    Assignment assignment = task.getAssignment(entry.getResourceId());
    
    // Установка actualWork
    assignment.setActualWork(Duration.getInstance(entry.getActualHours(), TimeUnit.HOURS));
    assignment.setRemainingWork(Duration.getInstance(entry.getRemainingHours(), TimeUnit.HOURS));
    
    // Пересчёт прогресса и стоимости
    task.recalculate();
    ```

- [ ] **3.4. Создать TimesheetDataConverter**
  - Файл: `src/services/TimesheetDataConverter.ts`
  - Методы:
    - `toDomain(dto: TimesheetDTO): Timesheet`
    - `toDTO(timesheet: Timesheet): TimesheetDTO`
    - `mapEntryToAssignment(entry: TimesheetEntry): Partial<Assignment>`

- [ ] **3.5. Создать TimesheetStore (Zustand)**
  - Файл: `src/store/timesheetStore.ts`
  ```typescript
  interface TimesheetStore {
    timesheets: Timesheet[];
    currentTimesheetId: string | null;
    isDirty: boolean;

    addEntry: (entry: TimesheetEntry) => void;
    updateEntry: (entryId: string, updates: Partial<TimesheetEntry>) => void;
    deleteEntry: (entryId: string) => void;
    submitTimesheet: (timesheetId: string) => Promise<void>;
    loadTimesheets: (userId: string) => Promise<void>;
  }

  export const useTimesheetStore = create<TimesheetStore>((set, get) => ({
    timesheets: [],
    currentTimesheetId: null,
    isDirty: false,

    addEntry: (entry) => set((state) => {
      const timesheet = state.timesheets.find(t => t.id === entry.timesheetId)
      if (!timesheet) return state
      
      return {
        timesheets: state.timesheets.map(t =>
          t.id === entry.timesheetId
            ? { ...t, entries: [...t.entries, entry], totalHours: t.totalHours + entry.actualHours }
            : t
        ),
        isDirty: true
      }
    }),

    // ... остальные методы
  }))
  ```

**Критерии приёмки:**
- ✅ Java Backend поднимается без ошибок, endpoints доступны
- ✅ TimesheetAPIClient успешно отправляет/получает данные
- ✅ Интеграция с ProjectLibre Core проверена на тестовом проекте
- ✅ TimesheetStore синхронизирован с API

---

### Фаза 4: UI Layer — TimesheetView (5 дней)

**Цель:** Создать главное представление для ввода табелей с сеткой дней недели.

**Задачи:**

- [ ] **4.1. Создать TimesheetView (основной компонент)**
  - Файл: `src/components/views/TimesheetView.tsx`
  - Структура:
    ```
    <TimesheetView>
      ├── <TwoTierHeader> (заголовок + actions)
      ├── <TimesheetToolbar> (навигация по неделям, статус)
      ├── <TimesheetGrid> (сетка ввода)
      ├── <TimesheetStatusBar> (итого часов, валидация)
      └── <TimesheetSubmitDialog> (диалог подтверждения отправки)
    </TimesheetView>
    ```

- [ ] **4.2. Создать TimesheetGrid (сетка ввода, CALENDAR-AWARE)**
  - Файл: `src/components/timesheet/TimesheetGrid.tsx`
  - **КРИТИЧНО:** Динамическая подсветка рабочих/нерабочих дней по календарю ресурса
  - Дизайн (пример для ресурса с графиком 2/2):
    ```
    ┌─────────────┬────┬────┬────┬────┬────┬────┬────┬───────┐
    │ Задача      │ Пн │ Вт │ Ср │ Чт │ Пт │ Сб │ Вс │ Итого │
    ├─────────────┼────┼────┼────┼────┼────┼────┼────┼───────┤
    │ TASK1       │ 12 │ 12 │ 🚫 │ 🚫 │ 12 │ 12 │ 🚫 │ 48    │ ← график 2/2
    │ TASK2       │ 0  │ 2  │ 🚫 │ 🚫 │ 4  │ 0  │ 🚫 │ 6     │
    ├─────────────┼────┼────┼────┼────┼────┼────┼────┼───────┤
    │ ИТОГО       │ 12 │ 14 │ 🚫 │ 🚫 │ 16 │ 12 │ 🚫 │ 54    │
    └─────────────┴────┴────┴────┴────┴────┴────┴────┴───────┘
    🚫 = Нерабочий день (серый фон, disabled)
    ```
  - **Логика отображения календаря:**
    ```typescript
    const TimesheetGrid: React.FC<Props> = ({ timesheet, resource, calendar }) => {
      const weekDays = getWeekDays(timesheet.weekStartDate)

      const getCellStyle = (date: Date, actualHours: number): CellStyle => {
        // 1. КАЛЕНДАРНАЯ ПРОВЕРКА (ключевое отличие)
        const isWorking = CalendarService.isWorkingDay(date, calendar)
        if (!isWorking) {
          return { 
            bg: 'bg-slate-200',          // Серый фон
            disabled: true,               // Заблокировано
            tooltip: `Нерабочий день (график: ${getScheduleType(calendar)})`
          }
        }

        // 2. Проверка лимита часов (из календаря ресурса)
        const maxHours = calendar.hoursPerDay || 8
        if (actualHours > maxHours && actualHours <= maxHours * 1.5) {
          return { bg: 'bg-yellow-100', tooltip: `Превышение нормы (>${maxHours}ч)` }
        }
        if (actualHours > maxHours * 1.5) {
          return { bg: 'bg-red-100', tooltip: `Критичная перегрузка (>${maxHours * 1.5}ч)` }
        }

        return { bg: 'bg-white' }
      }

      return (
        <table>
          <thead>
            <tr>
              {weekDays.map(date => {
                const isWorking = CalendarService.isWorkingDay(date, calendar)
                return (
                  <th 
                    key={date.toString()}
                    className={!isWorking ? 'text-slate-400 italic' : ''}
                    title={!isWorking ? 'Нерабочий день' : ''}
                  >
                    {formatDate(date)}
                    {!isWorking && ' 🚫'}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                {weekDays.map(date => {
                  const entry = getEntry(task.id, date)
                  const style = getCellStyle(date, entry.actualHours)
                  return (
                    <td 
                      key={date.toString()}
                      className={style.bg}
                      title={style.tooltip}
                    >
                      <input 
                        type="number"
                        value={entry.actualHours}
                        disabled={style.disabled}  // Нерабочие дни заблокированы
                        onChange={(e) => updateEntry(date, parseFloat(e.target.value))}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )
    }

    function getScheduleType(calendar: IWorkCalendar): string {
      const workingDays = calendar.workingDays?.filter(d => d).length || 5
      return `${workingDays}/${7 - workingDays}` // Например: "2/2", "5/2", "6/1"
    }
    ```
  - Features:
    - **НОВОЕ:** Динамическая проверка `CalendarService.isWorkingDay(date, calendar)` для каждой ячейки
    - **НОВОЕ:** Подсветка нерабочих дней (серый фон, disabled, иконка 🚫)
    - **НОВОЕ:** Лимит часов берётся из `calendar.hoursPerDay`, а не фиксированные 8ч
    - **НОВОЕ:** Tooltip показывает график работы (2/2, 3/1, 6/1 и т.д.)
    - Ввод часов в ячейку → валидация → debounce 300ms → сохранение в store
    - Подсветка перегрузки (> hoursPerDay) — жёлтый фон
    - Подсветка критичной перегрузки (> hoursPerDay × 1.5) — красный фон
    - Итого по строке (задаче) и по столбцу (дню)

- [ ] **4.3. Создать TimesheetToolbar**
  - Файл: `src/components/timesheet/TimesheetToolbar.tsx`
  - Элементы:
    - Навигация: «← Предыдущая неделя» / «Следующая неделя →»
    - Выбор недели через DatePicker
    - Статус текущего табеля (Draft / Submitted / Approved)
    - Кнопка «Отправить на утверждение» (Submit)
    - Кнопка «Сохранить черновик» (Save Draft)

- [ ] **4.4. Создать TimesheetStatusBar**
  - Файл: `src/components/timesheet/TimesheetStatusBar.tsx`
  - Метрики:
    - Итого часов за неделю: `40 ч`
    - Осталось до нормы: `0 ч` (если норма 40ч/неделю)
    - Ошибки валидации: «❌ Понедельник: превышен лимит (12ч > 10ч)»
    - Предупреждения: «⚠️ Среда: не заполнены часы на TASK3»

- [ ] **4.5. Создать TimesheetSubmitDialog**
  - Файл: `src/components/timesheet/TimesheetSubmitDialog.tsx`
  - Логика:
    - Показать сводку: итого часов, задачи, статус
    - Валидация перед отправкой (все дни заполнены?)
    - Кнопки: «Отправить» / «Отмена»
    - После Submit → уведомление менеджеру (опционально)

- [ ] **4.6. Интеграция TimesheetView в Navigation**
  - Файл: `src/components/navigation/NavigationRouter.tsx`
  - Добавить роут: `/timesheet` → `TimesheetViewComponent`
  - Файл: `src/components/navigation/SidebarNavigation.tsx`
  - Добавить пункт меню: «Табель времени» (иконка Clock)

- [ ] **4.7. Стилизация TimesheetGrid (профессиональный UI)**
  - Градиенты для ячеек (emerald для заполненных, slate для пустых)
  - Плавные transitions при hover/focus
  - Скругления: `rounded-2xl` для карточек, `rounded-xl` для ячеек
  - Тени: `shadow-lg` для floating элементов
  - Иконки: Lucide React (Clock, Check, X, AlertTriangle)

**Критерии приёмки:**
- ✅ TimesheetView отображается, сетка заполняется корректно
- ✅ Валидация работает в реальном времени (debounce 300ms)
- ✅ Submit workflow функционирует (Draft → Submitted)
- ✅ UI соответствует дизайн-стандартам PlanPro (gradients, shadows, emerald accent)
- ✅ Адаптив: работает на разрешениях 1366×768+

---

### Фаза 5: Интеграция с существующими представлениями (3 дня)

**Цель:** Связать timesheet с TaskUsageView, ResourceUsageView, TrackingGanttView.

**Задачи:**

- [ ] **5.1. Расширить TaskUsageView — показ actual/remaining**
  - Файл: `src/components/sheets/table/TaskUsageSheet.tsx`
  - Добавить колонки:
    - `actualWork` — фактические часы (из timesheets)
    - `remainingWork` — оставшиеся часы
    - `workComplete` — % выполнения (actualWork / totalWork)
  - Стилизация: зелёный цвет для actualWork, серый для remainingWork

- [ ] **5.2. Расширить ResourceUsageView — фактическая загрузка**
  - Файл: `src/components/views/ResourceUsageView.tsx`
  - Добавить колонки:
    - `actualHours` — фактические часы за неделю
    - `plannedHours` — плановые часы
    - `variance` — отклонение (actual - planned)
  - Подсветка: красный для превышения плана

- [ ] **5.3. Расширить TrackingGanttView — Plan vs Actual по часам**
  - Файл: `src/components/views/TrackingGanttView.tsx`
  - Добавить панель метрик:
    - «Плановые часы: 160ч»
    - «Фактические часы: 145ч»
    - «Отклонение: -15ч (9%)»
  - Визуализация: полоса задачи показывает % actual work (зелёная заливка)

- [ ] **5.4. Интеграция с GanttTooltip**
  - Файл: `src/lib/gantt-task-react/components/other/tooltip.tsx`
  - При hover на задачу показывать:
    ```
    Задача: TASK1
    Плановые часы: 40ч
    Фактические часы: 34ч
    Оставшиеся часы: 10ч
    % выполнения: 77%
    ```

- [ ] **5.5. Создать TimesheetStatsCard**
  - Файл: `src/components/timesheet/TimesheetStatsCard.tsx`
  - Метрики для TimesheetView:
    - Итого за неделю: `40ч`
    - Среднее в день: `8ч`
    - Недель в месяце: `4`
    - Итого за месяц: `160ч`

**Критерии приёмки:**
- ✅ TaskUsageView показывает actualWork и remainingWork корректно
- ✅ ResourceUsageView отображает фактическую загрузку
- ✅ TrackingGanttView показывает отклонение план vs факт по часам
- ✅ Tooltip на Gantt включает timesheet метрики

---

### Фаза 6: Approval Workflow (менеджер) (2 дня)

**Цель:** Реализовать интерфейс утверждения табелей для менеджера проекта.

**Задачи:**

- [ ] **6.1. Создать TimesheetApprovalView**
  - Файл: `src/components/views/TimesheetApprovalView.tsx`
  - Список табелей на утверждение (статус: Submitted)
  - Фильтры: по сотруднику, по неделе
  - Таблица:
    ```
    ┌──────────────┬────────────┬────────────┬──────────┬────────┐
    │ Сотрудник    │ Неделя     │ Итого часов│ Статус   │ Действия│
    ├──────────────┼────────────┼────────────┼──────────┼────────┤
    │ Иван Иванов  │ 03-09.02   │ 40ч        │ Submitted│ 👁️ ✅ ❌ │
    │ Мария Петрова│ 03-09.02   │ 38ч        │ Submitted│ 👁️ ✅ ❌ │
    └──────────────┴────────────┴────────────┴──────────┴────────┘
    ```
  - Кнопки: «Просмотр» / «Утвердить» / «Отклонить»

- [ ] **6.2. Создать TimesheetReviewDialog**
  - Файл: `src/components/timesheet/TimesheetReviewDialog.tsx`
  - Детальный просмотр табеля перед утверждением
  - Сетка с часами (только чтение)
  - Комментарии сотрудника (если есть)
  - Кнопки: «Утвердить» / «Отклонить с комментарием»

- [ ] **6.3. Создать TimesheetRejectDialog**
  - Файл: `src/components/timesheet/TimesheetRejectDialog.tsx`
  - Обязательное поле: причина отклонения
  - После reject → табель возвращается в Draft
  - Отправка уведомления сотруднику (опционально)

- [ ] **6.4. Интеграция ApprovalView в Navigation**
  - Только для менеджеров (role-based access)
  - Пункт меню: «Утверждение табелей» (иконка CheckSquare)

**Критерии приёмки:**
- ✅ Менеджер видит список submitted табелей
- ✅ Approve workflow функционирует: Submitted → Approved → Applied
- ✅ Reject workflow функционирует: Submitted → Draft (с комментарием)
- ✅ После approve actuals применяются к проекту

---

### Фаза 7: Локализация и Help Content (1 день)

**Цель:** Добавить переводы и справочный контент для timesheet.

**Задачи:**

- [ ] **7.1. Добавить ключи локализации (включая календарные)**
  - Файлы: `src/locales/ru.json`, `src/locales/en.json`
  - Секция `timesheet`:
    ```json
    {
      "timesheet": {
        "title": "Табель времени",
        "week": "Неделя",
        "total_hours": "Итого часов",
        "actual_work": "Фактические часы",
        "remaining_work": "Оставшиеся часы",
        "submit": "Отправить на утверждение",
        "approve": "Утвердить",
        "reject": "Отклонить",
        "status_draft": "Черновик",
        "status_submitted": "Отправлен",
        "status_approved": "Утверждён",
        "validation_max_hours": "Превышен лимит часов в день",
        "validation_negative": "Часы не могут быть отрицательными",
        "validation_non_working_day": "{{date}} — нерабочий день для ресурса {{resourceName}} (график: {{scheduleType}})",
        "validation_hours_exceeded": "Превышен лимит часов ({{actual}}ч > {{max}}ч) для графика {{scheduleType}}",
        "cell_tooltip_non_working": "Нерабочий день (график: {{scheduleType}})",
        "cell_tooltip_overload": "Превышение нормы (>{{max}}ч)",
        "cell_tooltip_critical_overload": "Критичная перегрузка (>{{max}}ч)",
        "schedule_type_5_2": "5/2 (пятидневка)",
        "schedule_type_2_2": "2/2 (два через два)",
        "schedule_type_3_1": "3/1 (три через один)",
        "schedule_type_6_1": "6/1 (шесть через один)",
        "schedule_type_custom": "Индивидуальный график",
        "help_calendar_note": "Рабочие и нерабочие дни определяются календарём, назначенным ресурсу. Ввод часов в нерабочие дни заблокирован."
      }
    }
    ```

- [ ] **7.2. Создать TimesheetHelpSection**
  - Файл: `src/data/help-sections/timesheetHelpSection.tsx`
  - Блоки:
    - **Как заполнить табель** — пошаговая инструкция
    - **Workflow утверждения** — схема: Draft → Submitted → Approved
    - **Валидация** — правила ввода часов
    - **FAQ** — частые вопросы

- [ ] **7.3. Интеграция help в TimesheetView**
  - Иконка «?» в TwoTierHeader → открывает справку

**Критерии приёмки:**
- ✅ Все UI-тексты переведены на русский и английский
- ✅ Help content отображается корректно
- ✅ Переключение языка работает без перезагрузки

---

### Фаза 8: Тестирование и оптимизация (3 дня)

**Цель:** Всесторонне протестировать функционал, исправить баги, оптимизировать производительность.

**Задачи:**

- [ ] **8.1. Unit-тесты для всех слоёв (включая календарные сценарии)**
  - Domain services: 80%+ покрытие
  - Use cases: 70%+ покрытие
  - UI components: snapshot tests
  - **🆕 Календарные тест-кейсы (критично):**
    - ✅ `TimesheetValidationService.validateEntry()` для ресурса с графиком 2/2
    - ✅ Попытка ввода часов в нерабочий день (должна быть ошибка)
    - ✅ Подсветка нерабочих дней в TimesheetGrid для графиков 5/2, 2/2, 3/1, 6/1
    - ✅ Проверка лимита часов из `calendar.hoursPerDay` (не фиксированные 8ч)
    - ✅ Сценарий: ресурс меняет календарь (5/2 → 2/2) → пересчёт рабочих дней

- [ ] **8.2. Integration tests (включая календарные)**
  - Тест: Ввод часов → Submit → Approve → Проверка actualWork в projectStore
  - Тест: Reject → Проверка возврата в Draft
  - Тест: Валидация перегрузки ресурса
  - **🆕 Календарные интеграционные тесты:**
    - ✅ E2E: Ресурс с графиком 2/2 пытается ввести часы в нерабочий день → HTTP 400
    - ✅ E2E: TimesheetGrid правильно отображает нерабочие дни для 3/1 графика
    - ✅ E2E: Backend отклоняет timesheet с часами в нерабочий день при Submit

- [ ] **8.3. E2E тесты (опционально)**
  - Playwright/Cypress тест: полный workflow от ввода до утверждения

- [ ] **8.4. Оптимизация производительности**
  - Профилирование: React Profiler для TimesheetGrid
  - Мемоизация: `useMemo` для расчёта итогов
  - Virtualization: если > 50 задач в сетке → react-window

- [ ] **8.5. Тестирование на реальных данных**
  - Проект с 100 задачами, 10 ресурсов, 4 недели табелей
  - Проверка: время отклика < 500ms при вводе часа
  - Проверка: нет memory leaks при переключении недель

- [ ] **8.6. Аудит TypeScript**
  - Нулевая толерантность к `any`
  - Все типы явно объявлены
  - ESLint warnings = 0

**Критерии приёмки:**
- ✅ Все юнит-тесты проходят
- ✅ Integration tests покрывают критические сценарии
- ✅ Производительность: < 500ms для всех операций
- ✅ ESLint + TypeScript проверки без ошибок

---

### Фаза 9: Документация и Release (2 дня)

**Цель:** Подготовить документацию для разработчиков и пользователей, выпустить релиз.

**Задачи:**

- [ ] **9.1. Обновить ADR-002**
  - Добавить раздел «Реализация» с описанием финальной архитектуры
  - Добавить известные ограничения (limitations)

- [ ] **9.2. Создать User Guide (с разъяснением календарей)**
  - Файл: `docs/user-guide/timesheet-guide.md`
  - Разделы:
    - Как заполнить табель
    - **🆕 Как работают календари ресурсов** (объяснение 2/2, 3/1, 6/1 графиков)
    - **🆕 Почему некоторые дни заблокированы** (нерабочие дни по графику)
    - Как отправить на утверждение
    - Что делать при отклонении
    - FAQ:
      - "Почему я не могу ввести часы в понедельник?" → "Ваш график работы: 2/2. Понедельник — нерабочий день."
      - "Почему у коллеги другие рабочие дни?" → "Каждому ресурсу назначается индивидуальный календарь."

- [ ] **9.3. Создать Developer Guide**
  - Файл: `docs/developer-guide/timesheet-architecture.md`
  - Разделы:
    - Архитектура слоёв
    - Диаграммы компонентов
    - API contracts
    - Как добавить новое правило валидации

- [ ] **9.4. Обновить CHANGELOG.md**
  - Секция: `## [2.0.0] - Timesheet & Actual Work Tracking`
  - Список добавленных features

- [ ] **9.5. Создать Release Notes**
  - Файл: `docs/release-notes/v2.0.0-timesheet.md`
  - Highlights:
    - ✅ Полноценная система табелей (как MS Project)
    - ✅ Workflow утверждения
    - ✅ План vs Факт по часам
    - ✅ Интеграция с Java Core

- [ ] **9.6. Провести внутреннюю демонстрацию**
  - Презентация для команды: показать все features
  - Сбор feedback
  - Приоритизация доработок (если нужно)

**Критерии приёмки:**
- ✅ Документация полная и актуальная
- ✅ Release notes одобрены
- ✅ Демонстрация проведена, feedback собран

---

## 🚨 РИСКИ И МИТИГАЦИЯ

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| **Java Core API не поддерживает actualWork** | Средняя | Высокое | Spike в Фазе 0; если API недостаточен — реализовать недостающие методы в Core |
| **Производительность при > 100 задач** | Средняя | Среднее | Virtualization (react-window), мемоизация, debounce для ввода |
| **Сложность интеграции с Java** | Высокая | Высокое | Выделить 2 дня на Spike; создать fallback: хранить actuals только в Frontend store (без синхронизации с Core) |
| **UX сложность сетки ввода** | Низкая | Среднее | User testing на прототипе; итеративные улучшения на основе feedback |
| **Недостаточная валидация** | Низкая | Среднее | Comprehensive unit-тесты для TimesheetValidationService |
| **Утечки памяти в store** | Низкая | Высокое | React Profiler, memory snapshots в Chrome DevTools |
| **🆕 КАЛЕНДАРНАЯ СЛОЖНОСТЬ: Ресурс-специфичные графики (2/2, 3/1, 6/1)** | **Высокая** | **Критичное** | **1)** Spike в Фазе 0: проверить доступ к `CalendarService.isWorkingDay()` в Core API<br>**2)** Unit-тесты для всех календарных сценариев (5/2, 2/2, 3/1, 6/1, нерегулярные)<br>**3)** UI: динамическая подсветка нерабочих дней на основе календаря ресурса<br>**4)** Backend: жёсткая валидация на сервере (HTTP 400 при вводе часов в нерабочий день)<br>**5)** Fallback: если Calendar API недоступен — блокировать ввод в Сб/Вс по умолчанию + предупреждение менеджеру |
| **🆕 Несоответствие календаря ресурса и задачи** | Средняя | Высокое | Если задача назначена на нерабочий день ресурса — показывать предупреждение в Gantt Tooltip: «⚠️ Задача запланирована на нерабочий день ресурса X (график: 2/2)». Добавить проверку в TimesheetValidationService. |

---

## 📊 ОЦЕНКА СЛОЖНОСТИ

### По фазам

| Фаза | Описание | Дни | Файлов | Строк кода |
|------|----------|-----|--------|------------|
| 0 | Подготовка и проектирование | 2 | 3 | ~500 |
| 1 | Domain Layer | 3 | 8 | ~800 |
| 2 | Application Layer | 2 | 5 | ~400 |
| 3 | Infrastructure Layer | 3 | 6 + Java | ~600 + 400 (Java) |
| 4 | UI Layer — TimesheetView | 5 | 10 | ~1200 |
| 5 | Интеграция с представлениями | 3 | 5 | ~400 |
| 6 | Approval Workflow | 2 | 4 | ~300 |
| 7 | Локализация и Help | 1 | 3 | ~200 |
| 8 | Тестирование и оптимизация | 3 | 10 (tests) | ~600 |
| 9 | Документация и Release | 2 | 5 (docs) | ~1000 (docs) |
| **ИТОГО** | | **26 дней** | **59 файлов** | **~6400 строк** |

### По командам

- **Frontend Team** (React/TS): 18 дней (Фазы 1, 2, 4, 5, 6, 7)
- **Backend Team** (Java/Spring): 6 дней (Фаза 3)
- **QA Team**: 3 дня (Фаза 8)
- **Tech Writer**: 2 дня (Фаза 9)

**Параллелизация:**  
Фазы 1-2 (Frontend) и Фаза 3 (Backend) могут выполняться параллельно после завершения Фазы 0.

**Реальная оценка с буфером:** 35-40 дней (1.5-2 месяца)

---

## ✅ КРИТЕРИИ ЗАВЕРШЕНИЯ

### Must Have (блокеры релиза)

- [x] **Все фазы 0-9 выполнены**
- [x] **TimesheetView функционирует:** ввод часов, submit, approve
- [x] **Интеграция с Java Core:** actuals применяются к Assignment
- [x] **Валидация:** все бизнес-правила работают
- [x] **Workflow:** Draft → Submitted → Approved → Applied
- [x] **Тесты:** юнит-тесты 80%+, integration tests для критических сценариев
- [x] **TypeScript:** нулевая толерантность к `any`
- [x] **Документация:** ADR, User Guide, Developer Guide
- [x] **🆕 КАЛЕНДАРИ (критично для PlanPro):**
  - ✅ `CalendarService.isWorkingDay()` корректно работает для всех графиков (5/2, 2/2, 3/1, 6/1)
  - ✅ TimesheetGrid динамически подсвечивает нерабочие дни по календарю ресурса
  - ✅ Backend валидирует рабочие дни через `resourceCalendar`, а не универсальную логику
  - ✅ Сообщения об ошибках включают график работы ("график: 2/2")
  - ✅ Лимит часов берётся из `calendar.hoursPerDay`, а не фиксированные 8ч
  - ✅ Все календарные тест-кейсы проходят (см. Фаза 8)

### Should Have (желательно)

- [ ] **E2E тесты:** Playwright для полного workflow
- [ ] **Мобильная адаптация:** responsive для планшетов
- [ ] **Экспорт табелей:** CSV/PDF
- [ ] **Уведомления:** напоминания о незаполненных табелях

### Nice to Have (опционально)

- [ ] **Мобильное приложение:** React Native для ввода часов
- [ ] **Аналитика:** дашборд с метриками по табелям
- [ ] **Интеграция с календарём:** автозаполнение часов на основе встреч
- [ ] **Batch approval:** утверждение нескольких табелей одной кнопкой

---

## 🔄 ЗАВИСИМОСТИ

### Внешние зависимости

- **Java ProjectLibre Core:** требуются методы `Assignment.setActualWork()`, `Task.recalculate()`
- **🆕 Java ProjectLibre Core — Calendar API (КРИТИЧНО):**
  - `WorkCalendar.isWorkingDay(Date date)` — проверка рабочего дня
  - `Resource.getCalendar()` или `.getWorkingCalendar()` — получение календаря ресурса
  - `WorkCalendar.getHoursPerDay()` — лимит часов для календаря
  - `WorkCalendar.getWorkingDaysPerWeek()` — количество рабочих дней
- **Spring Boot:** уже есть в проекте, нужно добавить TimesheetController
- **Zustand:** store management — уже используется

### Внутренние зависимости

- **После Фазы 3:** можно начинать Фазу 4 (UI зависит от API)
- **После Фазы 4:** можно начинать Фазу 5 (интеграция с другими views)
- **После Фазы 5:** можно начинать Фазу 6 (approval workflow зависит от TimesheetView)

### Блокеры

- **BLOCKER:** Если Java Core API не поддерживает actualWork, нужно:
  1. Либо реализовать в Core (2-3 дня)
  2. Либо хранить actuals только в Frontend (fallback, не рекомендуется)
- **🆕 BLOCKER:** Если Calendar API (`isWorkingDay`, `getCalendar`, `getHoursPerDay`) недоступен или работает некорректно:
  1. Spike в Фазе 0 для валидации API (обязательно!)
  2. Если API неполный — реализовать недостающие методы в Core (1-2 дня)
  3. Fallback: блокировать только Сб/Вс + показать предупреждение "Календарная система недоступна" (не рекомендуется)

---

## 📝 NEXT STEPS

1. **Утверждение плана:** Команда review этого документа, одобрение ключевых стейкхолдеров.
2. **Начало Фазы 0:** Создание ADR-002, spike по Java Core API, OpenAPI спецификация.
3. **Распределение задач:** Назначение ответственных по фазам (Frontend Lead, Backend Lead, QA Lead).
4. **Setup инфраструктуры:** Создание веток в Git (`feature/timesheet-*`), настройка CI/CD.
5. **Kickoff meeting:** Презентация плана команде, Q&A, уточнение деталей.

---

## 📚 REFERENCES

- [MS Project Timesheet Documentation](https://support.microsoft.com/en-us/office/enter-hours-on-your-timesheet-in-project-online-a44e4d20-a5f0-4f36-94c0-d0abeca8366f)
- [Primavera P6 Timesheet Guide](https://docs.oracle.com/cd/E80480_01/English/user_guides/timesheets_user_guide/166651.htm)
- [ADR-001: ProjectLibre Architecture](./docs/architecture/ADR-001-architecture-decisions.md)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Последнее обновление:** 11.02.2026  
**Версия:** 1.1.0 (дополнено календарной спецификой)  
**Статус:** 📋 Awaiting Approval

---

## 📝 CHANGELOG

### Версия 1.1.0 (11.02.2026)
- ✅ **КРИТИЧНО:** Добавлена полная поддержка ресурс-специфичных календарей (2/2, 3/1, 6/1)
- ✅ Обновлены модели данных: `Timesheet.resourceId`, `Timesheet.calendarId`, `TimesheetEntry.isWorkingDay`
- ✅ Расширена валидация: `TimesheetValidationService` с календарной проверкой
- ✅ Обновлён UI: `TimesheetGrid` с динамической подсветкой нерабочих дней
- ✅ Обновлён Backend: `TimesheetController` с календарной валидацией на сервере
- ✅ Добавлены календарные риски и митигации
- ✅ Добавлены календарные тест-кейсы (Фаза 8)
- ✅ Обновлена локализация: ключи для календарных сообщений
- ✅ Добавлена секция "КРИТИЧНОЕ ОТЛИЧИЕ ОТ MS PROJECT"

### Версия 1.0.0 (11.02.2026)
- Первоначальный план реализации Timesheet
