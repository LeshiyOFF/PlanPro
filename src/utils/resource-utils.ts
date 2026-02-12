import type { Resource } from '@/types'
import { ResourceIdGenerator } from '@/domain/resources/services/ResourceIdGenerator'

/**
 * Утилиты для работы с ресурсами
 */
export class ResourceUtils {
  /**
   * Поиск ресурса по ID
   */
  static findResource(resources: Resource[], id: string): Resource | undefined {
    return resources.find(resource => resource.id === id)
  }

  /**
   * Фильтрация ресурсов по типу
   */
  static filterResourcesByType(resources: Resource[], type: Resource['type']): Resource[] {
    return resources.filter(resource => resource.type === type)
  }

  /**
   * Валидация ресурса
   */
  static validateResource(resource: Partial<Resource>): string | null {
    if (!resource.name?.trim()) {
      return 'Название ресурса обязательно'
    }
    if (resource.maxUnits !== undefined && resource.maxUnits <= 0) {
      return 'Максимальное количество должно быть положительным числом'
    }
    if (resource.standardRate !== undefined && resource.standardRate < 0) {
      return 'Ставка не может быть отрицательной'
    }
    return null
  }

  /**
   * Создание ресурса для тестов и разработки.
   * В production-потоке не использовать.
   *
   * @param data Данные ресурса без ID
   * @param existingResources Массив существующих ресурсов для генерации уникального ID
   * @returns Ресурс с уникальным ID
   */
  static createMockResource(data: Omit<Resource, 'id'>, existingResources: Resource[] = []): Resource {
    return {
      id: ResourceIdGenerator.generate(existingResources),
      ...data,
    }
  }

  /**
   * Расчёт загрузки ресурсов (без данных о назначениях возвращает 0).
   */
  static calculateUtilization(resources: Resource[]): number {
    if (resources.length === 0) return 0
    const totalCapacity = resources.reduce((sum, resource) => sum + resource.maxUnits, 0)
    const usedCapacity = 0
    return totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0
  }
}

