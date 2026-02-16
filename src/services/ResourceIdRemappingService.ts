import type { Resource, Task, ResourceAssignment } from '@/store/project/interfaces'
import { logger } from '@/utils/logger'

/**
 * Сервис для ремаппинга ID ресурсов после синхронизации с Java Core.
 *
 * При создании новых ресурсов Frontend генерирует временные ID (RES-XXX),
 * а Java Core генерирует постоянные numeric ID. Этот сервис применяет
 * маппинг ко всем частям store для обеспечения консистентности.
 *
 * Clean Architecture: Application Service (Application Layer).
 * SOLID: Single Responsibility - только ремаппинг ID ресурсов.
 *
 * @author ProjectLibre Team
 * @version 1.0.0
 */
export class ResourceIdRemappingService {
  private static readonly LOG_TAG = '[ResourceIdRemapping]'

  /**
   * Применяет маппинг ID ресурсов ко всему store.
   *
   * Обновляет:
   * 1. resources[].id
   * 2. task.resourceAssignments[].resourceId
   *
   * @param resources текущие ресурсы
   * @param tasks текущие задачи
   * @param mapping маппинг Frontend ID → Core ID
   * @returns обновлённые ресурсы и задачи (immutable)
   */
  static applyMapping(
    resources: Resource[],
    tasks: Task[],
    mapping: Record<string, string>,
  ): { updatedResources: Resource[]; updatedTasks: Task[] } {
    if (!mapping || Object.keys(mapping).length === 0) {
      logger.debug(`${this.LOG_TAG} No mapping to apply`)
      return { updatedResources: resources, updatedTasks: tasks }
    }

    logger.info(`${this.LOG_TAG} Applying ID mapping:`, mapping)

    const updatedResources = this.remapResourceIds(resources, mapping)
    const updatedTasks = this.remapAssignmentIds(tasks, mapping)

    const resourcesChanged = updatedResources !== resources
    const tasksChanged = updatedTasks !== tasks

    logger.info(
      `${this.LOG_TAG} ✅ Mapping applied: resources=${resourcesChanged}, tasks=${tasksChanged}`,
    )

    return { updatedResources, updatedTasks }
  }

  /**
   * Обновляет ID ресурсов по маппингу.
   * Возвращает новый массив если были изменения, иначе исходный.
   */
  private static remapResourceIds(
    resources: Resource[],
    mapping: Record<string, string>,
  ): Resource[] {
    let hasChanges = false
    const result = resources.map(resource => {
      const newId = mapping[resource.id]
      if (newId && newId !== resource.id) {
        hasChanges = true
        logger.debug(`${this.LOG_TAG} Resource ID: ${resource.id} → ${newId}`)
        return { ...resource, id: newId }
      }
      return resource
    })

    return hasChanges ? result : resources
  }

  /**
   * Обновляет resourceId в assignments по маппингу.
   * Возвращает новый массив если были изменения, иначе исходный.
   */
  private static remapAssignmentIds(
    tasks: Task[],
    mapping: Record<string, string>,
  ): Task[] {
    let hasChanges = false
    const result = tasks.map(task => {
      if (!task.resourceAssignments?.length) return task

      let taskChanged = false
      const updatedAssignments = task.resourceAssignments.map(assignment => {
        const normalizedId = String(assignment.resourceId)
        const newId = mapping[normalizedId]

        if (newId && newId !== normalizedId) {
          taskChanged = true
          logger.debug(
            `${this.LOG_TAG} Assignment in task ${task.id}: ${normalizedId} → ${newId}`,
          )
          return { ...assignment, resourceId: newId } as ResourceAssignment
        }
        return assignment
      })

      if (taskChanged) {
        hasChanges = true
        return { ...task, resourceAssignments: updatedAssignments }
      }
      return task
    })

    return hasChanges ? result : tasks
  }

  /**
   * Проверяет, есть ли в маппинге изменения для данных ресурсов/задач.
   * Полезно для оптимизации — не обновлять store если нет изменений.
   */
  static hasRelevantChanges(
    resources: Resource[],
    tasks: Task[],
    mapping: Record<string, string>,
  ): boolean {
    if (!mapping || Object.keys(mapping).length === 0) return false

    // Проверяем ресурсы
    for (const resource of resources) {
      if (mapping[resource.id]) return true
    }

    // Проверяем assignments
    for (const task of tasks) {
      if (!task.resourceAssignments) continue
      for (const assignment of task.resourceAssignments) {
        if (mapping[String(assignment.resourceId)]) return true
      }
    }

    return false
  }
}
