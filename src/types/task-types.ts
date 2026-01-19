/**
 * Типы для задач ProjectLibre
 */

export interface Task {
  id: string
  name: string
  start: Date
  finish: Date
  duration: number
  progress: number
  priority: 'Low' | 'Normal' | 'High'
  status: 'NotStarted' | 'InProgress' | 'Completed' | 'Delayed'
  parentId?: string | null
  resourceIds: string[]
  dependencies: string[]
  constraint?: 'AsSoonAsPossible' | 'AsLateAsPossible' | 'MustStartOn' | 'MustFinishOn'
  constraintDate?: Date
  notes?: string
  wbs?: string
  level: number
  position: number
  baselineStart?: Date
  baselineFinish?: Date;
  finishVariance?: number; // в миллисекундах или днях
  estimated?: boolean; // Флаг оценочного срока
  segments?: TaskSegment[];
}

export interface TaskSegment {
  start: Date;
  finish: Date;
}

export interface Dependency {
  id: string
  predecessorId: string
  successorId: string
  type: 'FinishToStart' | 'StartToStart' | 'FinishToFinish' | 'StartToFinish'
  lag: number
}

export interface TaskFilter {
  status?: Task['status'][]
  priority?: Task['priority'][]
  resourceIds?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  searchText?: string
}

export interface TableColumn<T = unknown> {
  id: keyof T
  header: string
  width: number
  sortable: boolean
  resizable: boolean
  formatter?: (value: unknown, row: T) => React.ReactNode
}

