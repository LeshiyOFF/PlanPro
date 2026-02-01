/**
 * Маппер данных диалога проекта в модель проекта (project-types).
 * Single Responsibility: преобразование ProjectDialogData → Partial<Project> для API.
 */

import type { Project, ProjectStatus } from '@/types/project-types'
import type { ProjectDialogData } from '@/types/calendar-types'

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

/** Маппинг числового статуса диалога в ProjectStatus. */
export const PROJECT_STATUS_MAP: Record<number, ProjectStatus> = {
  0: 'Planning',
  1: 'InProgress',
  2: 'Completed',
  3: 'OnHold',
}

/**
 * Преобразует данные формы диалога в частичный проект для createProject/updateProject.
 * finish вычисляется как startDate + 1 год при отсутствии поля в форме.
 */
export function mapDialogDataToProject(dialogData: ProjectDialogData): Partial<Project> {
  const start = dialogData.startDate instanceof Date
    ? dialogData.startDate
    : new Date(dialogData.startDate)
  const finish = new Date(start.getTime() + ONE_YEAR_MS)

  const status: ProjectStatus =
    PROJECT_STATUS_MAP[dialogData.projectStatus] ?? 'Planning'

  return {
    name: dialogData.name.trim(),
    start,
    finish,
    status,
    scheduleFrom: 'ProjectStart',
    priority: 'Normal',
    manager: dialogData.manager?.trim(),
    description: dialogData.notes?.trim() ?? '',
    tasks: [],
    resources: [],
    assignments: [],
  }
}
