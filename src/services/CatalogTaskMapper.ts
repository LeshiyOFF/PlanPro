/**
 * Маппер task-types (UI/store) ↔ Catalog (Master_Functionality_Catalog) на границе API.
 * Используется в useTaskAPI при вызове TaskAPIClient.
 */

import type { ID, Task as CatalogTask } from '@/types/Master_Functionality_Catalog'
import { ProjectPriority } from '@/types/Master_Functionality_Catalog'
import type { Task as UiTask } from '@/types/task-types'
import type { JsonValue } from '@/types/json-types'

/** Преобразует строковый id в Catalog ID для задачи. */
export function stringToCatalogTaskId(id: string | number): ID {
  const value = typeof id === 'string' ? parseInt(id, 10) || 0 : id
  return { value, type: 'task' }
}

const priorityToCatalog: Record<UiTask['priority'], ProjectPriority> = {
  Low: ProjectPriority.LOW,
  Normal: ProjectPriority.MEDIUM,
  High: ProjectPriority.HIGH,
}

/**
 * Преобразует частичную задачу UI (task-types) в частичный Catalog.Task для API.
 */
export function uiTaskPartialToCatalog(p: Partial<UiTask>): Partial<CatalogTask> {
  const out: Partial<CatalogTask> = {}
  if (p.id !== undefined) out.id = stringToCatalogTaskId(p.id)
  if (p.name !== undefined) out.name = p.name
  if (p.priority !== undefined) out.priority = priorityToCatalog[p.priority]
  const outExt = out as Partial<CatalogTask> & Record<string, JsonValue>
  if (p.notes !== undefined) outExt.notes = p.notes
  if (p.progress !== undefined) outExt.completion = { value: p.progress * 100 }
  if (p.duration !== undefined) outExt.duration = { value: p.duration, unit: 'milliseconds' as const }
  return out
}
