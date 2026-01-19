import { BaseJavaService } from './BaseJavaService';
import type {
  TaskCreateRequest,
  TaskUpdateRequest
} from '@/types/api/request-types';
import type {
  DataResponse,
  TaskResponse,
  TasksListResponse,
  AssignmentResponse,
  AssignmentsListResponse
} from '@/types/api/response-types';

/**
 * Сервис для управления задачами и назначениями в Java-ядре.
 */
export class TaskJavaService extends BaseJavaService {
  public async createTask(projectId: string, data: TaskCreateRequest): Promise<DataResponse<TaskResponse>> {
    return await this.executeApiCommand('task.create', [projectId, data]);
  }

  public async getTask(id: string): Promise<DataResponse<TaskResponse>> {
    return await this.executeApiCommand('task.get', [id]);
  }

  public async updateTask(id: string, updates: TaskUpdateRequest): Promise<DataResponse<TaskResponse>> {
    return await this.executeApiCommand('task.update', [id, updates]);
  }

  public async deleteTask(id: string): Promise<DataResponse<void>> {
    return await this.executeApiCommand('task.delete', [id]);
  }

  public async getTasksByProject(projectId: string): Promise<DataResponse<TasksListResponse>> {
    return await this.executeApiCommand('task.listByProject', [projectId]);
  }

  public async assignTaskToResource(taskId: string, resourceId: string): Promise<DataResponse<AssignmentResponse>> {
    return await this.executeApiCommand('assignment.create', [taskId, resourceId]);
  }

  public async removeAssignment(taskId: string, resourceId: string): Promise<DataResponse<void>> {
    return await this.executeApiCommand('assignment.delete', [taskId, resourceId]);
  }

  public async getAssignmentsByTask(taskId: string): Promise<DataResponse<AssignmentsListResponse>> {
    return await this.executeApiCommand('assignment.listByTask', [taskId]);
  }
}

