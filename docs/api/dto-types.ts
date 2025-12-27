// TypeScript DTO классы для ProjectLibre API
// Сгенерировано на основе OpenAPI 3.0 спецификации

export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate: string; // ISO 8601 format
  endDate?: string; // ISO 8601 format
  status: ProjectStatus;
  progress: number; // 0-100
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
  tasks?: Task[];
  resources?: Resource[];
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  startDate: string; // ISO 8601 format
  endDate?: string; // ISO 8601 format
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  endDate?: string; // ISO 8601 format
  status?: ProjectStatus;
  progress?: number; // 0-100
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  duration: number; // в часах
  startDate: string; // ISO 8601 format
  endDate?: string; // ISO 8601 format
  progress: number; // 0-100
  priority: TaskPriority;
  status: TaskStatus;
  dependencies: string[]; // task IDs
  assigneeId?: string; // resource ID
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}

export interface CreateTaskRequest {
  name: string;
  description?: string;
  duration: number; // в часах
  startDate: string; // ISO 8601 format
  priority?: TaskPriority;
  assigneeId?: string; // resource ID
  dependencies?: string[]; // task IDs
}

export interface UpdateTaskRequest {
  name?: string;
  description?: string;
  duration?: number; // в часах
  endDate?: string; // ISO 8601 format
  progress?: number; // 0-100
  priority?: TaskPriority;
  status?: TaskStatus;
  assigneeId?: string; // resource ID
}

export interface Resource {
  id: string;
  projectId: string;
  name: string;
  type: ResourceType;
  email?: string; // для HUMAN ресурсов
  capacity: number; // часов/день
  cost: number; // в час
  availability: ResourceAvailability;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}

export interface CreateResourceRequest {
  name: string;
  type: ResourceType;
  email?: string; // для HUMAN ресурсов
  capacity: number; // часов/День
  cost?: number; // в час
  availability?: ResourceAvailability;
}

export interface ImportResult {
  success: boolean;
  projectId: string;
  warnings?: string[];
  errors?: string[];
  importedTasksCount: number;
  importedResourcesCount: number;
}

export interface Error {
  code: string;
  message: string;
  details?: {
    field?: string;
    value?: any;
  };
}

// Enums
export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED'
}

export enum TaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ResourceType {
  HUMAN = 'HUMAN',
  MATERIAL = 'MATERIAL',
  EQUIPMENT = 'EQUIPMENT',
  FACILITY = 'FACILITY'
}

export interface ResourceAvailability {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: Error;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// File Upload Types
export interface FileImportRequest {
  file: File;
  format: 'pod' | 'mpp' | 'xml';
}

// Export Types
export type ExportFormat = 'pod' | 'mpp' | 'xml' | 'pdf' | 'xlsx';

// API Configuration
export interface ApiConfig {
  baseUrl: string;
  token: string;
  timeout: number;
}

// Request Options
export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API Endpoints
export const API_ENDPOINTS = {
  PROJECTS: {
    LIST: '/api/v1/projects',
    CREATE: '/api/v1/projects',
    GET: (id: string) => `/api/v1/projects/${id}`,
    UPDATE: (id: string) => `/api/v1/projects/${id}`,
    DELETE: (id: string) => `/api/v1/projects/${id}`,
    SAVE: (id: string) => `/api/v1/projects/${id}/save`,
    EXPORT: (id: string) => `/api/v1/projects/${id}/export`,
    VALIDATE: (id: string) => `/api/v1/projects/${id}/validate`
  },
  TASKS: {
    LIST: (projectId: string) => `/api/v1/projects/${projectId}/tasks`,
    CREATE: (projectId: string) => `/api/v1/projects/${projectId}/tasks`,
    GET: (id: string) => `/api/v1/tasks/${id}`,
    UPDATE: (id: string) => `/api/v1/tasks/${id}`,
    DELETE: (id: string) => `/api/v1/tasks/${id}`,
    DEPENDENCIES: (id: string) => `/api/v1/tasks/${id}/dependencies`
  },
  RESOURCES: {
    LIST: (projectId: string) => `/api/v1/projects/${projectId}/resources`,
    CREATE: (projectId: string) => `/api/v1/projects/${projectId}/resources`,
    GET: (id: string) => `/api/v1/resources/${id}`,
    UPDATE: (id: string) => `/api/v1/resources/${id}`,
    DELETE: (id: string) => `/api/v1/resources/${id}`
  },
  IMPORT: '/api/v1/import'
} as const;