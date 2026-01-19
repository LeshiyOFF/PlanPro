/**
 * Типы для ресурсов ProjectLibre
 */

export interface Resource {
  id: string
  name: string
  type: 'Work' | 'Material' | 'Cost'
  maxUnits: number
  standardRate: number
  overtimeRate: number
  costPerUse: number
  email?: string
  group?: string
  calendarId?: string
  available?: boolean
}

export interface Assignment {
  id: string
  taskId: string
  resourceId: string
  units: number
  work: number
  cost: number
  start: Date
  finish: Date
}

export interface ResourceFilter {
  type?: Resource['type'][]
  group?: string
  searchText?: string
}

