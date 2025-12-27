import type { Project, Task, Resource, Assignment } from '@/types'
import type { ApiResponse, JavaExecutor } from '@/types/response-wrapper-types'

/**
 * Сервис управления проектом
 * Следует Single Responsibility Principle
 */
export class ProjectService {
  constructor(private api: JavaExecutor) {}

  /**
   * Создание нового проекта
   */
  async createProject(name: string): Promise<Project> {
    const response = await this.api.execute('project.create', [JSON.stringify(name)])
    return this.validateResponse(response) as Project
  }

  /**
   * Загрузка проекта
   */
  async loadProject(filePath: string): Promise<Project> {
    const response = await this.api.execute('project.open', [JSON.stringify(filePath)])
    return this.validateResponse(response) as Project
  }

  /**
   * Сохранение проекта
   */
  async saveProject(filePath?: string): Promise<void> {
    const response = await this.api.execute('project.save', [JSON.stringify(filePath || '')])
    this.validateResponse(response)
  }

  /**
   * Экспорт проекта
   */
  async exportProject(format: 'pod' | 'mpp' | 'xml', filePath: string): Promise<void> {
    const response = await this.api.execute('project.export', [JSON.stringify(format), JSON.stringify(filePath)])
    this.validateResponse(response)
  }

  /**
   * Создание задачи
   */
  async createTask(taskData: Omit<Task, 'id'>): Promise<Task> {
    const response = await this.api.execute('task.create', [JSON.stringify(taskData)])
    return this.validateResponse(response) as Task
  }

  /**
   * Обновление задачи
   */
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const response = await this.api.execute('task.update', [JSON.stringify(id), JSON.stringify(updates)])
    return this.validateResponse(response) as Task
  }

  /**
   * Удаление задачи
   */
  async deleteTask(id: string): Promise<void> {
    const response = await this.api.execute('task.delete', [JSON.stringify(id)])
    this.validateResponse(response)
  }

  /**
   * Создание ресурса
   */
  async createResource(resourceData: Omit<Resource, 'id'>): Promise<Resource> {
    const response = await this.api.execute('resource.create', [JSON.stringify(resourceData)])
    return this.validateResponse(response) as Resource
  }

  /**
   * Обновление ресурса
   */
  async updateResource(id: string, updates: Partial<Resource>): Promise<Resource> {
    const response = await this.api.execute('resource.update', [JSON.stringify(id), JSON.stringify(updates)])
    return this.validateResponse(response) as Resource
  }

  /**
   * Удаление ресурса
   */
  async deleteResource(id: string): Promise<void> {
    const response = await this.api.execute('resource.delete', [JSON.stringify(id)])
    this.validateResponse(response)
  }

  /**
   * Создание назначения
   */
  async createAssignment(assignmentData: Omit<Assignment, 'id'>): Promise<Assignment> {
    const response = await this.api.execute('assignment.create', [JSON.stringify(assignmentData)])
    return this.validateResponse(response) as Assignment
  }

  /**
   * Обновление назначения
   */
  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment> {
    const response = await this.api.execute('assignment.update', [JSON.stringify(id), JSON.stringify(updates)])
    return this.validateResponse(response) as Assignment
  }

  /**
   * Удаление назначения
   */
  async deleteAssignment(id: string): Promise<void> {
    const response = await this.api.execute('assignment.delete', [JSON.stringify(id)])
    this.validateResponse(response)
  }

  /**
   * Валидатор ответов API
   */
  private validateResponse<T>(response: ApiResponse<T>): T {
    if (!response.success || !('data' in response)) {
      throw new Error(response.error || 'Invalid API response')
    }
    return (response as any).data as T
  }
}
