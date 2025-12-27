import type { ReactNode } from 'react'
import type { Project, Task, Resource, Assignment } from './index'

/**
 * Типы для контекстов приложения
 */

// Конкретные типы для actions вместо Record<string, (...args: unknown[]) => unknown>
export interface ProjectActions {
  createNewProject: (name: string) => Promise<Project | null>
  loadProject: (filePath: string) => Promise<Project | null>
  saveProject: (filePath?: string) => Promise<void>
  exportProject: (format: 'pod' | 'mpp' | 'xml', filePath: string) => Promise<void>
  project: Project | null
  createProject: (name: string) => Promise<Project | null>
}

export interface TaskActions {
  createTask: (taskData: Omit<Task, 'id'>) => Promise<Task>
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>
  deleteTask: (id: string) => Promise<void>
  editTask: (id: string, updates: Partial<Task>) => Promise<Task>
  removeTask: (id: string) => Promise<void>
  findTask: (id: string) => Task | undefined
  filterTasksByStatus: (status: Task['status']) => Task[]
}

export interface ResourceActions {
  createResource: (resourceData: Omit<Resource, 'id'>) => Promise<Resource>
  updateResource: (id: string, updates: Partial<Resource>) => Promise<Resource>
  deleteResource: (id: string) => Promise<void>
  findResource: (id: string) => Resource | undefined
  filterResourcesByType: (type: Resource['type']) => Resource[]
  calculateUtilization: () => number
}

export interface AssignmentActions {
  createAssignment: (assignmentData: Omit<Assignment, 'id'>) => Promise<Assignment>
  updateAssignment: (id: string, updates: Partial<Assignment>) => Promise<Assignment>
  deleteAssignment: (id: string) => Promise<void>
  editAssignment: (id: string, updates: Partial<Assignment>) => Promise<Assignment>
  removeAssignment: (id: string) => Promise<void>
  findAssignment: (id: string) => Assignment | undefined
  validateAssignment: (assignment: Partial<Assignment>) => string | null
}

// Типы Project Context
export interface ProjectContextType {
  // Состояние
  project: Project | null
  tasks: Task[]
  resources: Resource[]
  assignments: Assignment[]

  // Загрузка
  isLoading: boolean
  error: string | null

  // Actions с конкретными типами
  projectActions: ProjectActions
  taskActions: TaskActions
  resourceActions: ResourceActions
  assignmentActions: AssignmentActions
}

// Типы для Theme Context
export interface ThemeContextType {
  theme: string
  setTheme: (theme: string) => void
}

// Типы для Toast Context
export interface ToastContextType {
  toasts: Array<{
    id: string
    title?: string
    description?: string
    action?: {
      label: string
      onClick: () => void
    }
  }>
  addToast: (toast: {
    title?: string
    description?: string
    action?: {
      label: string
      onClick: () => void
    }
  }) => void
  removeToast: (id: string) => void
}

// Пропсы для провайдеров
export interface ProjectProviderProps {
  children: ReactNode
}

export interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: string
  storageKey?: string
}
