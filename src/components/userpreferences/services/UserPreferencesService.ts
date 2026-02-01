import {
  IUserPreferences,
  IGeneralPreferences,
  IDisplayPreferences,
  IEditingPreferences,
  ICalculationPreferences,
  ISecurityPreferences,
  ISchedulePreferences,
  ICalendarPreferences,
  IGanttPreferences,
  PreferencesCategory,
  IPreferencesChangeEvent,
} from '../interfaces/UserPreferencesInterfaces'
import { PreferencesStorage } from './PreferencesStorage'
import { PreferencesDefaultsFactory } from './PreferencesDefaultsFactory'
import { PreferencesValidator } from './PreferencesValidator'

/**
 * Основной сервис пользовательских настроек (Слой Application/Domain).
 * Реализует паттерн Singleton и SOLID принципы.
 * Управляет состоянием настроек и координирует их сохранение.
 */
export class UserPreferencesService {
  private static instance: UserPreferencesService
  private listeners: Set<(event: IPreferencesChangeEvent) => void> = new Set()
  private initializationPromise: Promise<void> | null = null
  private preferences: IUserPreferences = PreferencesDefaultsFactory.createAllDefaults()
  private initialized: boolean = false

  private constructor() {
    this.initializationPromise = this.loadPreferences().then(() => {
      this.initialized = true
    })
  }

  public static getInstance(): UserPreferencesService {
    if (!UserPreferencesService.instance) {
      UserPreferencesService.instance = new UserPreferencesService()
    }
    return UserPreferencesService.instance
  }

  public async ensureInitialized(): Promise<void> { await this.initializationPromise }
  public isReady(): boolean { return this.initialized }

  public getPreferences(): IUserPreferences { return { ...this.preferences } }
  public getGeneralPreferences(): IGeneralPreferences { return { ...this.preferences.general } }
  public getDisplayPreferences(): IDisplayPreferences { return { ...this.preferences.display } }
  public getEditingPreferences(): IEditingPreferences { return { ...this.preferences.editing } }
  public getCalculationPreferences(): ICalculationPreferences { return { ...this.preferences.calculations } }
  public getSecurityPreferences(): ISecurityPreferences { return { ...this.preferences.security } }
  public getSchedulePreferences(): ISchedulePreferences { return { ...this.preferences.schedule } }
  public getCalendarPreferences(): ICalendarPreferences { return { ...this.preferences.calendar } }
  public getGanttPreferences(): IGanttPreferences { return { ...this.preferences.gantt } }

  // Методы совместимости для UI компонентов
  public async updateGeneralPreferences(u: Partial<IGeneralPreferences>) { await this.updateCategory('general', u) }
  public async updateDisplayPreferences(u: Partial<IDisplayPreferences>) { await this.updateCategory('display', u) }
  public async updateEditingPreferences(u: Partial<IEditingPreferences>) { await this.updateCategory('editing', u) }
  public async updateCalculationPreferences(u: Partial<ICalculationPreferences>) { await this.updateCategory('calculations', u) }
  public async updateSecurityPreferences(u: Partial<ISecurityPreferences>) { await this.updateCategory('security', u) }
  public async updateSchedulePreferences(u: Partial<ISchedulePreferences>) { await this.updateCategory('schedule', u) }
  public async updateCalendarPreferences(u: Partial<ICalendarPreferences>) { await this.updateCategory('calendar', u) }
  public async updateGanttPreferences(u: Partial<IGanttPreferences>) { await this.updateCategory('gantt', u) }

  /**
   * Универсальный метод обновления настроек любой категории
   */
  public async updateCategory<K extends keyof IUserPreferences>(
    category: K,
    updates: Partial<IUserPreferences[K]>,
  ): Promise<void> {
    const oldVal = { ...this.preferences[category] }
    const newVal = { ...this.preferences[category], ...updates }

    if (!this.validate(category, newVal)) {
      throw new Error(`Invalid preferences for category: ${category}`)
    }

    this.preferences[category] = newVal
    this.notifyListeners({
      category: category as PreferencesCategory,
      key: category,
      oldValue: oldVal,
      newValue: this.preferences[category],
    })

    await this.savePreferences()
  }

