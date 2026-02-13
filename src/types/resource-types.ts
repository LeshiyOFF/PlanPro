/**
 * Типы для ресурсов ProjectLibre
 * 
 * СТАНДАРТ ФОРМАТА maxUnits (v4.0):
 * - Формат хранения: коэффициент (1.0 = 100%, 2.0 = 200%, 0.5 = 50%)
 * - Для конвертации используйте: ResourceUnitsConverter.toPercent() / toCoefficient()
 * 
 * @see ResourceUnitsConverter - централизованный конвертер
 */

export interface Resource {
  id: string
  name: string
  type: 'Work' | 'Material' | 'Cost'
  /** Максимальная загрузка в формате коэффициента: 1.0 = 100%, 2.0 = 200% */
  maxUnits: number
  standardRate: number
  overtimeRate: number
  costPerUse: number
  materialLabel?: string // Метка для материалов (кг, шт, тонн и т.д.)
  email?: string
  group?: string
  calendarId?: string
  available?: boolean
}

export interface Assignment {
  id: string
  taskId: string
  resourceId: string
  /** Процент загрузки в формате коэффициента: 1.0 = 100%, 2.0 = 200% */
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

