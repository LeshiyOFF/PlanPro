import type { Task } from '@/store/project/interfaces';
import type { Resource } from '@/types/resource-types';
import type { CoreTaskData, CoreResourceData } from '@/types/api/response-types';
import type { FrontendTaskData } from '@/types/api/request-types';

/**
 * Сервис конвертации данных задач между Core и Frontend форматами.
 * 
 * Принцип SRP: отвечает только за конвертацию данных.
 */
export class TaskDataConverter {
  
  /**
   * Конвертирует CoreTaskData из бэкенда в формат frontend Task.
   */
  static coreToFrontendTask(coreTask: CoreTaskData): Task {
    return {
      id: coreTask.id,
      name: coreTask.name || 'Unnamed Task',
      startDate: new Date(coreTask.startDate),
      endDate: new Date(coreTask.endDate),
      progress: coreTask.progress || 0,
      color: coreTask.color || '#4A90D9',
      level: coreTask.level || 0,
      summary: coreTask.summary || false,
      type: coreTask.type || 'TASK',
      children: coreTask.children || [],
      predecessors: coreTask.predecessors || [],
      resourceIds: coreTask.resourceIds || [],
      critical: coreTask.critical || false,
      milestone: coreTask.milestone || false,
      notes: coreTask.notes || ''
    };
  }
  
  /**
   * Конвертирует CoreResourceData из бэкенда в формат frontend Resource.
   */
  static coreToFrontendResource(coreResource: CoreResourceData): Resource {
    return {
      id: coreResource.id,
      name: coreResource.name || 'Unnamed Resource',
      type: (coreResource.type as 'Work' | 'Material' | 'Cost') || 'Work',
      maxUnits: coreResource.maxUnits || 1,
      standardRate: coreResource.standardRate || 0,
      overtimeRate: coreResource.overtimeRate || 0,
      costPerUse: coreResource.costPerUse || 0,
      email: coreResource.email || undefined,
      group: coreResource.group || undefined,
      available: coreResource.available ?? true
    };
  }
  
  /**
   * Конвертирует frontend Task в формат для синхронизации с Core.
   */
  static frontendTaskToSync(task: Task): FrontendTaskData {
    return {
      id: task.id,
      name: task.name || 'Unnamed Task',
      startDate: task.startDate.getTime(),
      endDate: task.endDate.getTime(),
      progress: task.progress || 0,
      level: task.level || 0,
      summary: task.summary || false,
      milestone: task.milestone || false,
      type: task.type || 'TASK',
      predecessors: task.predecessors || [],
      children: task.children || [],
      resourceIds: task.resourceIds || [],
      notes: task.notes || '',
      color: task.color || '#4A90D9'
    };
  }
  
  /**
   * Конвертирует массив frontend tasks в формат для синхронизации.
   */
  static frontendTasksToSync(tasks: Task[]): FrontendTaskData[] {
    return tasks.map(task => TaskDataConverter.frontendTaskToSync(task));
  }
}
