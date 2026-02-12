import type { Project } from '@/types'

/**
 * Утилиты для работы с проектами
 */
export class ProjectUtils {
  /**
   * Создание проекта для тестов и разработки.
   * В production-потоке не использовать; для создания — ProjectAPIClient.createProject.
   *
   * Использует префикс MOCK- для отличия от реальных проектов.
   */
  static createMockProject(name: string, additionalData?: Partial<Project>): Project {
    const mockProject: Project = {
      id: `MOCK-${Date.now().toString(36)}`,
      name,
      description: '',
      start: new Date(),
      finish: new Date(),
      status: 'Planning',
      scheduleFrom: 'ProjectStart',
      priority: 'Normal',
      tasks: [],
      resources: [],
      assignments: [],
      ...additionalData,
    }
    return mockProject
  }

  /**
   * Валидация проекта
   */
  static validateProject(project: Project | null): asserts project is Project {
    if (!project) {
      throw new Error('Проект не найден')
    }
  }

  /**
   * Форматирование названия проекта для загрузки
   */
  static formatLoadedProjectName(filePath: string): string {
    return `Загруженный проект ${filePath}`
  }
}

