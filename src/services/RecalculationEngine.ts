import { UserPreferencesService } from '../components/userpreferences/services/UserPreferencesService'
import { PreferencesCategory, IPreferencesChangeEvent } from '../components/userpreferences/interfaces/UserPreferencesInterfaces'
import { useProjectStore } from '../store/projectStore'
import { TaskDataConverter } from './TaskDataConverter'
import { javaApiService } from './JavaApiService'
import { logger } from '../utils/logger'
import type { ConfigurationUpdateRequest } from '@/types/api/request-types'

/**
 * RecalculationEngine - механизм мгновенного пересчета проекта при изменении настроек.
 * Реализует паттерн Observer, подписываясь на изменения UserPreferencesService.
 * Следует принципам SOLID: SRP (только пересчет), DIP (зависит от абстракций).
 */
export class RecalculationEngine {
  private static instance: RecalculationEngine
  private isRecalculating: boolean = false
  private debounceTimer: NodeJS.Timeout | null = null

  private constructor() {
    this.initialize()
  }

  /**
   * Получение singleton экземпляра
   */
  public static getInstance(): RecalculationEngine {
    if (!RecalculationEngine.instance) {
      RecalculationEngine.instance = new RecalculationEngine()
    }
    return RecalculationEngine.instance
  }

  /**
   * Инициализация подписки на настройки
   */
  private initialize(): void {
    UserPreferencesService.getInstance().subscribe((event) => {
      this.handlePreferencesChange(event)
    })
    logger.info('RecalculationEngine initialized and subscribed to preferences')
  }

  /**
   * Обработка изменений настроек
   */
  private async handlePreferencesChange(event: IPreferencesChangeEvent): Promise<void> {
    // Критические категории, требующие пересчета проекта.
    // EDITING исключен - переключение галочек редактирования не требует математического пересчета.
    const criticalCategories = [
      PreferencesCategory.CALENDAR,
      PreferencesCategory.SCHEDULE,
      PreferencesCategory.CALCULATIONS,
    ]

    // Всегда синхронизируем с Java при любом изменении (кроме внутренних событий загрузки/импорта)
    // Но делаем это с дебаунсом, чтобы не перегружать мост.
    const internalEvents = ['load', 'import', 'reset']
    if (!internalEvents.includes(event.key)) {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }

      this.debounceTimer = setTimeout(async () => {
        this.debounceTimer = null

        // 1. Синхронизируем конфигурацию с Java
        const preferences = UserPreferencesService.getInstance().getPreferences()
        try {
          const configRequest: ConfigurationUpdateRequest = {
            display: {
              theme: preferences.display.theme === 'dark' ? 'dark' : preferences.display.theme === 'light' ? 'light' : 'system',
            },
          }
          await javaApiService.updateConfiguration(configRequest, true)
        } catch (error) {
          logger.error('Failed to sync preferences to Java:', error instanceof Error ? error : String(error))
        }

        // 2. Если категория критическая — запускаем пересчет
        if (criticalCategories.includes(event.category)) {
          logger.info(`Critical preference change detected in ${event.category}, triggering recalculation...`)
          await this.recalculateProject()
        }
      }, 500) // Увеличим дебаунс до 500мс для надежности
    }
  }

  /**
   * Запуск процесса пересчета через Java Core
   */
  public async recalculateProject(): Promise<void> {
    if (this.isRecalculating) {
      logger.warn('Recalculation already in progress, skipping...')
      return
    }

    try {
      this.isRecalculating = true

      // Проверяем наличие открытого проекта (по наличию задач)
      const tasksCount = useProjectStore.getState().tasks.length
      if (tasksCount === 0) {
        logger.info('No project loaded (no tasks), skipping recalculation')
        return
      }

      logger.info('Starting project recalculation...')
      const projectId = useProjectStore.getState().currentProjectId
      if (projectId == null) {
        logger.warn('RecalculationEngine: currentProjectId is null, skipping recalculation')
        this.isRecalculating = false
        return
      }
      logger.info('[CriticalPathTrace] layer=frontend request (RecalculationEngine)', { projectId: String(projectId) }, 'CriticalPathTrace')

      // Вызываем пересчет проекта в Java Core (backend ожидает числовой ID проекта)
      const payload = await javaApiService.recalculateProject(String(projectId))
      if (payload?.tasks && payload.tasks.length > 0) {
        const payloadCriticalCount = payload.tasks.filter(t => t.critical === true).length
        logger.info('[CriticalPathTrace] layer=frontend api_response (RecalculationEngine)', {
          projectId: String(projectId ?? 'current'),
          taskCount: payload.tasks.length,
          criticalCount: payloadCriticalCount,
          criticalTaskIds: payload.tasks.filter(t => t.critical === true).map(t => t.id),
        }, 'CriticalPathTrace')
        TaskDataConverter.resetDateShiftLogCount()
        const frontendTasks = payload.tasks.map(t => TaskDataConverter.coreToFrontendTask(t))
        const frontendCriticalCount = frontendTasks.filter(t => t.isCritical === true || t.critical === true).length
        useProjectStore.getState().setTasks(frontendTasks)
        logger.info('[CriticalPathTrace] layer=frontend store_updated (RecalculationEngine)', {
          projectId: String(projectId ?? 'current'),
          taskCount: frontendTasks.length,
          criticalCount: frontendCriticalCount,
        }, 'CriticalPathTrace')
        logger.info('Project recalculated successfully and store updated')
      } else if (payload?.projectName) {
        logger.info(`Project '${payload.projectName}' recalculated successfully (no task updates needed)`)
      } else if (!payload) {
        logger.info('No project loaded in Java, preferences synced without recalculation')
      } else {
        logger.info('Recalculation completed')
      }
    } catch (error) {
      logger.error('Failed to recalculate project:', error instanceof Error ? error : String(error))

      // Fallback: если Java API недоступно, делаем базовый пересчет на фронте
      useProjectStore.getState().recalculateAllTasks()
    } finally {
      this.isRecalculating = false
    }
  }
}

