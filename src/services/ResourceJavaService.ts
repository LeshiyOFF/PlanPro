import { BaseJavaService } from './BaseJavaService';
import type {
  ResourceCreateRequest,
  ResourceUpdateRequest,
  CalendarUpdateRequest
} from '@/types/api/request-types';
import type {
  DataResponse,
  ResourceResponse,
  ResourcesListResponse,
  CalendarResponse,
  ReportResponse
} from '@/types/api/response-types';

/**
 * Сервис для управления ресурсами и календарями в Java-ядре.
 */
export class ResourceJavaService extends BaseJavaService {
  public async createResource(data: ResourceCreateRequest): Promise<DataResponse<ResourceResponse>> {
    return await this.executeApiCommand('resource.create', [data]);
  }

  public async getResource(id: string): Promise<DataResponse<ResourceResponse>> {
    return await this.executeApiCommand('resource.get', [id]);
  }

  public async updateResource(id: string, updates: ResourceUpdateRequest): Promise<DataResponse<ResourceResponse>> {
    return await this.executeApiCommand('resource.update', [id, updates]);
  }

  public async deleteResource(id: string): Promise<DataResponse<void>> {
    return await this.executeApiCommand('resource.delete', [id]);
  }

  public async getAllResources(): Promise<DataResponse<ResourcesListResponse>> {
    return await this.executeApiCommand('resource.list');
  }

  public async getProjectCalendar(projectId: string): Promise<DataResponse<CalendarResponse>> {
    return await this.executeApiCommand('calendar.getProject', [projectId]);
  }

  public async getResourceCalendar(resourceId: string): Promise<DataResponse<CalendarResponse>> {
    return await this.executeApiCommand('calendar.getResource', [resourceId]);
  }

  public async updateWorkingCalendar(data: CalendarUpdateRequest): Promise<DataResponse<CalendarResponse>> {
    return await this.executeApiCommand('calendar.update', [data]);
  }

  public async generateProjectReport(projectId: string, type: string): Promise<DataResponse<ReportResponse>> {
    return await this.executeApiCommand('report.generate', [projectId, type]);
  }
}
