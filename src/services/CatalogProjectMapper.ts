/**
 * Маппер project-types (UI/store) ↔ Catalog (Master_Functionality_Catalog) на границе API.
 * Используется в хуках при вызове ProjectAPIClient и др.
 */

import type { ID, Project as CatalogProject } from '@/types/Master_Functionality_Catalog'
import { ProjectPriority, ProjectStatus } from '@/types/Master_Functionality_Catalog'
import type { Project as UiProject } from '@/types/project-types'
import type { JsonValue } from '@/types/json-types'

/** Преобразует строковый id в Catalog ID для вызова API. */
export function stringToCatalogId(id: string | number): ID {
  const value = typeof id === 'string' ? parseInt(id, 10) || 0 : id
  return { value, type: 'project' }
}

/** Преобразует ID Catalog в строку (для сравнений в UI). */
export function catalogIdToString(id: ID): string {
  if (typeof id === 'object' && id !== null && 'value' in id) {
    return String((id as { value: number }).value)
  }
  return String(id)
}

const priorityToCatalog: Record<UiProject['priority'], ProjectPriority> = {
  Low: ProjectPriority.LOW,
  Normal: ProjectPriority.MEDIUM,
  High: ProjectPriority.HIGH,
}

const statusToCatalog: Record<UiProject['status'], ProjectStatus> = {
  Planning: ProjectStatus.PLANNING,
  InProgress: ProjectStatus.IN_PROGRESS,
  Completed: ProjectStatus.COMPLETED,
  OnHold: ProjectStatus.ON_HOLD,
}

const statusToUi: Record<ProjectStatus, UiProject['status']> = {
  [ProjectStatus.PLANNING]: 'Planning',
  [ProjectStatus.IN_PROGRESS]: 'InProgress',
  [ProjectStatus.COMPLETED]: 'Completed',
  [ProjectStatus.ON_HOLD]: 'OnHold',
  [ProjectStatus.CANCELLED]: 'OnHold',
}

const priorityToUi: Record<ProjectPriority, UiProject['priority']> = {
  [ProjectPriority.LOWEST]: 'Low',
  [ProjectPriority.LOW]: 'Low',
  [ProjectPriority.MEDIUM]: 'Normal',
  [ProjectPriority.HIGH]: 'High',
  [ProjectPriority.HIGHEST]: 'High',
}

/** Вход маппера: UI-поля start/finish или Catalog-поля startDate/finishDate (Фаза 3 контракт). */
type UiProjectPartialInput = Partial<UiProject> & { startDate?: Date; finishDate?: Date }

const ONE_DAY_MS = 24 * 60 * 60 * 1000

function resolveStartDate(p: UiProjectPartialInput): Date | undefined {
  const start = p.start ?? p.startDate
  return start instanceof Date ? start : undefined
}

function resolveFinishDate(p: UiProjectPartialInput, startDate: Date | undefined): Date | undefined {
  const finish = p.finish ?? p.finishDate
  if (finish instanceof Date) return finish
  if (startDate) return new Date(startDate.getTime() + ONE_DAY_MS)
  return undefined
}

/**
 * Преобразует частичный проект UI в частичный Catalog.Project для API.
 * Принимает start/finish и startDate/finishDate; при только start/startDate подставляет finishDate = startDate + 1 день.
 */
export function uiProjectPartialToCatalog(p: UiProjectPartialInput): Partial<CatalogProject> {
  const out: Partial<CatalogProject> = {}
  const startDate = resolveStartDate(p)
  const finishDate = resolveFinishDate(p, startDate)

  if (p.id !== undefined) out.id = stringToCatalogId(p.id)
  if (p.name !== undefined) out.name = p.name.trim()
  if (startDate !== undefined) out.startDate = startDate
  if (finishDate !== undefined) out.finishDate = finishDate
  if (p.status !== undefined) out.status = statusToCatalog[p.status] as CatalogProject['status']
  if (p.priority !== undefined) out.priority = priorityToCatalog[p.priority]
  if (p.description !== undefined) out.description = p.description
  const outExt = out as Partial<CatalogProject> & Record<string, JsonValue>
  if (p.manager !== undefined) outExt.manager = p.manager
  if (p.budget !== undefined) outExt.budget = p.budget
  if (p.actualCost !== undefined) outExt.actualCost = p.actualCost
  return out
}

/**
 * Преобразует проект из Catalog (ответ API) в UI-проект для стора.
 * Минимальная версия: только метаданные и пустые списки (для createProject).
 */
export function mapCatalogProjectToUi(catalog: CatalogProject): UiProject {
  return {
    id: catalogIdToString(catalog.id),
    name: catalog.name,
    start: catalog.startDate,
    finish: catalog.finishDate ?? catalog.startDate,
    status: statusToUi[catalog.status],
    scheduleFrom: 'ProjectStart',
    priority: priorityToUi[catalog.priority] ?? 'Normal',
    description: catalog.description,
    tasks: [],
    resources: [],
    assignments: [],
  }
}
