import { BaseJavaService } from './BaseJavaService'
import type {
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from '@/types/api/request-types'
import type {
  DataResponse,
  ProjectResponse,
  ProjectsListResponse,
  ProjectDataResponse,
  ExportResponse,
  ImportResponse,
} from '@/types/api/response-types'

/**
 * Сервис для работы с проектами в Java-ядре.
 * Изолирует логику управления проектами.
 */
export class ProjectJavaService extends BaseJavaService {
  public async createProject(data: ProjectCreateRequest): Promise<DataResponse<ProjectResponse>> {
    return await this.executeApiCommand('project.create', [data])
  }

  public async getProject(id: string): Promise<DataResponse<ProjectResponse>> {
    return await this.executeApiCommand('project.get', [id])
  }

  public async updateProject(id: string, updates: ProjectUpdateRequest): Promise<DataResponse<ProjectResponse>> {
    return await this.executeApiCommand('project.update', [id, updates])
  }

  public async deleteProject(id: string): Promise<DataResponse<void>> {
    return await this.executeApiCommand('project.delete', [id])
  }

  public async getAllProjects(): Promise<DataResponse<ProjectsListResponse>> {
    return await this.executeApiCommand('project.list')
  }

  /** Возвращает payload (ProjectDataResponse) напрямую — executeApiCommand отдаёт result.data. */
  public async recalculateProject(id: string): Promise<ProjectDataResponse | undefined> {
    return await this.executeApiCommand<ProjectDataResponse>('project.recalculate', [id])
  }

  public async exportProject(id: string, format: string): Promise<DataResponse<ExportResponse>> {
    return await this.executeApiCommand('project.export', [id, format])
  }

  public async importProject(filePath: string): Promise<DataResponse<ImportResponse>> {
    return await this.executeApiCommand('project.import', [filePath])
  }
}

