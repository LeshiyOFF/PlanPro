import type {
  ProjectCreateRequest,
  ProjectUpdateRequest,
  TaskCreateRequest,
  TaskUpdateRequest,
  ResourceCreateRequest,
  ResourceUpdateRequest,
  CalendarUpdateRequest,
  ConfigurationUpdateRequest,
  ReportGenerateRequest
} from '@/types/api/request-types';

import type {
  DataResponse,
  ProjectResponse,
  ProjectsListResponse,
  TaskResponse,
  TasksListResponse,
  ResourceResponse,
  ResourcesListResponse,
  AssignmentResponse,
  AssignmentsListResponse,
  CalendarResponse,
  ReportResponse,
  ExportResponse,
  ImportResponse,
  ConfigurationResponse,
  ApiStatusResponse,
  OperationResponse
} from '@/types/api/response-types';

/**
 * Интерфейс для Java API операций.
 * Определяет контракт взаимодействия с Java-бэкендом.
 * Соблюдает SOLID: Interface Segregation Principle.
 */
export interface IJavaApiService {
  // Project operations
  createProject(projectData: ProjectCreateRequest): Promise<DataResponse<ProjectResponse>>;
  getProject(projectId: string): Promise<DataResponse<ProjectResponse>>;
  updateProject(projectId: string, updates: ProjectUpdateRequest): Promise<DataResponse<ProjectResponse>>;
  deleteProject(projectId: string): Promise<DataResponse<void>>;
  getAllProjects(): Promise<DataResponse<ProjectsListResponse>>;
  recalculateProject(projectId: string): Promise<DataResponse<OperationResponse>>;
  
  // Task operations
  createTask(projectId: string, taskData: TaskCreateRequest): Promise<DataResponse<TaskResponse>>;
  getTask(taskId: string): Promise<DataResponse<TaskResponse>>;
  updateTask(taskId: string, updates: TaskUpdateRequest): Promise<DataResponse<TaskResponse>>;
  deleteTask(taskId: string): Promise<DataResponse<void>>;
  getTasksByProject(projectId: string): Promise<DataResponse<TasksListResponse>>;
  
  // Resource operations
  createResource(resourceData: ResourceCreateRequest): Promise<DataResponse<ResourceResponse>>;
  getResource(resourceId: string): Promise<DataResponse<ResourceResponse>>;
  updateResource(resourceId: string, updates: ResourceUpdateRequest): Promise<DataResponse<ResourceResponse>>;
  deleteResource(resourceId: string): Promise<DataResponse<void>>;
  getAllResources(): Promise<DataResponse<ResourcesListResponse>>;
  
  // Assignment operations
  assignTaskToResource(taskId: string, resourceId: string): Promise<DataResponse<AssignmentResponse>>;
  removeAssignment(taskId: string, resourceId: string): Promise<DataResponse<void>>;
  getAssignmentsByTask(taskId: string): Promise<DataResponse<AssignmentsListResponse>>;
  
  // Calendar operations
  getProjectCalendar(projectId: string): Promise<DataResponse<CalendarResponse>>;
  getResourceCalendar(resourceId: string): Promise<DataResponse<CalendarResponse>>;
  updateWorkingCalendar(calendarData: CalendarUpdateRequest): Promise<DataResponse<CalendarResponse>>;
  
  // Reports operations
  generateProjectReport(projectId: string, reportType: string): Promise<DataResponse<ReportResponse>>;
  exportProject(projectId: string, format: string): Promise<DataResponse<ExportResponse>>;
  importProject(filePath: string): Promise<DataResponse<ImportResponse>>;
  
  // Configuration operations
  updateConfiguration(config: ConfigurationUpdateRequest, silent?: boolean): Promise<DataResponse<ConfigurationResponse>>;
  
  // General API operations
  ping(): Promise<boolean>;
  getVersion(): Promise<string>;
  getApiStatus(): Promise<DataResponse<ApiStatusResponse>>;
}

