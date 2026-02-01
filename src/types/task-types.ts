/**
 * Типы для задач ProjectLibre
 */

import type { ReactNode } from 'react';
import type { JsonValue } from '@/types/json-types';

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

/** Сегмент задачи (прерывания). Единый тип для store и Gantt. */
export interface TaskSegment {
  startDate: Date;
  endDate: Date;
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

/** Дефолтный тип строки таблицы (вместо unknown) */
export type DefaultTableRow = Record<string, JsonValue>;

export interface TableColumn<T = DefaultTableRow> {
  id: keyof T
  header: string
  width: number
  sortable: boolean
  resizable: boolean
  formatter?: (value: JsonValue, row: T) => ReactNode
}

