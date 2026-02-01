import { Task, getTaskResourceIds } from '@/store/project/interfaces';
import { Resource } from '@/types/resource-types';

/**
 * CostDiagnosticService - Диагностика причин нулевых затрат
 * 
 * Помогает понять, почему трудозатраты или материалы равны 0.
 * 
 * Clean Architecture: Domain Service
 * SOLID: Single Responsibility - диагностика затрат
 * 
 * @version 1.0
 */
export class CostDiagnosticService {
  
  /**
   * Выполняет полную диагностику затрат проекта.
   */
  public diagnose(tasks: Task[], resources: Resource[]): CostDiagnosticResult {
    const workResources = resources.filter(r => r.type === 'Work');
    const materialResources = resources.filter(r => r.type === 'Material');
    
    return {
      summary: this.getSummary(tasks, resources),
      workResourceIssues: this.diagnoseWorkResources(workResources, tasks),
      materialResourceIssues: this.diagnoseMaterialResources(materialResources, tasks),
      assignmentIssues: this.diagnoseAssignments(tasks, resources)
    };
  }

  private getSummary(tasks: Task[], resources: Resource[]): DiagnosticSummary {
    const nonSummaryTasks = tasks.filter(t => !t.isSummary);
    const tasksWithAssignments = nonSummaryTasks.filter(t => 
      (t.resourceAssignments && t.resourceAssignments.length > 0) ||
      getTaskResourceIds(t).length > 0
    );
    const workResources = resources.filter(r => r.type === 'Work');
    const workWithRate = workResources.filter(r => r.standardRate > 0);
    
    return {
      totalTasks: nonSummaryTasks.length,
      tasksWithAssignments: tasksWithAssignments.length,
      totalWorkResources: workResources.length,
      workResourcesWithRate: workWithRate.length
    };
  }

  private diagnoseWorkResources(workResources: Resource[], tasks: Task[]): ResourceIssue[] {
    const issues: ResourceIssue[] = [];
    
    for (const resource of workResources) {
      if (!resource.standardRate || resource.standardRate <= 0) {
        issues.push({
          resourceId: resource.id,
          resourceName: resource.name,
          issue: 'NO_RATE',
          message: `Ресурс "${resource.name}" не имеет ставки (standardRate = 0)`
        });
      }
      
      const assignedTasks = this.getAssignedTasks(resource.id, tasks);
      if (assignedTasks.length === 0) {
        issues.push({
          resourceId: resource.id,
          resourceName: resource.name,
          issue: 'NO_ASSIGNMENTS',
          message: `Ресурс "${resource.name}" не назначен ни на одну задачу`
        });
      }
    }
    
    return issues;
  }

  private diagnoseMaterialResources(materialResources: Resource[], tasks: Task[]): ResourceIssue[] {
    const issues: ResourceIssue[] = [];
    
    for (const resource of materialResources) {
      const hasRate = resource.standardRate > 0;
      const hasCostPerUse = resource.costPerUse > 0;
      
      if (!hasRate && !hasCostPerUse) {
        issues.push({
          resourceId: resource.id,
          resourceName: resource.name,
          issue: 'NO_COST',
          message: `Материал "${resource.name}" не имеет ни ставки, ни стоимости за использование`
        });
      }
      
      const assignedTasks = this.getAssignedTasks(resource.id, tasks);
      if (assignedTasks.length === 0 && !hasCostPerUse) {
        issues.push({
          resourceId: resource.id,
          resourceName: resource.name,
          issue: 'NO_ASSIGNMENTS',
          message: `Материал "${resource.name}" не назначен ни на одну задачу`
        });
      }
    }
    
    return issues;
  }

  private diagnoseAssignments(tasks: Task[], resources: Resource[]): AssignmentIssue[] {
    const issues: AssignmentIssue[] = [];
    const resourceMap = new Map(resources.map(r => [r.id, r]));
    
    for (const task of tasks) {
      if (task.isSummary) continue;

      const allAssignmentIds = new Set<string>();
      task.resourceAssignments?.forEach((a: { resourceId: string }) => allAssignmentIds.add(a.resourceId));
      getTaskResourceIds(task).forEach((id: string) => allAssignmentIds.add(id));
      
      for (const resourceId of allAssignmentIds) {
        const resource = resourceMap.get(resourceId);
        if (!resource) {
          issues.push({
            taskId: task.id,
            taskName: task.name,
            resourceId,
            issue: 'ORPHAN_ASSIGNMENT',
            message: `Задача "${task.name}" ссылается на несуществующий ресурс ${resourceId}`
          });
        }
      }
    }
    
    return issues;
  }

  private getAssignedTasks(resourceId: string, tasks: Task[]): Task[] {
    return tasks.filter(t => {
      if (t.resourceAssignments?.some(a => a.resourceId === resourceId)) return true;
      if (getTaskResourceIds(t).includes(resourceId)) return true;
      return false;
    });
  }
}

export interface CostDiagnosticResult {
  summary: DiagnosticSummary;
  workResourceIssues: ResourceIssue[];
  materialResourceIssues: ResourceIssue[];
  assignmentIssues: AssignmentIssue[];
}

export interface DiagnosticSummary {
  totalTasks: number;
  tasksWithAssignments: number;
  totalWorkResources: number;
  workResourcesWithRate: number;
}

export interface ResourceIssue {
  resourceId: string;
  resourceName: string;
  issue: 'NO_RATE' | 'NO_COST' | 'NO_ASSIGNMENTS';
  message: string;
}

export interface AssignmentIssue {
  taskId: string;
  taskName: string;
  resourceId: string;
  issue: 'ORPHAN_ASSIGNMENT';
  message: string;
}
