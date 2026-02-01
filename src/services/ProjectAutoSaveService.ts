import { useAppStore } from '../store/appStore'
import { useProjectStore } from '../store/projectStore'
import { javaApiService } from './JavaApiService'
import { TaskDataConverter } from './TaskDataConverter'
import { ResourceDataConverter } from './ResourceDataConverter'
import { logger } from '../utils/logger'

/**
 * Сервис автоматического сохранения проектов.
 * Реализует логику фонового таймера и проверки условий сохранения.
 * Следует принципам SOLID (SRP).
 */
export class ProjectAutoSaveService {
  private static instance: ProjectAutoSaveService
  private timer: NodeJS.Timeout | null = null
  private isRunning: boolean = false

  private constructor() {
    // Приватный конструктор для реализации Singleton
  }

  public static getInstance(): ProjectAutoSaveService {
    if (!ProjectAutoSaveService.instance) {
      ProjectAutoSaveService.instance = new ProjectAutoSaveService()
    }
    return ProjectAutoSaveService.instance
  }

  /**
   * Запуск мониторинга настроек и управление таймером.
   */
  public start(): void {
    if (this.isRunning) return
    this.isRunning = true

    // Подписываемся на изменения настроек автосохранения
    useAppStore.subscribe(
      (state) => ({
        enabled: state.preferences.general.autoSave,
        interval: state.preferences.general.autoSaveInterval,
      }),
      (prefs) => {
        this.handlePreferenceChange(prefs.enabled, prefs.interval)
      },
      { fireImmediately: true },
    )

    logger.info('ProjectAutoSaveService started')
  }

  /**
   * Остановка сервиса и очистка таймера.
   */
  public stop(): void {
    this.stopTimer()
    this.isRunning = false
    logger.info('ProjectAutoSaveService stopped')
  }

  private handlePreferenceChange(enabled: boolean, intervalMinutes: number): void {
    this.stopTimer()
    if (enabled && intervalMinutes > 0) {
      this.startTimer(intervalMinutes)
    }
  }

  private startTimer(minutes: number): void {
    const ms = minutes * 60 * 1000
    this.timer = setInterval(() => this.executeAutoSave(), ms)
    logger.debug(`Auto-save timer started: ${minutes} min`)
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  /**
   * Выполнение автосохранения при соблюдении всех условий.
   */
  private async executeAutoSave(): Promise<void> {
    const state = useAppStore.getState()
    const project = state.projects.current
    const hasChanges = state.projects.unsavedChanges

    if (!project || !hasChanges || state.projects.loading) {
      return
    }

    try {
      const projectId = project.id
      logger.info('Performing auto-save...', { projectId })

      const calendars = useProjectStore.getState().calendars ?? []
      const updates = {
        tasks: TaskDataConverter.frontendTasksToSync(project.tasks),
        resources: ResourceDataConverter.frontendResourcesToSync(project.resources, calendars),
      }
      await javaApiService.updateProject(projectId, updates)

      // Сбрасываем флаг изменений в сторе
      useAppStore.getState().setProjectState({ unsavedChanges: false })

      logger.info('Auto-save completed successfully')
    } catch (error) {
      logger.error('Auto-save failed', error instanceof Error ? error : String(error))
      // Мы не показываем ошибку пользователю при автосохранении,
      // чтобы не прерывать рабочий процесс, но фиксируем в логах.
    }
  }
}

