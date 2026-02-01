/**
 * Типы для проектов ProjectLibre.
 * Задачи и ресурсы унифицированы со стором (store Task, Catalog Resource/Assignment).
 */

import type { Task } from '@/store/project/interfaces'
import type { Resource, Assignment } from '@/types/resource-types'

export type ProjectStatus = 'Planning' | 'InProgress' | 'Completed' | 'OnHold'

export interface Project {
  id: string
  name: string
  start: Date
  finish: Date
  status: ProjectStatus
  scheduleFrom: 'ProjectStart' | 'ProjectFinish'
  priority: 'Low' | 'Normal' | 'High'
  budget?: number
  actualCost?: number
  manager?: string
  description?: string
  tasks: Task[]
  resources: Resource[]
  assignments: Assignment[]
}

export type ViewType = 'gantt' | 'network' | 'task-usage' | 'resource-usage'

export interface ViewSettings {
  type: ViewType
  timescale: 'days' | 'weeks' | 'months' | 'quarters'
  showCriticalPath: boolean
  showProgress: boolean
  showResources: boolean
  zoom: number
}

