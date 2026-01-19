import { IJavaApiService } from './interfaces/IJavaApiService';
import { ProjectJavaService } from './ProjectJavaService';
import { TaskJavaService } from './TaskJavaService';
import { ResourceJavaService } from './ResourceJavaService';
import { ConfigJavaService } from './ConfigJavaService';
import type {
  ProjectCreateRequest,
  ProjectUpdateRequest,
  TaskCreateRequest,
  TaskUpdateRequest,
  ResourceCreateRequest,
  ResourceUpdateRequest,
  CalendarUpdateRequest,
  ConfigurationUpdateRequest
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
 * Фасадный сервис для работы с Java API.
 * Группирует специализированные сервисы для удобного использования.
 * Соблюдает SRP и ограничение в 200 строк через композицию.
 */
export class JavaApiService implements IJavaApiService {
  private readonly projectService = new ProjectJavaService();
  private readonly taskService = new TaskJavaService();
  private readonly resourceService = new ResourceJavaService();
  private readonly configService = new ConfigJavaService();

  // Project operations
  public createProject(data: ProjectCreateRequest): Promise<DataResponse<ProjectResponse>> {
    return this.projectService.createProject(data);
  }
  
  public getProject(id: string): Promise<DataResponse<ProjectResponse>> {
    return this.projectService.getProject(id);
  }
  
  public updateProject(id: string, updates: ProjectUpdateRequest): Promise<DataResponse<ProjectResponse>> {
    return this.projectService.updateProject(id, updates);
  }
  
  public deleteProject(id: string): Promise<DataResponse<void>> {
    return this.projectService.deleteProject(id);
  }
  
  public getAllProjects(): Promise<DataResponse<ProjectsListResponse>> {
    return this.projectService.getAllProjects();
  }
  
  public recalculateProject(id: string): Promise<DataResponse<OperationResponse>> {
    return this.projectService.recalculateProject(id);
  }
  
  public exportProject(id: string, format: string): Promise<DataResponse<ExportResponse>> {
    return this.projectService.exportProject(id, format);
  }
  
  public importProject(filePath: string): Promise<DataResponse<ImportResponse>> {
    return this.projectService.importProject(filePath);
  }

  // Task & Assignment operations
  public createTask(projectId: string, data: TaskCreateRequest): Promise<DataResponse<TaskResponse>> {
    return this.taskService.createTask(projectId, data);
  }
  
  public getTask(id: string): Promise<DataResponse<TaskResponse>> {
    return this.taskService.getTask(id);
  }
  
  public updateTask(id: string, updates: TaskUpdateRequest): Promise<DataResponse<TaskResponse>> {
    return this.taskService.updateTask(id, updates);
  }
  
  public deleteTask(id: string): Promise<DataResponse<void>> {
    return this.taskService.deleteTask(id);
  }
  
  public getTasksByProject(projectId: string): Promise<DataResponse<TasksListResponse>> {
    return this.taskService.getTasksByProject(projectId);
  }
  
  public assignTaskToResource(taskId: string, resourceId: string): Promise<DataResponse<AssignmentResponse>> {
    return this.taskService.assignTaskToResource(taskId, resourceId);
  }
  
  public removeAssignment(taskId: string, resourceId: string): Promise<DataResponse<void>> {
    return this.taskService.removeAssignment(taskId, resourceId);
  }
  
  public getAssignmentsByTask(taskId: string): Promise<DataResponse<AssignmentsListResponse>> {
    return this.taskService.getAssignmentsByTask(taskId);
  }

  // Resource & Calendar operations
  public createResource(data: ResourceCreateRequest): Promise<DataResponse<ResourceResponse>> {
    return this.resourceService.createResource(data);
  }
  
  public getResource(id: string): Promise<DataResponse<ResourceResponse>> {
    return this.resourceService.getResource(id);
  }
  
  public updateResource(id: string, updates: ResourceUpdateRequest): Promise<DataResponse<ResourceResponse>> {
    return this.resourceService.updateResource(id, updates);
  }
  
  public deleteResource(id: string): Promise<DataResponse<void>> {
    return this.resourceService.deleteResource(id);
  }
  
  public getAllResources(): Promise<DataResponse<ResourcesListResponse>> {
    return this.resourceService.getAllResources();
  }
  
  public getProjectCalendar(projectId: string): Promise<DataResponse<CalendarResponse>> {
    return this.resourceService.getProjectCalendar(projectId);
  }
  
  public getResourceCalendar(resourceId: string): Promise<DataResponse<CalendarResponse>> {
    return this.resourceService.getResourceCalendar(resourceId);
  }
  
  public updateWorkingCalendar(data: CalendarUpdateRequest): Promise<DataResponse<CalendarResponse>> {
    return this.resourceService.updateWorkingCalendar(data);
  }
  
  public generateProjectReport(projectId: string, reportType: string): Promise<DataResponse<ReportResponse>> {
    return this.resourceService.generateProjectReport(projectId, reportType);
  }

  // Configuration & System operations
  public updateConfiguration(config: ConfigurationUpdateRequest, silent?: boolean): Promise<DataResponse<ConfigurationResponse>> {
    return this.configService.updateConfiguration(config, silent);
  }
  
  public ping(): Promise<boolean> {
    return this.configService.ping();
  }
  
  public getVersion(): Promise<string> {
    return this.configService.getVersion();
  }
  
  public getApiStatus(): Promise<DataResponse<ApiStatusResponse>> {
    return this.configService.getApiStatus();
  }
}

export const javaApiService = new JavaApiService();

