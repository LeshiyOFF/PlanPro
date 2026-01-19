import { BaseAPIClient, type APIClientConfig } from './BaseAPIClient';
import type { 
  FileSaveRequest, 
  FileSaveResponse, 
  FileLoadRequest, 
  FileLoadResponse, 
  FileListResponse,
  ProjectDataResponse,
  TaskSyncRequest,
  TaskSyncResponse
} from '@/types/api';
import type { FileAPI } from '@/types';

/**
 * FileAPIClient handles native .pod file operations.
 * Communicates with Java FileRestController.
 * Follows SOLID principles and Clean Architecture.
 */
export class FileAPIClient extends BaseAPIClient implements FileAPI {
  
  constructor(config?: APIClientConfig) {
    super({
      timeout: config?.timeout || 10000,
      ...config
    });
  }

  /**
   * Save project to a .pod file.
   */
  async saveProject(request: FileSaveRequest): Promise<FileSaveResponse> {
    try {
      // Очищаем запрос от лишних полей, оставляем только нужные для бэкенда
      const cleanRequest = {
        projectId: request.projectId,
        filePath: request.filePath,
        format: request.format || 'pod',
        createBackup: request.createBackup || false
      };
      
      console.log('[FileAPIClient] Saving project with request:', cleanRequest);
      
      const response = await this.post<FileSaveResponse>('/files/save', cleanRequest);
      console.log('[FileAPIClient] Save response:', response);
      return response.data;
    } catch (error) {
      console.error('[FileAPIClient] Save error:', error);
      throw this.handleFileError(error, 'Failed to save project');
    }
  }

  /**
   * Load project from a .pod file.
   */
  async loadProject(request: FileLoadRequest): Promise<FileLoadResponse> {
    try {
      // Очищаем запрос от лишних полей, оставляем только нужные для бэкенда
      const cleanRequest = {
        filePath: request.filePath,
        readOnly: request.readOnly || false
      };
      
      console.log('[FileAPIClient] Loading project with request:', cleanRequest);
      
      const response = await this.post<FileLoadResponse>('/files/load', cleanRequest);
      console.log('[FileAPIClient] Load response:', response);
      return response.data;
    } catch (error) {
      console.error('[FileAPIClient] Load error:', error);
      throw this.handleFileError(error, 'Failed to load project');
    }
  }

  /**
   * List all .pod projects in a directory.
   */
  async listFiles(directory?: string): Promise<FileListResponse> {
    try {
      const params = directory ? { directory } : {};
      const response = await this.get<FileListResponse>('/files/list', params);
      return response.data;
    } catch (error) {
      throw this.handleFileError(error, 'Failed to list project files');
    }
  }

  /**
   * Check if file exists.
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const response = await this.get<boolean>('/files/exists', { filePath });
      return response.data;
    } catch (error) {
      throw this.handleFileError(error, 'Failed to check file existence');
    }
  }

  /**
   * Get project data (tasks + resources) from Core model.
   * CRITICAL: This is the BRIDGE between Core and Frontend.
   * Called after loadProject() to retrieve actual task/resource data.
   * 
   * @param projectId - ID проекта из CoreProjectBridge
   * @returns ProjectDataResponse с tasks и resources
   */
  async getProjectData(projectId: number): Promise<ProjectDataResponse> {
    try {
      console.log('[FileAPIClient] Getting project data for projectId:', projectId);
      
      const response = await this.get<ProjectDataResponse>(`/files/project/${projectId}/data`);
      
      console.log('[FileAPIClient] Project data response:', {
        taskCount: response.data.taskCount,
        resourceCount: response.data.resourceCount
      });
      
      return response.data;
    } catch (error) {
      console.error('[FileAPIClient] GetProjectData error:', error);
      throw this.handleFileError(error, 'Failed to get project data');
    }
  }

  /**
   * Синхронизирует задачи из Frontend store в Core Project.
   * Должен вызываться ПЕРЕД saveProject() для сохранения изменений из UI.
   * 
   * @param request - Запрос с projectId и массивом задач
   * @returns Результат синхронизации
   */
  async syncTasksToCore(request: TaskSyncRequest): Promise<TaskSyncResponse> {
    try {
      console.log('[FileAPIClient] Syncing tasks to Core:', {
        projectId: request.projectId,
        taskCount: request.tasks.length
      });
      
      const response = await this.post<TaskSyncResponse>('/files/sync-tasks', request);
      
      console.log('[FileAPIClient] Sync response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[FileAPIClient] Sync error:', error);
      throw this.handleFileError(error, 'Failed to sync tasks');
    }
  }

  /**
   * Get format version.
   */
  async getVersion(): Promise<string> {
    try {
      const response = await this.get<string>('/files/version');
      return response.data;
    } catch (error) {
      throw this.handleFileError(error, 'Failed to get format version');
    }
  }

  /**
   * Centralized file error handling.
   */
  private handleFileError(error: unknown, context: string): Error {
    if (error instanceof Error) {
      return new Error(`${context}: ${error.message}`);
    }
    return new Error(`${context}: Unknown file operation error`);
  }
}

