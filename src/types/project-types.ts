/**
 * Типы для проектов ProjectLibre
 */

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
  tasks: import('./task-types').Task[]
  resources: import('./resource-types').Resource[]
  assignments: import('./resource-types').Assignment[]
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
