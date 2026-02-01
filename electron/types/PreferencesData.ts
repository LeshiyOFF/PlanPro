import type { JsonValue } from './JsonValue'

/**
 * Данные пользовательских настроек для IPC и хранилища.
 */
export type PreferencesData = Record<string, JsonValue>
