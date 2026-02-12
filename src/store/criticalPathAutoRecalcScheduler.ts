/**
 * Планировщик отложенного перерасчёта критического пути при включённом «Пульс».
 * Вызывается из экшенов projectStore при изменении задач; по истечении дебаунса
 * проверяет isPulseActive, autoCalculate и currentProjectId и запускает recalculateCriticalPath.
 * Цикл импортов избегается за счёт динамического import() внутри колбэка.
 */

const CRITICAL_PATH_DEBOUNCE_MS = 600

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let recalcInProgress = false

/**
 * Выполняет перерасчёт критического пути с проверкой условий.
 * Использует async/await для линейного потока выполнения.
 */
async function runRecalcIfNeeded(): Promise<void> {
  if (recalcInProgress) return
  recalcInProgress = true

  try {
    // Проверяем настройку autoCalculate
    const { UserPreferencesService } = await import(
      '@/components/userpreferences/services/UserPreferencesService'
    )
    const prefs = UserPreferencesService.getInstance().getPreferences()
    if (prefs.editing?.autoCalculate === false) {
      return
    }

    // Проверяем isPulseActive
    const { useAppStore } = await import('@/store/appStore')
    if (!useAppStore.getState().ui.isPulseActive) {
      return
    }

    // Проверяем currentProjectId и запускаем перерасчёт
    const { useProjectStore } = await import('@/store/projectStore')
    const projectState = useProjectStore.getState()
    if (!projectState.currentProjectId) {
      return
    }

    await projectState.recalculateCriticalPath()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[criticalPathAutoRecalcScheduler]', message)
  } finally {
    recalcInProgress = false
  }
}

/**
 * Планирует один перерасчёт критического пути через DEBOUNCE_MS после последнего вызова.
 * Вызывать из экшенов projectStore при изменении задач (updateTask, addTask и т.д.).
 */
export function scheduleCriticalPathRecalcIfPulseActive(): void {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    runRecalcIfNeeded()
  }, CRITICAL_PATH_DEBOUNCE_MS)
}

/**
 * Отменяет запланированный перерасчёт. Вызывать при выключении «Пульс».
 */
export function cancelScheduledCriticalPathRecalc(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
}