  /**
   * Сброс настроек
   */
  public async resetToDefaults(category?: PreferencesCategory): Promise<void> {
    const old = { ...this.preferences }
    if (category) {
      this.resetCategory(category)
    } else {
      this.preferences = PreferencesDefaultsFactory.createAllDefaults()
    }

    await this.savePreferences()
    this.notifyListeners({
      category: category || PreferencesCategory.GENERAL,
      key: 'reset',
      oldValue: old,
      newValue: this.preferences,
    })
  }

  public async flush(): Promise<void> { await this.savePreferences() }

  public subscribe(listener: (event: IPreferencesChangeEvent) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private async loadPreferences(): Promise<void> {
    try {
      const stored = await PreferencesStorage.load()
      if (stored) {
        this.preferences = { ...this.preferences, ...stored }
        this.notifyListeners({
          category: PreferencesCategory.GENERAL,
          key: 'load',
          oldValue: null,
          newValue: this.preferences,
        })
      }
    } catch (e) {
      console.warn('[UserPreferencesService] Load failed:', e)
    }
  }

  private async savePreferences(): Promise<void> {
    try {
      await PreferencesStorage.save(this.preferences)
      // Синхронизация с Java теперь выполняется только через RecalculationEngine
      // для предотвращения шторма запросов и обеспечения дебаунса.
    } catch (e) {
      console.error('[UserPreferencesService] Local save failed:', e)
    }
  }

  private validate(category: keyof IUserPreferences, data: IUserPreferences[keyof IUserPreferences]): boolean {
    switch (category) {
      case 'general': return PreferencesValidator.validateGeneral(data)
      case 'display': return PreferencesValidator.validateDisplay(data)
      case 'editing': return PreferencesValidator.validateEditing(data)
      case 'calculations': return PreferencesValidator.validateCalculations(data)
      case 'security': return PreferencesValidator.validateSecurity(data)
      case 'schedule': return PreferencesValidator.validateSchedule(data)
      case 'calendar': return PreferencesValidator.validateCalendar(data)
      case 'gantt': return PreferencesValidator.validateGantt(data)
      default: return true
    }
  }

  private resetCategory(cat: PreferencesCategory): void {
    const factory = PreferencesDefaultsFactory
    const mapping: Record<PreferencesCategory, () => void> = {
      [PreferencesCategory.GENERAL]: () => this.preferences.general = factory.getGeneralPreferences(),
      [PreferencesCategory.DISPLAY]: () => this.preferences.display = factory.getDisplayPreferences(),
      [PreferencesCategory.EDITING]: () => this.preferences.editing = factory.getEditingPreferences(),
      [PreferencesCategory.CALCULATIONS]: () => this.preferences.calculations = factory.getCalculationPreferences(),
      [PreferencesCategory.SECURITY]: () => this.preferences.security = factory.getSecurityPreferences(),
      [PreferencesCategory.SCHEDULE]: () => this.preferences.schedule = factory.getSchedulePreferences(),
      [PreferencesCategory.CALENDAR]: () => this.preferences.calendar = factory.getCalendarPreferences(),
      [PreferencesCategory.GANTT]: () => this.preferences.gantt = factory.getGanttPreferences(),
    }
    mapping[cat]?.()
  }

  private notifyListeners(event: IPreferencesChangeEvent): void {
    this.listeners.forEach(l => { try { l(event) } catch (e) {} })
  }

  public async importPreferences(data: string): Promise<void> {
    try {
      const imported = JSON.parse(data)
      if (imported && typeof imported === 'object') {
        this.preferences = { ...this.preferences, ...imported }
        await this.savePreferences()
        this.notifyListeners({ category: PreferencesCategory.GENERAL, key: 'import', oldValue: null, newValue: this.preferences })
      }
    } catch (e) { throw new Error('Failed to import preferences') }
  }

  public exportPreferences(): string { return JSON.stringify(this.preferences, null, 2) }
}

