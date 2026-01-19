import { Resource } from '@/types';
import { UserPreferences } from '@/types/Master_Functionality_Catalog';

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
   * @returns Полный объект ресурса с ID
   */
  public static createResource(
    data: Omit<Resource, 'id'>,
    preferences: UserPreferences
  ): Resource {
    const { defaultStandardRate, defaultOvertimeRate } = preferences.general;

    const resource: Resource = {
      ...data,
      id: Date.now().toString(),
      // Применяем дефолтные ставки, если они не заданы в data
      standardRate: this.getValueOrDefault(data.standardRate, defaultStandardRate),
      overtimeRate: this.getValueOrDefault(data.overtimeRate, defaultOvertimeRate),
    };

    return resource;
  }

  /**
   * Возвращает значение или дефолт, если значение не задано (undefined или 0).
   */
  private static getValueOrDefault(value: number | undefined, defaultValue: number): number {
    if (value === undefined || value === 0) {
      return defaultValue;
    }
    return value;
  }
}

