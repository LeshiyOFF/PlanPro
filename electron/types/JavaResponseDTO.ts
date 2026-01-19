
/**
 * Базовый интерфейс ответа от Java API.
 */
export interface IJavaResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * DTO Проекта
 */
export interface IProjectDTO {
  id: string;
  name: string;
  creationDate: string;
  lastModified: string;
  taskCount: number;
  resourceCount: number;
}

/**
 * DTO Задачи
 */
export interface ITaskDTO {
  id: string;
  name: string;
  duration: number;
  startDate: string;
  endDate: string;
  percentComplete: number;
  priority: number;
  resourceIds: string[];
}

/**
 * DTO Ресурса
 */
export interface IResourceDTO {
  id: string;
  name: string;
  email?: string;
  type: 'WORK' | 'MATERIAL';
  standardRate: number;
}

