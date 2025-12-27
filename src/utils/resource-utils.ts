import type { Resource } from '@/types'

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
   * Создание mock ресурса
   */
  static createMockResource(data: Omit<Resource, 'id'>): Resource {
    return {
      id: Date.now().toString(),
      ...data,
    }
  }

  /**
   * Расчет загрузки ресурсов
   */
  static calculateUtilization(resources: Resource[]): number {
    if (resources.length === 0) return 0
    const totalCapacity = resources.reduce((sum, resource) => sum + resource.maxUnits, 0)
    // Используем максимальное количество если нет данных о текущем использовании
    const usedCapacity = Math.round(totalCapacity * 0.75) // mock: 75% utilization
    return totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0
  }
}
