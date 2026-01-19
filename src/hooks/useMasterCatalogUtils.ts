import { useCallback, useMemo } from 'react'

// Master Functionality Catalog типы
import { TaskStatus, ResourceType } from '@/types'
import type {
  Task,
  Resource,
  Assignment,
  Dependency,
  DateUtils,
  DurationUtils,
  Filter,
  SortDefinition,
  TimeScale,
  Duration
} from '@/types'

/**
 * React хук для утилит Master Functionality Catalog
 * Следует SOLID принципам (Single Responsibility)
 */
export const useMasterCatalogUtils = () => {
  /**
   * Утилиты для работы с датами
   */
  const dateUtils: DateUtils = useMemo(() => ({
    formatDate: (date: Date, format = 'YYYY-MM-DD'): string => {
      return date.toISOString().split('T')[0]
    },
    
    parseDate: (dateString: string): Date => {
      return new Date(dateString)
    },
    
    addDuration: (date: Date, duration): Date => {
      const result = new Date(date)
      switch (duration.unit) {
        case 'days':
          result.setDate(result.getDate() + duration.value)
          break
        case 'hours':
          result.setHours(result.getHours() + duration.value)
          break
        case 'minutes':
          result.setMinutes(result.getMinutes() + duration.value)
          break
        default:
          result.setMilliseconds(result.getMilliseconds() + duration.value)
      }
      return result
    }
  }), [])

  /**
   * Утилиты для работы с длительностями
   */
  const durationUtils: DurationUtils = useMemo(() => ({
    formatDuration: (duration): string => {
      switch (duration.unit) {
        case 'days':
          return `${duration.value} дн.`
        case 'hours':
          return `${duration.value} ч.`
        case 'minutes':
          return `${duration.value} мин.`
        default:
          return `${duration.value} ${duration.unit}`
      }
    },
    
    parseDuration: (durationString: string) => {
      const match = durationString.match(/(\d+)\s*(дн|ч|мин|days|hours|minutes)/i)
      if (!match) return { value: 0, unit: 'hours' as const }
      
      const value = parseInt(match[1])
      const unitStr = match[2].toLowerCase()
      
      let unit: Duration['unit'] = 'hours'
      if (unitStr.includes('дн') || unitStr.includes('day')) unit = 'days'
      else if (unitStr.includes('ч') || unitStr.includes('hour')) unit = 'hours'
      else if (unitStr.includes('мин') || unitStr.includes('minute')) unit = 'minutes'
      
      return { value, unit }
    }
  }), [])

  /**
   * Фильтрация задач по статусу
   */
  const filterTasksByStatus = useCallback((
    tasks: Task[],
    status: TaskStatus
  ): Task[] => {
    return tasks.filter(task => task.status === status)
  }, [])

  /**
   * Фильтрация ресурсов по типу
   */
  const filterResourcesByType = useCallback((
    resources: Resource[],
    type: ResourceType
  ): Resource[] => {
    return resources.filter(resource => resource.type === type)
  }, [])

  /**
   * Получение зависимых задач
   */
  const getTaskDependencies = useCallback((
    tasks: Task[],
    taskId: number
  ): Task[] => {
    const task = tasks.find(t => t.id.value === taskId)
    if (!task || !task.predecessors) return []

    return task.predecessors
      .map(dep => tasks.find(t => t.id.value === dep.predecessor.id.value))
      .filter(Boolean) as Task[]
  }, [])

  /**
   * Проверка критического пути
   */
  const isCriticalPathTask = useCallback((task: Task): boolean => {
    return task.isCritical || (
      task.completion.value === 100 && 
      task.predecessors.some(pred => {
        const predTask = pred.predecessor
        return predTask.completion.value < 100
      })
    )
  }, [])

  return useMemo(() => ({
    // Утилиты
    dateUtils,
    durationUtils,
    
    // Фильтрация
    filterTasksByStatus,
    filterResourcesByType,
    
    // Работа с задачами
    getTaskDependencies,
    isCriticalPathTask
  }), [
    dateUtils,
    durationUtils,
    filterTasksByStatus,
    filterResourcesByType,
    getTaskDependencies,
    isCriticalPathTask
  ])
}
