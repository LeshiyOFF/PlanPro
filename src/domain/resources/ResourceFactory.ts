import { Resource } from '@/types'
import { UserPreferences } from '@/types/Master_Functionality_Catalog'
import { ResourceIdGenerator } from '@/domain/resources/services/ResourceIdGenerator'

/**
 * Фабрика для создания объектов ресурсов.
 * Реализует логику инициализации ресурсов значениями по умолчанию из настроек пользователя.
 * Следует принципам SOLID (SRP) и Clean Architecture.
 */
export class ResourceFactory {
  /**
   * Создает новый объект ресурса.
   * Если ставки не указаны или равны нулю, используются значения из настроек.
   *
   * @param data Данные для создания ресурса (без ID)
   * @param preferences Настройки пользователя с дефолтными ставками
   * @param existingResources Массив существующих ресурсов для генерации уникального ID
   * @returns Полный объект ресурса с ID
   */
  public static createResource(
    data: Omit<Resource, 'id'>,
    preferences: UserPreferences,
    existingResources: ReadonlyArray<Resource> = [],
  ): Resource {
    const { defaultStandardRate } = preferences.general

    const resource: Resource = {
      ...data,
      id: ResourceIdGenerator.generate(existingResources),
      // Применяем дефолтную ставку, если она не задана в data
      standardRate: this.getValueOrDefault(data.standardRate, defaultStandardRate),
      overtimeRate: this.getValueOrDefault(data.overtimeRate, 0),
    }

    return resource
  }

  /**
   * Возвращает значение или дефолт, если значение не задано (undefined или 0).
   */
  private static getValueOrDefault(value: number | undefined, defaultValue: number): number {
    if (value === undefined || value === 0) {
      return defaultValue
    }
    return value
  }
}

